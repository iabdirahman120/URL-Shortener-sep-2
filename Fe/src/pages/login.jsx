import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useSEO } from '@/hooks/useSEO'

/**
 * Login.
 *
 * Venstrestillet i stedet for et centreret kort. Et kort midt paa en tom
 * skaerm er den mest generiske loesning der findes, og siden har i forvejen
 * ét udtryk, der ikke bygger paa kasser.
 *
 * Feltet husker ikke, om du har en konto: selvregistrering er lukket, saa
 * teksten nedenunder siger det rent ud i stedet for at linke til en
 * tilmeldingsside, der svarer 403.
 */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fejl, setFejl] = useState('')
  const [henter, setHenter] = useState(false)
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  // Sat af session.js, naar et kald er blevet afvist med 401.
  const udloebet = sp.get('udloebet') === '1'

  useSEO('Log ind | shr.dk', 'Log ind på shr.dk for at se linkregistret.')

  const send = async (e) => {
    e.preventDefault()
    setFejl('')
    setHenter(true)
    try {
      const svar = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await svar.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false')
        navigate('/dashboard')
      } else {
        setFejl(data.message || 'Forkert email eller adgangskode.')
      }
    } catch {
      // En netvaerksfejl og en forkert adgangskode er ikke det samme, og
      // beskeden skal sige hvad man goer ved det.
      setFejl('Kunne ikke få forbindelse. Prøv igen om lidt.')
    } finally {
      setHenter(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="u-wrap u-gutter flex-1 py-[clamp(56px,9vw,120px)]">
        <div className="max-w-[420px]">
          <p className="u-label">Adgang</p>
          <h1 className="u-section-heading mt-6">Log ind.</h1>

          {udloebet && (
            <p className="mt-6 rounded-[5px] border border-edge bg-surface px-4 py-3 text-[14.5px] leading-[1.5] text-ink-soft">
              Din session er udløbet. Log ind igen for at fortsætte.
            </p>
          )}

          <form onSubmit={send} className="mt-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <label htmlFor="email" className="u-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.dk"
                className="u-field"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="kode" className="u-label">
                  Adgangskode
                </label>
                <Link to="/forgot-password" className="u-link text-[13.5px]">
                  Glemt den?
                </Link>
              </div>
              <input
                id="kode"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="u-field"
              />
            </div>

            {/* Fejlen staar over knappen, ikke under. Ellers laeser man den
                foerst efter at have trykket igen. */}
            {fejl && (
              <p role="alert" className="text-[14.5px] leading-[1.5] text-rust">
                {fejl}
              </p>
            )}

            <button type="submit" disabled={henter} className="u-btn mt-2 w-full">
              {henter ? 'Logger ind' : 'Log ind'}
            </button>
          </form>

          <p className="mt-10 text-[14.5px] leading-[1.6] text-ink-faint">
            Der er ingen selvbetjent oprettelse. Skal du have adgang, beder du en
            administrator om en konto.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
