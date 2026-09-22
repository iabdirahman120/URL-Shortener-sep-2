const jwt = require('jsonwebtoken')
const pool = require('../Db')

/**
 * Godkender enten et login-token eller en API-noegle.
 *
 * Foer accepterede den kun JWT. Det betoed, at API'et slet ikke virkede:
 * noeglen blev lavet og vist i profilen, dokumentationen sagde
 * `Authorization: Bearer <noegle>`, og serveren svarede "Ugyldig token" hver
 * gang. Der var ingen vej fra en noegle til en bruger.
 *
 * Nu proeves JWT foerst, fordi det er det hyppigste og ikke koster et
 * databaseopslag. Fejler det, slaas vaerdien op som API-noegle. Rammer
 * ingen af delene, er det en rigtig fejl.
 */
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Ingen token, log ind først' })
    }

    // 1. Et almindeligt login-token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        return next()
    } catch {
        // Ikke et gyldigt JWT. Det kan stadig vaere en API-noegle.
    }

    // 2. En API-noegle fra profilen
    try {
        const result = await pool.query('SELECT id FROM users WHERE api_key = $1', [token])
        if (result.rows[0]) {
            req.userId = result.rows[0].id
            req.viaApiKey = true
            return next()
        }
    } catch (error) {
        console.error('Fejl ved opslag af API-nøgle:', error)
        return res.status(500).json({ message: 'Serverfejl' })
    }

    return res.status(401).json({ message: 'Ugyldig token eller API-nøgle' })
}

module.exports = verifyToken
