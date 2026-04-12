import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useNavigate } from "react-router-dom"




function Register() {

    const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const navigate = useNavigate()

const handleSubmit = async (e) => {
    e.preventDefault()

    try {
        const response = await fetch('/api/auth/register', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ navn: name, email, password })
        })

        const data = await response.json()
        console.log(data)
        navigate('/login')
    } catch (err) {
        console.error(err)
        alert('Noget gik galt. Prøv igen.')
    }
}

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="Navn">Navn</Label>
                            <Input type="text" id="navn" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input type="password" id="confirmPassword" placeholder="Enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Register</Button>
                    </form>
                    <p className="text-sm text-center mt-4">
                        Har du allerede en konto? <a href="/login" className="text-blue-500">Login her</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register