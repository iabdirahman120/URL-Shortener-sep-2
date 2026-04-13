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




module.exports = app

if (require.main === module) {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server kører på port ${PORT}`)
    })
}
