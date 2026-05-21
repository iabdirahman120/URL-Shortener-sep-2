import { Link } from 'react-router-dom'
import { Link2 } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t bg-background py-10 px-6 mt-auto">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-foreground mb-3">
                            <Link2 className="w-4 h-4 text-primary" />
                            shr.dk
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Hurtig og gratis URL-forkortning med klik-statistik, QR-koder og API-adgang.
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Produkt</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/#funktioner" className="hover:text-foreground transition-colors">Funktioner</a></li>
                            <li><a href="/#priser" className="hover:text-foreground transition-colors">Priser</a></li>
                            <li><Link to="/docs" className="hover:text-foreground transition-colors">API-docs</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Konto</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/login" className="hover:text-foreground transition-colors">Log ind</Link></li>
                            <li><Link to="/register" className="hover:text-foreground transition-colors">Opret konto</Link></li>
                            <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Juridisk</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privatlivspolitik</Link></li>
                            <li><Link to="/terms" className="hover:text-foreground transition-colors">Vilkår og betingelser</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} shr.dk — Alle rettigheder forbeholdes</p>
                    <p>Lavet med ❤️ i Danmark</p>
                </div>
            </div>
        </footer>
    )
}
