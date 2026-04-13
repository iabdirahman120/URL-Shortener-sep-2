const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const verifyToken = require('./middleware/auth')
const urlRoutes = require('./routes/urls')
const authRoutes = require('./routes/auth')

const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/urls', verifyToken, urlRoutes)
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
    res.send('Server kører!')
})

const pool = require('./Db')

app.get('/r/:short_code', async (req, res) => {
    const { short_code } = req.params

    try {
        const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [short_code])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Link ikke fundet' })
        }

        const url = result.rows[0]

        await pool.query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [url.id])

        res.redirect(url.original_url)
    } catch (error) {
        console.error('Redirect error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})




module.exports = app

if (require.main === module) {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server kører på port ${PORT}`)
    })
}
