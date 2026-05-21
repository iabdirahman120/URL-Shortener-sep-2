import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Trash2, QrCode, Link2, MousePointerClick, ExternalLink, X, BarChart2, Pencil, Check, Lock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

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

function StatsModal({ link, onClose }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        fetch(`/api/urls/${link.id}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [link.id])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return `${d.getDate()}/${d.getMonth() + 1}`
    }

    const totalInPeriod = stats ? stats.reduce((s, d) => s + d.clicks, 0) : 0

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border rounded-2xl p-6 w-full max-w-2xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground">Klik-statistik</p>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                    shr.dk/r/{link.short_code} — {totalInPeriod} klik seneste 30 dage
                </p>
                {loading ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Indlæser...</div>
                ) : !stats ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Kunne ikke hente data</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                interval={4}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                labelFormatter={(v) => new Date(v).toLocaleDateString('da-DK')}
                                formatter={(v) => [v, 'Klik']}
                            />
                            <Bar dataKey="clicks" fill="oklch(0.541 0.281 293.009)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
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

function EditRow({ link, onSave, onCancel }) {
    const [originalUrl, setOriginalUrl] = useState(link.original_url)
    const [alias, setAlias] = useState(link.custom_alias || link.short_code)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const handleSave = async () => {
        if (!originalUrl) return
        setSaving(true)
        setError("")
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/urls/${link.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ original_url: originalUrl, custom_alias: alias })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Fejl ved gem')
                setSaving(false)
                return
            }
            onSave(data)
        } catch {
            setError('Netværksfejl')
            setSaving(false)
        }
    }

    return (
        <tr className="border-b bg-muted/20">
            <td className="py-2 pr-4" colSpan={2}>
                <div className="flex flex-col gap-2">
                    <Input
                        value={originalUrl}
                        onChange={e => setOriginalUrl(e.target.value)}
                        placeholder="Original URL"
                        className="h-8 text-sm"
                    />
                    <Input
                        value={alias}
                        onChange={e => setAlias(e.target.value)}
                        placeholder="Alias / short code"
                        className="h-8 text-sm"
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
            </td>
            <td className="py-2 pr-4 text-muted-foreground text-xs">{link.clicks || 0}</td>
            <td className="py-2 pr-4 text-muted-foreground text-xs">
                {link.expires_at ? new Date(link.expires_at).toLocaleDateString('da-DK') : '—'}
            </td>
            <td className="py-2">
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Gem"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Annuller"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default function Dashboard() {
    const [links, setLinks] = useState([])
    const [url, setUrl] = useState("")
    const [customAlias, setCustomAlias] = useState("")
    const [expiresAt, setExpiresAt] = useState("")
    const [password, setPassword] = useState("")
    const [qrUrl, setQrUrl] = useState(null)
    const [statsLink, setStatsLink] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState("")
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
                body: JSON.stringify({
                    originalUrl: url,
                    custom_alias: customAlias || undefined,
                    expires_at: expiresAt || undefined,
                    password: password || undefined
                })
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
            setPassword("")
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

    const handleEditSave = (updatedLink) => {
        setLinks(links.map(l => l.id === updatedLink.id ? { ...l, ...updatedLink } : l))
        setEditingId(null)
    }

    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)

    const filteredLinks = links.filter(l => {
        if (!search) return true
        const q = search.toLowerCase()
        return l.short_code.toLowerCase().includes(q) || l.original_url.toLowerCase().includes(q)
    })

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}
            {statsLink && <StatsModal link={statsLink} onClose={() => setStatsLink(null)} />}

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
                                <Input
                                    type="password"
                                    placeholder="Adgangskode (valgfrit)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex-1"
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
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-base">Mine links</CardTitle>
                            <Input
                                placeholder="Søg på URL eller alias..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="max-w-xs h-8 text-sm"
                            />
                        </div>
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
                                            <th className="pb-3 w-28"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLinks.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                                                    Ingen resultater for "{search}"
                                                </td>
                                            </tr>
                                        ) : filteredLinks.map((link) => {
                                            if (editingId === link.id) {
                                                return (
                                                    <EditRow
                                                        key={link.id}
                                                        link={link}
                                                        onSave={handleEditSave}
                                                        onCancel={() => setEditingId(null)}
                                                    />
                                                )
                                            }
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
                                                            {link.has_password && (
                                                                <Lock className="w-3 h-3 text-muted-foreground" title="Adgangskodebeskyttet" />
                                                            )}
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
                                                                onClick={() => setStatsLink(link)}
                                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                                title="Vis statistik"
                                                            >
                                                                <BarChart2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(link.id)}
                                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                                title="Rediger link"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
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
