import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Trash2, QrCode, Link2, MousePointerClick, ExternalLink, X } from "lucide-react"

function QrModal({ url, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-card border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between w-full">
                    <p className="font-semibold text-foreground">QR-kode</p>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <QRCodeSVG value={url} size={200} />
                <p className="text-xs text-muted-foreground max-w-[200px] text-center break-all">{url}</p>
                <Button size="sm" onClick={() => {
                    const svg = document.querySelector('#qr-modal svg')
                    if (!svg) return
                    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(blob)
                    a.download = 'qr-kode.svg'
                    a.click()
                }}>Download QR</Button>
            </div>
        </div>
    )
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const handle = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button onClick={handle} className="text-muted-foreground hover:text-foreground transition-colors" title="Kopiér link">
            {copied ? <span className="text-xs text-primary font-medium">Kopieret!</span> : <Copy className="w-4 h-4" />}
        </button>
    )
}

export default function Dashboard() {
    const [links, setLinks] = useState([])
    const [url, setUrl] = useState("")
    const [customAlias, setCustomAlias] = useState("")
    const [expiresAt, setExpiresAt] = useState("")
    const [qrUrl, setQrUrl] = useState(null)
    const [success, setSuccess] = useState("")
    const location = useLocation()

    useEffect(() => {
        if (location.state?.prefillUrl) {
            setUrl(location.state.prefillUrl)
        }
    }, [location.state])

    useEffect(() => {
        const token = localStorage.getItem('token')
        fetch('/api/urls/my-links', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setLinks(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error fetching links:', err))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!url) return
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('/api/urls/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ originalUrl: url, custom_alias: customAlias, expires_at: expiresAt })
            })
            const data = await response.json()
            if (!response.ok) {
                alert(data.error || 'Noget gik galt. Prøv igen.')
                return
            }
            setLinks([data, ...links])
            setUrl("")
            setCustomAlias("")
            setExpiresAt("")
            setSuccess(`Link oprettet: shr.dk/r/${data.short_code}`)
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            console.error('Fejl ved oprettelse:', err)
            alert('Kunne ikke oprette link. Er backend kørende?')
        }
    }

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token')
        await fetch(`/api/urls/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        setLinks(links.filter(link => link.id !== id))
    }

    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}

            <div className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-5">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Link2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{links.length}</p>
                                <p className="text-xs text-muted-foreground">Links oprettet</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-5">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <MousePointerClick className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
                                <p className="text-xs text-muted-foreground">Klik i alt</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hidden md:block">
                        <CardContent className="flex items-center gap-3 pt-5">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <QrCode className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{links.length}</p>
                                <p className="text-xs text-muted-foreground">QR-koder klar</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Opret link */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Opret nyt link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <Input
                                type="url"
                                placeholder="Indsæt din lange URL..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                            <div className="flex gap-3">
                                <Input
                                    type="text"
                                    placeholder="Custom alias (valgfrit)"
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium">
                                    Udløbsdato <span className="font-normal">(valgfrit — lad stå tom for intet udløb)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                    {expiresAt && (
                                        <button
                                            type="button"
                                            onClick={() => setExpiresAt("")}
                                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            Ryd dato
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Opret link</Button>
                            {success && (
                                <p className="text-sm text-center text-primary font-medium">{success}</p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Links tabel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Mine links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                <Link2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                Ingen links endnu — opret dit første ovenfor.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground text-xs">
                                            <th className="text-left pb-3 font-medium">Original URL</th>
                                            <th className="text-left pb-3 font-medium">Kort link</th>
                                            <th className="text-left pb-3 font-medium w-16">Klik</th>
                                            <th className="text-left pb-3 font-medium w-24">Udløber</th>
                                            <th className="pb-3 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map((link) => {
                                            const shortUrl = `https://shr.dk/r/${link.short_code}`
                                            return (
                                                <tr key={link.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 pr-4 max-w-[220px]">
                                                        <span className="truncate block text-muted-foreground" title={link.original_url}>
                                                            {link.original_url.replace(/^https?:\/\//, '')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={shortUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-primary hover:underline font-medium flex items-center gap-1"
                                                            >
                                                                shr.dk/r/{link.short_code}
                                                                <ExternalLink className="w-3 h-3 opacity-60" />
                                                            </a>
                                                            <CopyButton text={shortUrl} />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className="font-semibold text-foreground">{link.clicks || 0}</span>
                                                    </td>
                                                    <td className="py-3 pr-4 text-muted-foreground text-xs">
                                                        {link.expires_at ? new Date(link.expires_at).toLocaleDateString('da-DK') : '—'}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => setQrUrl(shortUrl)}
                                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                                title="Vis QR-kode"
                                                            >
                                                                <QrCode className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(link.id)}
                                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                                title="Slet link"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
