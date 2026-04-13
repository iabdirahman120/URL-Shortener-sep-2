const express = require('express') //importere express framework
const router = express.Router() //opretter mini server
const bcrypt = require('bcrypt') //importere bcrypt til at hashe password
const pool = require('../Db') //importere database forbindelse
const jwt = require('jsonwebtoken') //importere jsonwebtoken til at lave tokens

router.post('/register', async (req, res) => { //opretter route til register endpoint
    const { navn, email, password } = req.body //henter navn, email og password fra request body

    try {

        const hashedPassword = await bcrypt.hash(password, 10) //hashe password med bcrypt
        await pool.query('INSERT INTO users (navn, email, password_hash) VALUES ($1, $2, $3)', [navn, email, hashedPassword])
        //indsætter ny bruger i database

        res.status(201).json({ message: 'User registered successfully' }) //sender success besked tilbage til client

    } catch (error) {
        console.error('Error registering user:', error) //logger fejl hvis der er en
        res.status(500).json({ message: 'Internal server error' })
    } //sender fejl besked tilbage til client
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]) //henter bruger fra database baseret på email

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' }) //sender fejl besked hvis email ikke findes

        }
        const user = result.rows[0] //henter første række fra result som er brugeren
        const passwordMatch = await bcrypt.compare(password, user.password_hash)
        //sammenligner indtastet password med hashet password i database

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' }) //sender fejl besked hvis password ikke matcher
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }) //laver jwt token med bruger id og hemmelig nøgle fra env

        res.json({ token }) //sender token tilbage til client
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' }) //sender fejl besked tilbage til client hvis der er en fejl
    }

})




module.exports = router //eksporterer router så den kan bruges i index.js

