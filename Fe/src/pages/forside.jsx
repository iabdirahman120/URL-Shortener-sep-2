import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/Navbar'
import {
    Link2, BarChart2, Zap, Globe, Code2, QrCode,
    Clock, ChevronRight, Play, Check, Lock
} from 'lucide-react'

const features = [
    {
        icon: <Link2 className="w-6 h-6 text-primary" />,
        title: 'Korte links',
        desc: 'Forkort lange URL\'er til præcise, delevenlige links på sekunder.',
    },
    {
        icon: <BarChart2 className="w-6 h-6 text-primary" />,
        title: 'Klik-statistik',
        desc: 'Se præcis hvor mange der klikker på dine links i realtid.',
    },
    {
        icon: <QrCode className="w-6 h-6 text-primary" />,
        title: 'QR-koder',
        desc: 'Generer automatisk en QR-kode til hvert link — klar til print.',
    },
    {
        icon: <Globe className="w-6 h-6 text-primary" />,
        title: 'Custom domain',
        desc: 'Brug dit eget domæne til dine links. Styrk dit brand.',
        pro: true,
    },
    {
        icon: <Code2 className="w-6 h-6 text-primary" />,
        title: 'API-adgang',
        desc: 'Integrer link-forkortning direkte i dit eget CMS eller system.',
        pro: true,
    },
    {
        icon: <Clock className="w-6 h-6 text-primary" />,
        title: 'Udløbsdato',
        desc: 'Sæt en udløbsdato på dine links — perfekt til tidsbegrænsede kampagner.',
    },
]

const steps = [
    { num: '01', title: 'Indsæt din URL', desc: 'Kopiér og indsæt den lange URL du vil forkorte.' },
    { num: '02', title: 'Tilpas dit link', desc: 'Vælg et custom alias og sæt evt. en udløbsdato.' },
    { num: '03', title: 'Del og spor', desc: 'Del linket og følg med i klik-statistikken.' },
]

const freeFeatures = [
    'Op til 50 links',
    'Klik-statistik',
    'QR-koder',
    'Custom alias',
    'Udløbsdato',
]

const proFeatures = [
    'Ubegrænsede links',
    'Klik-statistik',
    'QR-koder',
    'Custom alias',
    'Udløbsdato',
    'Custom domain',
    'API-adgang',
    'Prioriteret support',
    'Eksporter data',
]

