const express = require('express')
const router = express.Router()
const pool = require('../Db')

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY er ikke sat i .env')
    }
    return require('stripe')(process.env.STRIPE_SECRET_KEY)
}

// Start Stripe Checkout session (opretter betaling)
router.post('/checkout', async (req, res) => {
    const user_id = req.userId

    try {
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [user_id])
        const email = userResult.rows[0]?.email

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: email,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
            cancel_url: `${process.env.FRONTEND_URL}/#priser`,
            metadata: { user_id: String(user_id) },
        })

        res.json({ url: session.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        res.status(500).json({ message: 'Kunne ikke starte betaling' })
    }
})

// Hent subscription status for bruger
router.get('/status', async (req, res) => {
    const user_id = req.userId
    try {
        const result = await pool.query('SELECT is_pro FROM users WHERE id = $1', [user_id])
        res.json({ is_pro: result.rows[0]?.is_pro || false })
    } catch (error) {
        console.error('Subscription status error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

// Stripe webhook — opdaterer is_pro når betaling gennemføres
// VIGTIGT: denne route skal IKKE bruge verifyToken middleware
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature']

    let event
    try {
        event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        console.error('Webhook signature fejl:', err.message)
        return res.status(400).send(`Webhook fejl: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const user_id = session.metadata?.user_id
        if (user_id) {
            await pool.query('UPDATE users SET is_pro = true WHERE id = $1', [user_id])
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        // Find bruger via Stripe customer ID
        await pool.query('UPDATE users SET is_pro = false WHERE stripe_customer_id = $1', [subscription.customer])
    }

    res.json({ received: true })
})

module.exports = router
