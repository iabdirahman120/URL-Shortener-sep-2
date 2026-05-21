const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const pool = require('../Db')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

async function sendResetEmail(toEmail, resetUrl) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('=== RESET LINK (konfigurer SMTP i .env for at sende email) ===')
        console.log(resetUrl)
        console.log('=================================================================')
        return
    }
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: 'Nulstil din adgangskode — shr.dk',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#7c3aed">shr.dk</h2>
                <p>Du har bedt om at nulstille din adgangskode.</p>
                <p>Klik på knappen nedenfor — linket udløber om 1 time.</p>
                <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
                    Nulstil adgangskode
                </a>
                <p style="color:#6b7280;font-size:14px">Hvis du ikke bad om dette, kan du ignorere denne email.</p>
            </div>
        `
    })
}

router.post('/register', async (req, res) => {
    const { navn, email, password } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO users (navn, email, password_hash) VALUES ($1, $2, $3) RETURNING id, navn, email, is_admin',
            [navn, email, hashedPassword]
        )
        const user = result.rows[0]
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(201).json({ token, is_admin: user.is_admin || false, user })
    } catch (error) {
        console.error('Error registering user:', error)
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Emailen er allerede i brug.' })
        }
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Forkert email eller adgangskode.' })
        }
        const user = result.rows[0]
        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Forkert email eller adgangskode.' })
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, is_admin: user.is_admin || false })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    try {
        const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) {
            return res.json({ message: 'Hvis emailen findes, er et reset-link sendt.' })
        }
        const user = result.rows[0]
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id])
        await pool.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt]
        )

        const resetUrl = `https://shr.dk/reset-password?token=${token}`
        await sendResetEmail(user.email, resetUrl)

        res.json({ message: 'Hvis emailen findes, er et reset-link sendt.' })
    } catch (error) {
        console.error('Forgot password error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body
    try {
        const result = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
            [token]
        )
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Ugyldigt eller udløbet reset-link.' })
        }
        const resetToken = result.rows[0]
        const hashedPassword = await bcrypt.hash(password, 10)
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, resetToken.user_id])
        await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetToken.id])
        res.json({ message: 'Adgangskode opdateret.' })
    } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router
