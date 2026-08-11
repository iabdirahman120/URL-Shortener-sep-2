import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()
        setLoading(false)

        if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false')
            navigate('/dashboard')
        } else {
            setError(data.message || 'Forkert email eller adgangskode.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Velkommen tilbage</CardTitle>
                        <CardDescription>Log ind på din konto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="din@email.dk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Adgangskode</Label>
                                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                        Glemt adgangskode?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Logger ind...' : 'Log ind'}
                            </Button>
                        </form>
                        <p className="text-sm text-center text-muted-foreground mt-5">
                            Ingen konto? Kontakt en administrator for at få adgang.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
