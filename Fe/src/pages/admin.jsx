import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Link2, MousePointerClick, Trash2, Crown, ExternalLink, UserPlus } from 'lucide-react'

const token = () => localStorage.getItem('token')

export default function Admin() {
    const [tab, setTab] = useState('users')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ navn: '', email: '', password: '', is_pro: false, is_admin: false })
    const [createError, setCreateError] = useState('')
    const [creating, setCreating] = useState(false)

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

    const createUser = async (e) => {
        e.preventDefault()
        setCreateError('')
        setCreating(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) { setCreateError(data.message || 'Kunne ikke oprette bruger'); return }
            setUsers([{ ...data, link_count: 0, total_clicks: 0 }, ...users])
            setForm({ navn: '', email: '', password: '', is_pro: false, is_admin: false })
            setShowCreate(false)
        } catch {
            setCreateError('Noget gik galt')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

                <div>
                    <h1 className="text-2xl font-bold text-ink">Admin panel</h1>
                    <p className="text-sm text-ink-soft mt-1">Overblik over alle brugere og links</p>
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
                                    <p className="text-2xl font-bold text-ink">{stats.total_users}</p>
                                    <p className="text-xs text-ink-soft">Brugere i alt</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Link2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-ink">{stats.total_links}</p>
                                    <p className="text-xs text-ink-soft">Links i alt</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <MousePointerClick className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-ink">{stats.total_clicks}</p>
                                    <p className="text-xs text-ink-soft">Klik i alt</p>
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
                                    : 'border-transparent text-ink-soft hover:text-ink'
                            }`}
                        >
                            {t === 'users' ? `Brugere (${users.length})` : `Links (${links.length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-sm text-ink-soft py-10 text-center">Henter data...</div>
                ) : tab === 'users' ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Alle brugere</CardTitle>
                            <Button size="sm" onClick={() => setShowCreate(v => !v)}>
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Ny bruger
                            </Button>
                        </CardHeader>
                        {showCreate && (
                            <CardContent className="border-b pb-5">
                                <form onSubmit={createUser} className="flex flex-col gap-3 max-w-md">
                                    <input className="border rounded-md px-3 py-2 text-sm bg-surface" placeholder="Navn"
                                        value={form.navn} onChange={e => setForm({ ...form, navn: e.target.value })} />
                                    <input className="border rounded-md px-3 py-2 text-sm bg-surface" type="email" placeholder="Email" required
                                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    <input className="border rounded-md px-3 py-2 text-sm bg-surface" type="text" placeholder="Adgangskode (standard: 123)"
                                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                    <p className="text-xs text-ink-soft -mt-1">Lad stå tom for standard-koden <strong>123</strong>. Brugeren kan selv skifte den bagefter.</p>
                                    <div>
                                        <p className="u-label">Rolle</p>
                                        {/* Tre valg, hvor én altid er valgt. To afkrydsningsfelter gav
                                            kombinationer uden mening: en admin har adgang til alt
                                            uanset, om Pro ogsaa er sat. */}
                                        <div className="mt-3 inline-flex flex-wrap rounded-[5px] border border-edge p-1" role="radiogroup" aria-label="Rolle">
                                            {[
                                                ['gratis', 'Gratis', { is_pro: false, is_admin: false }],
                                                ['pro', 'Pro', { is_pro: true, is_admin: false }],
                                                ['admin', 'Admin', { is_pro: true, is_admin: true }],
                                            ].map(([noegle, navn, vaerdier]) => {
                                                const valgt = form.is_admin ? noegle === 'admin'
                                                    : form.is_pro ? noegle === 'pro' : noegle === 'gratis'
                                                return (
                                                    <button key={noegle} type="button" role="radio" aria-checked={valgt}
                                                        onClick={() => setForm({ ...form, ...vaerdier })}
                                                        className={`rounded-[3px] px-4 py-2 text-[13.5px] transition-colors ${
                                                            valgt ? 'bg-go text-white' : 'text-ink-soft hover:text-ink'
                                                        }`}>
                                                        {navn}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <p className="mt-3 text-[13.5px] leading-[1.5] text-ink-faint">
                                            {form.is_admin ? 'Kan oprette og slette brugere, og kan slette alle links.'
                                                : form.is_pro ? 'Almindelig bruger med Pro. Opretter links og ser hele registret.'
                                                : 'Almindelig bruger. Opretter links og ser hele registret.'}
                                        </p>
                                    </div>
                                    {createError && <p className="text-sm text-rust">{createError}</p>}
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" disabled={creating}>{creating ? 'Opretter...' : 'Opret bruger'}</Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => { setShowCreate(false); setCreateError('') }}>Annuller</Button>
                                    </div>
                                </form>
                            </CardContent>
                        )}
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-ink-soft text-xs">
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
                                            <tr key={u.id} className="border-b last:border-0 hover:bg-sunk/30 transition-colors">
                                                <td className="px-6 py-3 font-medium text-ink">{u.navn}</td>
                                                <td className="px-6 py-3 text-ink-soft">{u.email}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                                        u.is_pro
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-ink-soft'
                                                    }`}>
                                                        {u.is_pro && <Crown className="w-3 h-3" />}
                                                        {u.is_pro ? 'Pro' : 'Gratis'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-ink">{u.link_count}</td>
                                                <td className="px-6 py-3 text-ink">{u.total_clicks}</td>
                                                <td className="px-6 py-3 text-ink-soft text-xs">
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
                                                                className="text-ink-soft hover:text-rust transition-colors"
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
                                        <tr className="border-b text-ink-soft text-xs">
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
                                            <tr key={l.id} className="border-b last:border-0 hover:bg-sunk/30 transition-colors">
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
                                                    <span className="truncate block text-ink-soft" title={l.original_url}>
                                                        {l.original_url.replace(/^https?:\/\//, '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-ink-soft">{l.user_email || 'ingen'}</td>
                                                <td className="px-6 py-3 font-semibold text-ink">{l.clicks}</td>
                                                <td className="px-6 py-3 text-ink-soft text-xs">
                                                    {new Date(l.created_at).toLocaleDateString('da-DK')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <button
                                                        onClick={() => deleteLink(l.id)}
                                                        className="text-ink-soft hover:text-rust transition-colors"
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
