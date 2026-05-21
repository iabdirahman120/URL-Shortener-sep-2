const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const bcrypt = require('bcrypt')
const verifyToken = require('./middleware/auth')
const verifyAdmin = require('./middleware/adminAuth')
const urlRoutes = require('./routes/urls')
const authRoutes = require('./routes/auth')
const apiKeyRoutes = require('./routes/apikeys')
const subscriptionRoutes = require('./routes/subscription')
const adminRoutes = require('./routes/admin')

const app = express()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(cors())
app.use('/api/urls', verifyToken, urlRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/apikeys', verifyToken, apiKeyRoutes)
app.use('/api/subscription', (req, res, next) => {
    if (req.path === '/webhook') return next()
    return verifyToken(req, res, next)
}, subscriptionRoutes)
app.use('/api/admin', verifyToken, verifyAdmin, adminRoutes)

app.get('/', (req, res) => {
    res.send('Server kører!')
})

const pool = require('./Db')

app.get('/r/:short_code', async (req, res) => {
    const { short_code } = req.params

    try {
        const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code])

        if (result.rows.length === 0) {
            return res.redirect(302, '/not-found')
        }

        const url = result.rows[0]

        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            return res.redirect(302, '/not-found?reason=expired')
        }

        if (url.password_hash) {
            return res.redirect(302, `/password/${short_code}`)
        }

        const referrer = req.get('referer') || req.get('referrer') || null
        const userAgent = req.get('user-agent') || null

        await pool.query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [url.id])
        await pool.query(
            'INSERT INTO click_events (url_id, referrer, user_agent) VALUES ($1, $2, $3)',
            [url.id, referrer, userAgent]
        )

        res.redirect(url.original_url)
    } catch (error) {
        console.error('Redirect error:', error)
        res.redirect(302, '/not-found')
    }
})

app.post('/api/r/:short_code/verify', async (req, res) => {
    const { short_code } = req.params
    const { password } = req.body

    try {
        const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Link ikke fundet' })
        }

        const url = result.rows[0]

        if (!url.password_hash) {
            return res.json({ redirect_url: url.original_url })
        }

        const valid = await bcrypt.compare(password, url.password_hash)

        if (!valid) {
            return res.status(401).json({ error: 'Forkert adgangskode' })
        }

        const referrer = req.get('referer') || null
        const userAgent = req.get('user-agent') || null

        await pool.query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [url.id])
        await pool.query(
            'INSERT INTO click_events (url_id, referrer, user_agent) VALUES ($1, $2, $3)',
            [url.id, referrer, userAgent]
        )

        res.json({ redirect_url: url.original_url })
    } catch (error) {
        console.error('Password verify error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = app

if (require.main === module) {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server kører på port ${PORT}`)
    })
}
