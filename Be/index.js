const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const verifyToken = require('./middleware/auth') //importere middleware til at verificere token
const urlRoutes = require('./routes/urls') //importere url routes




const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/urls', verifyToken, urlRoutes)

//importere auth routes of frotæller express bruge dem
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Server kører!')
})

app.listen(PORT, () => {
    console.log(`Server kører på port ${PORT}`)
})



