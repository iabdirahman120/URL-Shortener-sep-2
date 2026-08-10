import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Link2, MousePointerClick, Trash2, Crown, ExternalLink } from 'lucide-react'

const token = () => localStorage.getItem('token')

export default function Admin() {
    const [tab, setTab] = useState('users')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
            fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
            fetch('/api/admin/links', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
        ]).then(([s, u, l]) => {
            setStats(s)
            setUsers(Array.isArray(u) ? u : [])
            setLinks(Array.isArray(l) ? l : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const deleteUser = async (id) => {
        if (!confirm('Slet bruger og alle deres links?')) return
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
        setUsers(users.filter(u => u.id !== id))
    }

    const deleteLink = async (id) => {
        if (!confirm('Slet dette link?')) return
        await fetch(`/api/admin/links/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
        setLinks(links.filter(l => l.id !== id))
    }

    const togglePro = async (id) => {
        const res = await fetch(`/api/admin/users/${id}/toggle-pro`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token()}` }
        })
        const data = await res.json()
        setUsers(users.map(u => u.id === id ? { ...u, is_pro: data.is_pro } : u))
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Admin panel</h1>
                    <p className="text-sm text-muted-foreground mt-1">Overblik over alle brugere og links</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_users}</p>
                                    <p className="text-xs text-muted-foreground">Brugere i alt</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Link2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_links}</p>
                                    <p className="text-xs text-muted-foreground">Links i alt</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <MousePointerClick className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total_clicks}</p>
                                    <p className="text-xs text-muted-foreground">Klik i alt</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b pb-0">
                    {['users', 'links'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                tab === t
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t === 'users' ? `Brugere (${users.length})` : `Links (${links.length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-sm text-muted-foreground py-10 text-center">Henter data...</div>
                ) : tab === 'users' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Alle brugere</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground text-xs">
                                            <th className="text-left px-6 py-3 font-medium">Navn</th>
                                            <th className="text-left px-6 py-3 font-medium">Email</th>
                                            <th className="text-left px-6 py-3 font-medium">Plan</th>
                                            <th className="text-left px-6 py-3 font-medium">Links</th>
                                            <th className="text-left px-6 py-3 font-medium">Klik</th>
                                            <th className="text-left px-6 py-3 font-medium">Oprettet</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3 font-medium text-foreground">{u.navn}</td>
                                                <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                                        u.is_pro
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {u.is_pro && <Crown className="w-3 h-3" />}
                                                        {u.is_pro ? 'Pro' : 'Gratis'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-foreground">{u.link_count}</td>
                                                <td className="px-6 py-3 text-foreground">{u.total_clicks}</td>
                                                <td className="px-6 py-3 text-muted-foreground text-xs">
                                                    {new Date(u.created_at).toLocaleDateString('da-DK')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => togglePro(u.id)}
                                                            className="text-xs h-7 px-2"
                                                        >
                                                            {u.is_pro ? 'Fjern Pro' : 'Giv Pro'}
                                                        </Button>
                                                        {!u.is_admin && (
                                                            <button
                                                                onClick={() => deleteUser(u.id)}
                                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Alle links</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground text-xs">
                                            <th className="text-left px-6 py-3 font-medium">Kort link</th>
                                            <th className="text-left px-6 py-3 font-medium">Original URL</th>
                                            <th className="text-left px-6 py-3 font-medium">Bruger</th>
                                            <th className="text-left px-6 py-3 font-medium">Klik</th>
                                            <th className="text-left px-6 py-3 font-medium">Oprettet</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {links.map(l => (
                                            <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3">
                                                    <a
                                                        href={`https://shr.dk/r/${l.short_code}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary hover:underline font-medium flex items-center gap-1"
                                                    >
                                                        {l.short_code}
                                                        <ExternalLink className="w-3 h-3 opacity-60" />
                                                    </a>
                                                </td>
                                                <td className="px-6 py-3 max-w-[250px]">
                                                    <span className="truncate block text-muted-foreground" title={l.original_url}>
                                                        {l.original_url.replace(/^https?:\/\//, '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground">{l.user_email || '—'}</td>
                                                <td className="px-6 py-3 font-semibold text-foreground">{l.clicks}</td>
                                                <td className="px-6 py-3 text-muted-foreground text-xs">
                                                    {new Date(l.created_at).toLocaleDateString('da-DK')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <button
                                                        onClick={() => deleteLink(l.id)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
