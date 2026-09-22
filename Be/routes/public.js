const express = require('express')
const router = express.Router()
const pool = require('../Db')

/**
 * Forkortelse uden konto.
 *
 * Forsiden lod folk skrive en adresse og sendte dem saa til login. Det er at
 * bede om noget, foer man har givet noget. Her faar de linket med det samme,
 * og bliver foerst derefter spurgt om en konto.
 *
 * Linket er aegte og virker permanent. Det er hele pointen: har man brugt
 * det ét sted, vil man gerne kunne se, hvor mange der klikkede, og dét
 * kraever en konto.
 *
 * `user_id` staar til null. Linket har ingen ejer og dukker derfor ikke op i
 * registret, hvor det ville staa uden afsender.
 */

/** Reserverede koder. Uden dem kunne nogen tage /login eller /api. */
const OPTAGET = new Set([
    'api', 'login', 'register', 'dashboard', 'admin', 'docs', 'settings',
    'privacy', 'terms', 'priser', 'password', 'r', 'not-found',
    'forgot-password', 'reset-password', 'assets', 'favicon.svg',
])

/**
 * Simpel graense pr. IP.
 *
 * Et aabent endpoint, der skriver i databasen, bliver fundet. Taelleren
 * ligger i hukommelsen og nulstilles ved genstart, hvilket er godt nok her:
 * formaalet er at stoppe et script, ikke at foere revisionsspor.
 */
const TAELLER = new Map()
const GRAENSE = 10
const VINDUE = 60 * 60 * 1000

function forMange(ip) {
    const nu = Date.now()
    const post = TAELLER.get(ip)
    if (!post || nu - post.start > VINDUE) {
        TAELLER.set(ip, { start: nu, antal: 1 })
        return false
    }
    post.antal += 1
    return post.antal > GRAENSE
}

router.post('/shorten', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'ukendt'
    if (forMange(ip)) {
        return res.status(429).json({
            error: 'Du har lavet en del links på kort tid. Opret en konto for at fortsætte.',
        })
    }

    let adresse = (req.body?.originalUrl || '').trim()
    if (!adresse) return res.status(400).json({ error: 'Skriv en adresse først.' })

    // Skriver man "eksempel.dk", er det stadig en adresse. Browseren skal
    // ikke afvise den, fordi der mangler https foran.
    if (!/^https?:\/\//i.test(adresse)) adresse = 'https://' + adresse

    let vaert
    try {
        vaert = new URL(adresse).hostname
    } catch {
        return res.status(400).json({ error: 'Det ligner ikke en adresse. Prøv fx eksempel.dk/side' })
    }
    // Et domaene skal have et punktum. Uden det er "abc" en gyldig URL for
    // browseren, men ikke en side, nogen kan besoege.
    if (!vaert.includes('.')) {
        return res.status(400).json({ error: 'Det ligner ikke en adresse. Prøv fx eksempel.dk/side' })
    }

    // Ingen selvvalgt kode uden konto. Ellers kan de korte, pæne koder
    // reserveres af hvem som helst paa et minut.
    for (let forsoeg = 0; forsoeg < 5; forsoeg++) {
        const kode = Math.random().toString(36).substring(2, 8)
        if (OPTAGET.has(kode)) continue
        try {
            const svar = await pool.query(
                'INSERT INTO urls (original_url, short_code, user_id) VALUES ($1, $2, NULL) RETURNING short_code',
                [adresse, kode]
            )
            return res.status(201).json({
                short_code: svar.rows[0].short_code,
                original_url: adresse,
            })
        } catch (error) {
            // 23505 er en kodekollision. Proev en ny kode.
            if (error.code === '23505') continue
            console.error('Fejl ved offentlig forkortelse:', error)
            return res.status(500).json({ error: 'Noget gik galt. Prøv igen om lidt.' })
        }
    }

    return res.status(500).json({ error: 'Kunne ikke finde en ledig kode. Prøv igen.' })
})

module.exports = router
