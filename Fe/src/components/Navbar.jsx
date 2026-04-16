import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Link2 } from 'lucide-react'

export function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
                    <Link2 className="w-5 h-5 text-primary" />
                    shr.dk
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="#funktioner" className="hover:text-foreground transition-colors">Funktioner</a>
                    <a href="#priser" className="hover:text-foreground transition-colors">Priser</a>
                    <a href="#api" className="hover:text-foreground transition-colors">API</a>
                </div>

                <div className="flex items-center gap-2">
                    {token ? (
                        <>
                            <Link to="/dashboard">
                                <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/settings">
                                <Button variant={isActive('/settings') ? 'default' : 'ghost'} size="sm">
                                    Indstillinger
                                </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={handleLogout}>Log ud</Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log ind</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Opret konto</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
