import { useState } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            if (res.ok) {
                setSent(true)
            } else {
                setError('Noget gik galt. Prøv igen.')
            }
        } catch {
            setError('Netværksfejl. Prøv igen.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Glemt adgangskode?</CardTitle>
                        <CardDescription>
                            {sent
                                ? 'Tjek din email for et reset-link.'
                                : 'Indtast din email og vi sender dig et link til at nulstille din adgangskode.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sent ? (
                            <div className="text-center space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Hvis <strong>{email}</strong> er registreret, vil du modtage et email inden for få minutter.
                                </p>
                                <Link to="/login">
                                    <Button variant="outline" className="w-full gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Tilbage til login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder="din@email.dk"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sender...' : 'Send reset-link'}
                                </Button>
                                <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Tilbage til login
                                </Link>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
