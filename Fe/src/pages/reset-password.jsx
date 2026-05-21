import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { KeyRound, CheckCircle } from "lucide-react"

export default function ResetPassword() {
    const [params] = useSearchParams()
    const token = params.get('token')
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirm) {
            setError('Adgangskoderne stemmer ikke overens.')
            return
        }
        if (password.length < 6) {
            setError('Adgangskoden skal være mindst 6 tegn.')
            return
        }
        setLoading(true)
        setError("")
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Noget gik galt.')
                setLoading(false)
                return
            }
            setDone(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch {
            setError('Netværksfejl. Prøv igen.')
        }
        setLoading(false)
    }

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center px-6">
                    <Card className="w-full max-w-sm text-center p-8">
                        <p className="text-muted-foreground">Ugyldigt reset-link.</p>
                        <Link to="/forgot-password" className="text-primary hover:underline text-sm mt-4 inline-block">
                            Anmod om nyt link
                        </Link>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            {done ? <CheckCircle className="w-6 h-6 text-primary" /> : <KeyRound className="w-6 h-6 text-primary" />}
                        </div>
                        <CardTitle className="text-xl">
                            {done ? 'Adgangskode nulstillet' : 'Vælg ny adgangskode'}
                        </CardTitle>
                        <CardDescription>
                            {done ? 'Du videresendes til login om et øjeblik...' : 'Vælg en ny sikker adgangskode.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!done && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Ny adgangskode</Label>
                                    <Input
                                        type="password"
                                        id="password"
                                        placeholder="Mindst 6 tegn"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirm">Bekræft adgangskode</Label>
                                    <Input
                                        type="password"
                                        id="confirm"
                                        placeholder="••••••••"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Gemmer...' : 'Gem ny adgangskode'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
