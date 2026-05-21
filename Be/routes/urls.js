const express = require('express')
const router = express.Router()
const pool = require('../Db')
const bcrypt = require('bcrypt')

// Opret kort link
router.post('/shorten', async (req, res) => {
    const { originalUrl, custom_alias, expires_at, password } = req.body
    const user_id = req.userId

    try {
        const short_code = custom_alias || Math.random().toString(36).substring(2, 8)
        let password_hash = null
        if (password) {
            password_hash = await bcrypt.hash(password, 10)
        }

        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code, user_id, expires_at, custom_alias, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [originalUrl, short_code, user_id, expires_at || null, custom_alias || null, password_hash]
        )

        const row = result.rows[0]
        // Returner ikke password_hash til klienten
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

// Hent brugerens links
router.get('/my-links', async (req, res) => {
    const user_id = req.userId

    try {
        const result = await pool.query(
            'SELECT id, original_url, short_code, user_id, clicks, expires_at, custom_alias, created_at, (password_hash IS NOT NULL) as has_password FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        )
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching user links:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Slet link
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        await pool.query('DELETE FROM urls WHERE id = $1 AND user_id = $2', [id, user_id])
        res.json({ message: 'Link deleted successfully' })
    } catch (error) {
        console.error('Error deleting link:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Rediger link
router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId
    const { original_url, custom_alias } = req.body

    try {
        const check = await pool.query('SELECT id FROM urls WHERE id = $1 AND user_id = $2', [id, user_id])
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Link ikke fundet' })
        }

        const result = await pool.query(
            'UPDATE urls SET original_url = COALESCE($1, original_url), short_code = COALESCE($2, short_code), custom_alias = COALESCE($2, custom_alias) WHERE id = $3 AND user_id = $4 RETURNING id, original_url, short_code, user_id, clicks, expires_at, custom_alias, created_at',
            [original_url, custom_alias, id, user_id]
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

// Klik-statistik per dag (seneste 30 dage)
router.get('/:id/stats', async (req, res) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        const check = await pool.query('SELECT id FROM urls WHERE id = $1 AND user_id = $2', [id, user_id])
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Link ikke fundet' })
        }

        const result = await pool.query(
            `SELECT DATE(clicked_at) as date, COUNT(*) as clicks
             FROM click_events
             WHERE url_id = $1
               AND clicked_at >= NOW() - INTERVAL '30 days'
             GROUP BY DATE(clicked_at)
             ORDER BY DATE(clicked_at)`,
            [id]
        )

        // Fyld huller (dage uden klik) med 0
        const today = new Date()
        const days = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            days.push(dateStr)
        }

        const clickMap = {}
        result.rows.forEach(r => {
            clickMap[r.date.toISOString().split('T')[0]] = parseInt(r.clicks)
        })

        const stats = days.map(date => ({
            date,
            clicks: clickMap[date] || 0
        }))

        res.json(stats)
    } catch (error) {
        console.error('Error fetching stats:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router
