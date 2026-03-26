import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Dashboard() {
    return (
       <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Opret nyt link</CardTitle>
            </CardHeader>
            <CardContent className= "flex gap-2">   
                <Input type="url" placeholder="Indtast din lange URL"/>
                <Button>Opret link</Button>
            </CardContent>
            
        </Card>
       <Card>
    <CardHeader>
        <CardTitle>Mine links</CardTitle>
    </CardHeader>
    <CardContent>
       <table className= "w-full text-sm">
        <thead>
            <tr className= "border-b">
                <th className="text-left py-2">Original URL</th>
                <th className="text-left py-2">Kort link</th>
                <th className="text-left py-2">Klik</th>
                <th className="text-left py-2"></th>
            </tr>
        </thead>

       </table>
    </CardContent>
</Card>

       </div>
    )
}

export default Dashboard