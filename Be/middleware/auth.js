const jwt = require ('jsonwebtoken') //importere jsonwebtoken til at lave tokens

const verifyToken = (req, res, next) => { //middleware funktion til at verificere token
    const token= req.headers['authorization']?.split(' ')[1] //henter token fra authorization header

    if (!token) {
    return res.status(401).json({ message: 'Ingen token — log ind først' })
}

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) //verificere token med hemmelig nøgle fra env
    req.userId = decoded.userId //tilføjer userId til request objektet for at kunne bruge det i routes
    next() //kalder næste middleware eller route handler
} catch (error) {
    return res.status(401).json({ message: 'Ugyldig token' })
}
}

module.exports = verifyToken //eksporterer middleware så den kan bruges i routes der kræver autentificering