import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Adgangskoderne matcher ikke.")
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ navn: name, email, password })
            })
            const data = await response.json()
            setLoading(false)

            if (response.ok) {
                navigate('/login')
            } else {
                setError(data.message || 'Noget gik galt. Prøv igen.')
            }
        } catch {
            setLoading(false)
            setError('Noget gik galt. Prøv igen.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Opret konto</CardTitle>
                        <CardDescription>Gratis — ingen kreditkort påkrævet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <Label htmlFor="navn">Navn</Label>
                                <Input
                                    type="text"
                                    id="navn"
                                    placeholder="Dit navn"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
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
                                <Label htmlFor="password">Adgangskode</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword">Bekræft adgangskode</Label>
                                <Input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Opretter konto...' : 'Opret gratis konto'}
                            </Button>
                        </form>
                        <p className="text-sm text-center text-muted-foreground mt-5">
                            Har du allerede en konto?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Log ind
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
