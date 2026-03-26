import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="name">name</Label>
                            <Input type="name" id="name" placeholder="Enter your name" required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" placeholder="Enter your email" required />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input type="password" id="password" placeholder="Enter your password" required />
                        </div>
                        <div>
                            <Label htmlFor="confirm password">Confirm Password</Label>
                            <Input type="confirm password" id="confirm password" placeholder="Enter your password" required />
                        </div>
                        <Button type="submit" className="w-full">Register</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register