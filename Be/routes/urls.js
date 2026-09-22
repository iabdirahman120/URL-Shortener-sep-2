const express = require('express')
const router = express.Router()
const pool = require('../Db')
const bcrypt = require('bcrypt')
const verifyAdmin = require('../middleware/adminAuth')

function parseDevice(userAgent) {
    if (!userAgent) return 'Ukendt'
    const ua = userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'Mobil'
    if (/tablet/.test(ua)) return 'Tablet'
    return 'Desktop'
}

function parseReferrerHost(referrer) {
    if (!referrer) return 'Direkte'
    try {
        return new URL(referrer).hostname.replace('www.', '')
    } catch {
        return referrer.substring(0, 50)
    }
}

// Opret kort link. Alle med en konto.
router.post('/shorten', async (req, res) => {
    const { originalUrl, custom_alias, expires_at, password } = req.body
    const user_id = req.userId

    try {
        let normalizedUrl = (originalUrl || '').trim()
        if (!normalizedUrl) return res.status(400).json({ error: 'URL mangler.' })
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = 'https://' + normalizedUrl
        }
        try { new URL(normalizedUrl) } catch {
            return res.status(400).json({ error: 'Ugyldig URL.' })
        }

        const short_code = custom_alias || Math.random().toString(36).substring(2, 8)
        let password_hash = null
        if (password) {
            password_hash = await bcrypt.hash(password, 10)
        }

        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code, user_id, expires_at, custom_alias, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [normalizedUrl, short_code, user_id, expires_at || null, custom_alias || null, password_hash]
        )

        const row = result.rows[0]
        delete row.password_hash
        res.status(201).json(row)
    } catch (error) {
        console.error('Error creating short URL:', error)
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Det alias er allerede taget — vælg et andet.' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Hent alle links.
 *
 * Stien hedder stadig /my-links, fordi frontenden kalder den, men den
 * returnerer nu hele registret. Ejerens navn foelger med: naar alle ser alt,
 * skal man kunne se hvem der har lavet hvad.
 */
router.get('/my-links', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.original_url, u.short_code, u.user_id, u.clicks,
                    u.expires_at, u.custom_alias, u.created_at,
                    (u.password_hash IS NOT NULL) AS has_password,
                    b.navn AS ejer_navn
             FROM urls u
             LEFT JOIN users b ON b.id = u.user_id
             ORDER BY u.created_at DESC`
        )
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching user links:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Slet link. Sit eget, eller alt hvis man er administrator.
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        // En admin maa slette alt, en bruger kun sit eget. Uden det andet led
        // svarede kaldet OK, selv naar det ikke ramte noget, og linket blev
        // staaende, som om sletningen var gaaet igennem.
        const adm = await pool.query('SELECT is_admin FROM users WHERE id = $1', [user_id])
        const erAdmin = Boolean(adm.rows[0]?.is_admin)
        const svar = erAdmin
            ? await pool.query('DELETE FROM urls WHERE id = $1', [id])
            : await pool.query('DELETE FROM urls WHERE id = $1 AND user_id = $2', [id, user_id])
        if (svar.rowCount === 0) {
            return res.status(403).json({ error: 'Du kan kun slette dine egne links.' })
        }
        res.json({ message: 'Link deleted successfully' })
    } catch (error) {
        console.error('Error deleting link:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Rediger link
// Ret link. Sit eget, eller alt hvis man er administrator.
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId
    const { original_url, custom_alias } = req.body

    try {
        const adm = await pool.query('SELECT is_admin FROM users WHERE id = $1', [user_id])
        const check = adm.rows[0]?.is_admin
            ? await pool.query('SELECT id FROM urls WHERE id = $1', [id])
            : await pool.query('SELECT id FROM urls WHERE id = $1 AND user_id = $2', [id, user_id])
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Link ikke fundet' })
        }

        const result = await pool.query(
            'UPDATE urls SET original_url = COALESCE($1, original_url), short_code = COALESCE($2, short_code), custom_alias = COALESCE($2, custom_alias) WHERE id = $3 RETURNING id, original_url, short_code, user_id, clicks, expires_at, custom_alias, created_at',
            [original_url, custom_alias, id]
        )
        res.json(result.rows[0])
    } catch (error) {
        console.error('Error updating link:', error)
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Det alias er allerede taget — vælg et andet.' })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Klik-statistik per dag + enhed + referrer (seneste 30 dage)
router.get('/:id/stats', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        // Ingen ejer-betingelse: statistik er en se-handling, og alle maa se links.
        const check = await pool.query('SELECT id FROM urls WHERE id = $1', [id])
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Link ikke fundet' })
        }

        const [dailyResult, deviceResult, referrerResult] = await Promise.all([
            pool.query(
                `SELECT DATE(clicked_at) as date, COUNT(*) as clicks
                 FROM click_events
                 WHERE url_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
                 GROUP BY DATE(clicked_at)
                 ORDER BY DATE(clicked_at)`,
                [id]
            ),
            pool.query(
                `SELECT user_agent, COUNT(*) as count
                 FROM click_events
                 WHERE url_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
                 GROUP BY user_agent`,
                [id]
            ),
            pool.query(
                `SELECT referrer, COUNT(*) as count
                 FROM click_events
                 WHERE url_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
                 GROUP BY referrer
                 ORDER BY count DESC
                 LIMIT 5`,
                [id]
            )
        ])

        // Fyld huller med 0
        const today = new Date()
        const days = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            days.push(d.toISOString().split('T')[0])
        }

        const clickMap = {}
        dailyResult.rows.forEach(r => {
            clickMap[r.date.toISOString().split('T')[0]] = parseInt(r.clicks)
        })

        const daily = days.map(date => ({ date, clicks: clickMap[date] || 0 }))

        // Gruppér enheder
        const deviceMap = { Desktop: 0, Mobil: 0, Tablet: 0, Ukendt: 0 }
        deviceResult.rows.forEach(r => {
            const device = parseDevice(r.user_agent)
            deviceMap[device] = (deviceMap[device] || 0) + parseInt(r.count)
        })
        const devices = Object.entries(deviceMap)
            .filter(([, v]) => v > 0)
            .map(([name, count]) => ({ name, count }))

        // Top referrers
        const referrers = referrerResult.rows.map(r => ({
            source: parseReferrerHost(r.referrer),
            count: parseInt(r.count)
        }))

        res.json({ daily, devices, referrers })
    } catch (error) {
        console.error('Error fetching stats:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router
