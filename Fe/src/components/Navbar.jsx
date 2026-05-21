import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Link2, ShieldCheck, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const isAdmin = localStorage.getItem('is_admin') === 'true'
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [dark])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('is_admin')
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
                    <a href="/#funktioner" className="hover:text-foreground transition-colors">Funktioner</a>
                    <a href="/#priser" className="hover:text-foreground transition-colors">Priser</a>
                    <Link to="/docs" className={`hover:text-foreground transition-colors ${isActive('/docs') ? 'text-foreground font-medium' : ''}`}>
                        API
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDark(d => !d)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={dark ? 'Lys tilstand' : 'Mørk tilstand'}
                    >
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {token ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin">
                                    <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
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
