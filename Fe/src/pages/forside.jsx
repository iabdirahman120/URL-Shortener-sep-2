import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom'


function forside () {
    return (
        <div className= "flex flex-col items-center justify-center min-h-screen">
            <h1 className= "text-4xl font-bold mb-4">Forkort dine links</h1>
            <p className="text-muted-foreground mb-8">Opret korte links og del dem nemt</p>
            <div className= "flex gap-2 w-full max-w-md">
                <Input type="url" placeholder= "Indtast din lange URL"/>
                <Button>Forkort link</Button>
            </div>
            <div className="flex gap-4 mt-4">
                <Link to="/login"><Button variant="outline">Log ind</Button></Link>
                <Link to="/register"><Button>Opret konto</Button></Link>
            </div>
        </div>
    )
}

export default forside