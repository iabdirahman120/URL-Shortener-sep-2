const express = require('express')
const router = express.Router()
const pool = require('../Db')
const crypto = require('crypto')

// Hent eller generer API-nøgle for bruger
router.get('/my-key', async (req, res) => {
    const user_id = req.userId
    try {
        const result = await pool.query('SELECT api_key FROM users WHERE id = $1', [user_id])
        const key = result.rows[0]?.api_key
        if (key) {
            return res.json({ api_key: key })
        }
        // Generer ny nøgle
        const newKey = 'shr_' + crypto.randomBytes(24).toString('hex')
        await pool.query('UPDATE users SET api_key = $1 WHERE id = $2', [newKey, user_id])
        res.json({ api_key: newKey })
    } catch (error) {
        console.error('API key error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Regenerer API-nøgle
router.post('/regenerate', async (req, res) => {
    const user_id = req.userId
    try {
        const newKey = 'shr_' + crypto.randomBytes(24).toString('hex')
        await pool.query('UPDATE users SET api_key = $1 WHERE id = $2', [newKey, user_id])
        res.json({ api_key: newKey })
    } catch (error) {
        console.error('Regenerate key error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router
