import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import { Copy, RefreshCw, Check, Zap } from "lucide-react"

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const handle = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <Button variant="outline" size="sm" onClick={handle}>
            {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" />Kopieret</> : <><Copy className="w-3.5 h-3.5 mr-1.5" />Kopiér</>}
        </Button>
    )
}

export default function Settings() {
    const [apiKey, setApiKey] = useState(null)
    const [isPro, setIsPro] = useState(false)
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState(false)

    const token = localStorage.getItem('token')

    useEffect(() => {
        Promise.all([
            fetch('/api/apikeys/my-key', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([keyData, subData]) => {
            setApiKey(keyData.api_key)
            setIsPro(subData.is_pro)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [token])

    const handleRegenerate = async () => {
        setRegenerating(true)
        const res = await fetch('/api/apikeys/regenerate', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setApiKey(data.api_key)
        setRegenerating(false)
    }

    const handleUpgrade = async () => {
        const res = await fetch('/api/subscription/checkout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-foreground">Indstillinger</h1>

                {/* Subscription status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            Abonnement
                        </CardTitle>
                        <CardDescription>Din nuværende plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isPro ? (
                            <div className="flex items-center gap-3">
                                <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">Pro</span>
                                <p className="text-sm text-muted-foreground">Du har adgang til alle Pro-funktioner.</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-foreground">Gratis plan</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Opgrader for custom domain, API og mere.</p>
                                </div>
                                <Button size="sm" onClick={handleUpgrade}>Opgrader til Pro</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* API nøgle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">API-nøgle</CardTitle>
                        <CardDescription>Brug denne nøgle til at integrere shr.dk i dit eget system.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {loading ? (
                            <div className="h-9 bg-muted animate-pulse rounded-md" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-muted text-sm px-3 py-2 rounded-md font-mono truncate text-foreground">
                                    {apiKey}
                                </code>
                                <CopyButton text={apiKey} />
                                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating}>
                                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${regenerating ? 'animate-spin' : ''}`} />
                                    Regenerér
                                </Button>
                            </div>
                        )}
                        <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-muted-foreground">
                            <p className="mb-1 text-xs font-sans font-medium text-foreground">Eksempel</p>
                            <p>curl -X POST https://shr.dk/api/urls/shorten \</p>
                            <p className="ml-3">-H "Authorization: Bearer {apiKey || 'DIN_API_NØGLE'}" \</p>
                            <p className="ml-3">{`-d '{"originalUrl":"https://din-lange-url.dk"}'`}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
