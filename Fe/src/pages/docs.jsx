import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSEO } from "@/hooks/useSEO"

const BASE = "https://shr.dk"

function CodeBlock({ code }) {
    return (
        <pre className="bg-muted rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto text-foreground border">
            <code>{code}</code>
        </pre>
    )
}

function Endpoint({ method, path, description, request, response }) {
    const methodColor = {
        GET: "bg-blue-100 text-blue-700",
        POST: "bg-green-100 text-green-700",
        DELETE: "bg-red-100 text-red-700",
        PATCH: "bg-yellow-100 text-yellow-700",
    }[method] || "bg-muted text-foreground"

    return (
        <div className="border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${methodColor}`}>{method}</span>
                <code className="text-sm font-mono font-semibold">{path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            {request && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Request</p>
                    <CodeBlock code={request} />
                </div>
            )}
            {response && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Response</p>
                    <CodeBlock code={response} />
                </div>
            )}
        </div>
    )
}

export default function Docs() {
    useSEO(
        'API-dokumentation — shr.dk',
        'REST API til shr.dk: forkort URLs programmatisk, hent statistik og administrer links. Autentificér med Bearer-token eller API-nøgle. Alle endpoints returnerer JSON.'
    )
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">API-dokumentation</h1>
                    <p className="text-muted-foreground">
                        shr.dk tilbyder en REST API til programmatisk URL-forkortning. Alle endpoints returnerer JSON.
                        Autentificerede endpoints kræver en <code className="text-xs bg-muted px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> header
                        eller en <code className="text-xs bg-muted px-1 py-0.5 rounded">x-api-key</code> header med din API-nøgle.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Base URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock code={BASE} />
                    </CardContent>
                </Card>

                {/* Auth */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Autentificering</h2>

                    <Endpoint
                        method="POST"
                        path="/api/auth/register"
                        description="Opret ny konto. Returnerer en JWT-token som bruges i efterfølgende kald."
                        request={`POST /api/auth/register
Content-Type: application/json

{
  "name": "Dit navn",
  "email": "din@email.dk",
  "password": "hemmeligt"
}`}
                        response={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dit navn",
    "email": "din@email.dk",
    "is_pro": false,
    "is_admin": false
  }
}`}
                    />

                    <Endpoint
                        method="POST"
                        path="/api/auth/login"
                        description="Log ind med email og password. Returnerer en JWT-token."
                        request={`POST /api/auth/login
Content-Type: application/json

{
  "email": "din@email.dk",
  "password": "hemmeligt"
}`}
                        response={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dit navn",
    "email": "din@email.dk",
    "is_admin": false
  }
}`}
                    />
                </section>

                {/* URLs */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Links</h2>

                    <Endpoint
                        method="POST"
                        path="/api/urls/shorten"
                        description="Opret et nyt kort link. Kræver autentificering. custom_alias, expires_at og password er valgfrie."
                        request={`POST /api/urls/shorten
Authorization: Bearer <token>
Content-Type: application/json

{
  "originalUrl": "https://eksempel.dk/meget/lang/url",
  "custom_alias": "mit-alias",
  "expires_at": "2026-12-31",
  "password": "hemmeligt"
}`}
                        response={`{
  "id": 42,
  "original_url": "https://eksempel.dk/meget/lang/url",
  "short_code": "mit-alias",
  "user_id": 1,
  "clicks": 0,
  "expires_at": "2026-12-31T00:00:00.000Z",
  "custom_alias": "mit-alias",
  "created_at": "2026-05-21T12:00:00.000Z"
}`}
                    />

                    <Endpoint
                        method="GET"
                        path="/api/urls/my-links"
                        description="Hent alle links tilhørende den autentificerede bruger."
                        request={`GET /api/urls/my-links
Authorization: Bearer <token>`}
                        response={`[
  {
    "id": 42,
    "original_url": "https://eksempel.dk/...",
    "short_code": "mit-alias",
    "clicks": 17,
    "expires_at": null,
    "has_password": false,
    "created_at": "2026-05-21T12:00:00.000Z"
  }
]`}
                    />

                    <Endpoint
                        method="PATCH"
                        path="/api/urls/:id"
                        description="Opdater et links original URL og/eller alias. Kræver ejerskab."
                        request={`PATCH /api/urls/42
Authorization: Bearer <token>
Content-Type: application/json

{
  "original_url": "https://ny-url.dk",
  "custom_alias": "nyt-alias"
}`}
                        response={`{
  "id": 42,
  "original_url": "https://ny-url.dk",
  "short_code": "nyt-alias",
  "clicks": 17,
  "created_at": "2026-05-21T12:00:00.000Z"
}`}
                    />

                    <Endpoint
                        method="DELETE"
                        path="/api/urls/delete/:id"
                        description="Slet et link permanent. Kræver ejerskab."
                        request={`DELETE /api/urls/delete/42
Authorization: Bearer <token>`}
                        response={`{
  "message": "Link deleted successfully"
}`}
                    />
                </section>

                {/* Stats */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Statistik</h2>

                    <Endpoint
                        method="GET"
                        path="/api/urls/:id/stats"
                        description="Hent klik per dag de seneste 30 dage for et specifikt link. Kræver ejerskab."
                        request={`GET /api/urls/42/stats
Authorization: Bearer <token>`}
                        response={`[
  { "date": "2026-04-21", "clicks": 3 },
  { "date": "2026-04-22", "clicks": 0 },
  { "date": "2026-04-23", "clicks": 7 },
  ...
  { "date": "2026-05-21", "clicks": 2 }
]`}
                    />
                </section>

                {/* Password */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Adgangskodebeskyttede links</h2>

                    <Endpoint
                        method="POST"
                        path="/api/r/:short_code/verify"
                        description="Bekræft adgangskode for et beskyttet link. Returnerer redirect URL ved korrekt password."
                        request={`POST /api/r/mit-alias/verify
Content-Type: application/json

{
  "password": "hemmeligt"
}`}
                        response={`{
  "redirect_url": "https://eksempel.dk/meget/lang/url"
}`}
                    />
                </section>

                {/* Redirect */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Redirect</h2>

                    <Endpoint
                        method="GET"
                        path="/r/:short_code"
                        description="Besøg det korte link. Redirecter automatisk til original URL. Adgangskodebeskyttede links viser en password-side i stedet."
                        request={`GET /r/mit-alias`}
                        response={`302 Redirect → https://eksempel.dk/meget/lang/url`}
                    />
                </section>

                <p className="text-xs text-muted-foreground text-center pb-4">
                    Spørgsmål? Kontakt os på <a href="mailto:hej@shr.dk" className="text-primary hover:underline">hej@shr.dk</a>
                </p>
            </div>
        </div>
    )
}
