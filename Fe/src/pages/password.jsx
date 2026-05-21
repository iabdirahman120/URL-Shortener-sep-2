import { useState } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function PasswordPage() {
    const { short_code } = useParams()
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/r/${short_code}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Forkert adgangskode')
                setLoading(false)
                return
            }

            window.location.href = data.redirect_url
        } catch {
            setError('Netværksfejl — prøv igen')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Adgangskodebeskyttet link</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            shr.dk/r/{short_code}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <Input
                                type="password"
                                placeholder="Indtast adgangskode..."
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-destructive text-center">{error}</p>
                            )}
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Bekræfter...' : 'Fortsæt'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
