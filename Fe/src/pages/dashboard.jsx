import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

function Dashboard() {
    const [links, setLinks] = useState([])
    const[url, setUrl] = useState("")
    const[customAlias, setCustomAlias] = useState("")
    const[expiresAt, setExpiresAt] = useState("")

    useEffect(() => {
        const token = localStorage.getItem('token')
        fetch('http://localhost:3000/api/urls/my-links', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => setLinks(data))
        .catch(err => console.error('Error fetching links:', err))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token')

        const response = await fetch('http://localhost:3000/api/urls/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ originalUrl: url, custom_alias: customAlias, expires_at: expiresAt })
        })
        
        const data = await response.json()
        setLinks([...links, data])
        setUrl("")
        setCustomAlias("")
        setExpiresAt("")
    }

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token')

        await fetch(`http://localhost:3000/api/urls/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setLinks(links.filter(link => link.id !== id))
        })
        .catch(err => console.error('Error deleting link:', err))
    }


    return (
       <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Opret nyt link</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Input type="url" placeholder="Indtast din lange URL" value={url} onChange={(e) => setUrl(e.target.value)}/>
                <div className="flex gap-2">
                    <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}/>
                    <Input type="text" placeholder="Custom alias (valgfrit)" value={customAlias} onChange={(e) => setCustomAlias(e.target.value)}/>
                </div>
                <Button className="w-full" onClick={handleSubmit}>
                    Opret link
                </Button>
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
                <th className="text-left py-2 w-1/4">Original URL</th>
                <th className="text-left py-2 w-1/4">Kort link</th>
                <th className="text-left py-2 w-1/4">Klik</th>
                <th className="text-left py-2 w-1/4">Udløber</th>
                <th className="text-left py-2 w-16"></th>
            </tr>
        </thead>
        <tbody>
            {links.map((link) => (
                <tr key={link.id} className="border-b">
                    <td className="py-2 w-1/4 text-left">{link.original_url}</td>
                    <td className="py-2 w-1/4 text-left">localhost:3000/{link.short_code}</td>
                    <td className="py-2 w-1/4 text-left">{link.clicks}</td>
                    <td className="py-2 w-1/4 text-left">{link.expires_at ? new Date(link.expires_at).toLocaleDateString('da-DK'):'-'}</td>
                    <td className="py-2 w-16">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(link.id)}>
                            Slet
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>

       </table>
    </CardContent>
</Card>

       </div>
    )
}

export default Dashboard