const express = require('express')
const router = express.Router()
const pool = require('../Db')

// Opret kort link
router.post('/shorten', async (req, res) => {
    const { originalUrl, custom_alias, expires_at } = req.body
    const user_id = req.userId

    try {
        const short_code = custom_alias || Math.random().toString(36).substring(2, 8)
        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code, user_id, expires_at, custom_alias) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [originalUrl, short_code, user_id, expires_at, custom_alias]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Error creating short URL:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Hent brugerens links
router.get('/my-links', async (req, res) => {
    const user_id = req.userId

    try {
        const result = await pool.query('SELECT * FROM urls WHERE user_id = $1', [user_id])
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

module.exports = router