export default function Forside() {
    const [url, setUrl] = useState('')
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleShorten = (e) => {
        e.preventDefault()
        if (!url) return
        if (token) {
            navigate('/dashboard', { state: { prefillUrl: url } })
        } else {
            navigate('/register')
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 bg-gradient-to-b from-primary/5 to-background">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                    <Zap className="w-3.5 h-3.5" />
                    Hurtig, gratis og nem at bruge
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5 max-w-3xl leading-tight">
                    Forkort dine links.<br />
                    <span className="text-primary">Spor hvert klik.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mb-10">
                    Verdens hurtigste link-forkorter. Opret korte links med QR-koder, klik-statistik og custom domæner.
                </p>
                <form onSubmit={handleShorten} className="flex gap-2 w-full max-w-lg">
                    <Input
                        type="url"
                        placeholder="Indsæt din lange URL her..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-11 text-base"
                    />
                    <Button type="submit" size="lg" className="shrink-0">
                        Forkort nu <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">
                    Gratis at komme i gang — ingen kreditkort påkrævet
                </p>
            </section>

            {/* Stats */}
            <section className="border-y bg-muted/30 py-8 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-3xl font-bold text-foreground">10.000+</p>
                        <p className="text-sm text-muted-foreground mt-1">Links forkortet</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-foreground">500+</p>
                        <p className="text-sm text-muted-foreground mt-1">Aktive brugere</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-foreground">50.000+</p>
                        <p className="text-sm text-muted-foreground mt-1">Klik sporet</p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="funktioner" className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-foreground mb-3">Alt hvad du behøver</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Fra simple korte links til avanceret tracking og API-integration — vi har det hele.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow relative">
                                {f.pro && (
                                    <span className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Pro</span>
                                )}
                                <div className="mb-4">{f.icon}</div>
                                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-6 bg-muted/30 border-y">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-foreground mb-3">Sådan fungerer det</h2>
                        <p className="text-muted-foreground">3 trin — og du er i gang på under 30 sekunder.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((s) => (
                            <div key={s.num} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-4">
                                    {s.num}
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                                <p className="text-sm text-muted-foreground">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video sektion */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Se det i aktion</h2>
                    <p className="text-muted-foreground mb-8">En hurtig video der viser alle funktioner — eksklusivt for Pro-brugere.</p>
                    <div className="relative rounded-2xl overflow-hidden border bg-muted aspect-video flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/80" />
                        <div className="relative flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                <Play className="w-7 h-7 text-primary ml-1" />
                            </div>
                            <div className="flex items-center gap-2 bg-background/80 backdrop-blur text-sm font-medium px-4 py-2 rounded-full border">
                                <Lock className="w-3.5 h-3.5 text-primary" />
                                Kræver Pro-abonnement
                            </div>
                        </div>
                    </div>
                    <Link to="/register">
                        <Button className="mt-6">Opgrader til Pro <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </Link>
                </div>
            </section>

            {/* Priser */}
            <section id="priser" className="py-20 px-6 bg-muted/30 border-y">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-foreground mb-3">Simpel prissætning</h2>
                        <p className="text-muted-foreground">Start gratis — opgrader når du er klar.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="border rounded-2xl p-8 bg-card">
                            <h3 className="text-lg font-bold text-foreground mb-1">Gratis</h3>
                            <p className="text-3xl font-bold text-foreground mt-3 mb-1">0 kr<span className="text-base font-normal text-muted-foreground">/md</span></p>
                            <p className="text-sm text-muted-foreground mb-6">Perfekt til at komme i gang.</p>
                            <ul className="space-y-3 mb-8">
                                {freeFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-primary shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="block">
                                <Button variant="outline" className="w-full">Kom i gang gratis</Button>
                            </Link>
                        </div>
                        {/* Pro */}
                        <div className="border-2 border-primary rounded-2xl p-8 bg-card relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                Populær
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Pro</h3>
                            <p className="text-3xl font-bold text-foreground mt-3 mb-1">49 kr<span className="text-base font-normal text-muted-foreground">/md</span></p>
                            <p className="text-sm text-muted-foreground mb-6">Til dig der vil have det hele.</p>
                            <ul className="space-y-3 mb-8">
                                {proFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-primary shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="block">
                                <Button className="w-full">Start Pro-periode</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* API sektion */}
            <section id="api" className="py-20 px-6">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                            <Code2 className="w-3.5 h-3.5" />
                            Developer API
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-4">Integrer med dit eget system</h2>
                        <p className="text-muted-foreground mb-6">
                            Brug vores REST API til at forkorte links direkte fra dit CMS, e-mail system eller custom applikation. Nøglen genereres automatisk på din profil.
                        </p>
                        <Link to="/register">
                            <Button>Hent din API-nøgle <ChevronRight className="w-4 h-4 ml-1" /></Button>
                        </Link>
                    </div>
                    <div className="bg-foreground rounded-xl p-5 text-sm font-mono">
                        <p className="text-muted-foreground mb-2"># Forkort et link via API</p>
                        <p className="text-green-400">curl -X POST https://shr.dk/api/urls/shorten \</p>
                        <p className="text-green-400 ml-4">-H "Authorization: Bearer DIN_API_NØGLE" \</p>
                        <p className="text-green-400 ml-4">-d {'\'{"originalUrl":"https://..."}\''}</p>
                        <p className="text-muted-foreground mt-3 mb-1"># Svar</p>
                        <p className="text-blue-300">{'{'}</p>
                        <p className="text-blue-300 ml-4">"short_code": "abc123",</p>
                        <p className="text-blue-300 ml-4">"short_url": "https://shr.dk/r/abc123"</p>
                        <p className="text-blue-300">{'}'}</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
                <h2 className="text-3xl font-bold mb-3">Klar til at komme i gang?</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-sm mx-auto">
                    Opret en gratis konto og forkort dit første link på under et minut.
                </p>
                <Link to="/register">
                    <Button variant="secondary" size="lg">
                        Opret gratis konto <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 font-bold text-foreground mb-3">
                    <Link2 className="w-4 h-4 text-primary" />
                    shr.dk
                </div>
                <p>© {new Date().getFullYear()} shr.dk — Alle rettigheder forbeholdes</p>
                <div className="flex justify-center gap-4 mt-3">
                    <Link to="/login" className="hover:text-foreground transition-colors">Log ind</Link>
                    <Link to="/register" className="hover:text-foreground transition-colors">Opret konto</Link>
                </div>
            </footer>
        </div>
    )
}
