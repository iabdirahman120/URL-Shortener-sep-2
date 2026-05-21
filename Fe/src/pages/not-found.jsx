import { Link, useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Link2, AlertTriangle, Clock } from "lucide-react"

export default function NotFound() {
    const [params] = useSearchParams()
    const expired = params.get('reason') === 'expired'

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-6 py-20">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        {expired
                            ? <Clock className="w-8 h-8 text-primary" />
                            : <AlertTriangle className="w-8 h-8 text-primary" />
                        }
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                        {expired ? 'Link er udløbet' : 'Link ikke fundet'}
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        {expired
                            ? 'Dette link er udløbet og kan ikke længere bruges. Kontakt afsenderen for et nyt link.'
                            : 'Det korte link eksisterer ikke. Tjek at du har den rigtige URL, eller opret et nyt link.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/">
                            <Button className="gap-2 w-full sm:w-auto">
                                <Link2 className="w-4 h-4" />
                                Opret nyt link
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Gå til dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
