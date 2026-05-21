const pool = require('../Db')

const verifyAdmin = async (req, res, next) => {
    if (!req.userId) return res.status(401).json({ message: 'Ikke autoriseret' })
    try {
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.userId])
        if (!result.rows[0]?.is_admin) {
            return res.status(403).json({ message: 'Ingen adgang' })
        }
        next()
    } catch {
        res.status(500).json({ message: 'Serverfejl' })
    }
}

module.exports = verifyAdmin
