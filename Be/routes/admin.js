const express = require('express')
const router = express.Router()
const pool = require('../Db')
const bcrypt = require('bcrypt')

// Samlet statistik
router.get('/stats', async (req, res) => {
    try {
        const [users, links, clicks] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM urls'),
            pool.query('SELECT COALESCE(SUM(clicks), 0) FROM urls'),
        ])
        res.json({
            total_users: parseInt(users.rows[0].count),
            total_links: parseInt(links.rows[0].count),
            total_clicks: parseInt(clicks.rows[0].coalesce),
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Alle brugere med stats
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.navn, u.email, u.is_pro, u.is_admin, u.created_at,
                   COUNT(l.id) AS link_count,
                   COALESCE(SUM(l.clicks), 0) AS total_clicks
            FROM users u
            LEFT JOIN urls l ON l.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `)
        res.json(result.rows)
    } catch (error) {
        console.error('Admin users error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Opret bruger (admin)
router.post('/users', async (req, res) => {
    const { navn, email, password, is_pro, is_admin } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'Email og adgangskode er påkrævet' })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            `INSERT INTO users (navn, email, password_hash, is_pro, is_admin)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, navn, email, is_pro, is_admin, created_at`,
            [navn || null, email, hashedPassword, is_pro === true, is_admin === true]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Emailen er allerede i brug' })
        }
        console.error('Admin create user error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Alle links med brugerinfo
router.get('/links', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.id, l.short_code, l.original_url, l.clicks, l.created_at, l.expires_at,
                   u.navn AS user_navn, u.email AS user_email
            FROM urls l
            LEFT JOIN users u ON u.id = l.user_id
            ORDER BY l.created_at DESC
            LIMIT 200
        `)
        res.json(result.rows)
    } catch (error) {
        console.error('Admin links error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Slet bruger + alle brugerens links
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params
    try {
        await pool.query('DELETE FROM urls WHERE user_id = $1', [id])
        await pool.query('DELETE FROM users WHERE id = $1', [id])
        res.json({ message: 'Bruger slettet' })
    } catch (error) {
        console.error('Admin delete user error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Slet link
router.delete('/links/:id', async (req, res) => {
    const { id } = req.params
    try {
        await pool.query('DELETE FROM urls WHERE id = $1', [id])
        res.json({ message: 'Link slettet' })
    } catch (error) {
        console.error('Admin delete link error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

// Skift Pro-status for bruger
router.patch('/users/:id/toggle-pro', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            'UPDATE users SET is_pro = NOT is_pro WHERE id = $1 RETURNING is_pro',
            [id]
        )
        res.json({ is_pro: result.rows[0].is_pro })
    } catch (error) {
        console.error('Admin toggle pro error:', error)
        res.status(500).json({ message: 'Serverfejl' })
    }
})

module.exports = router
