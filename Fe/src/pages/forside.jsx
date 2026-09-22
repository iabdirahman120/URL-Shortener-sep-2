import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useSEO } from '@/hooks/useSEO'
import { useBand } from '@/hooks/useBand'

/**
 * Forsiden.
 *
 * Den skal svare paa ét spoergsmaal inden for to sekunder: hvad er det her.
 * Derfor staar ordene "forkort" og "link" i overskriften, og feltet, man
 * faktisk skal bruge, staar lige under. Ingen pille over overskriften, ingen
 * opfundne brugertal.
 *
 * Feltet virker. Skriver man en adresse og trykker, bliver den husket og man
 * sendes videre: til registret hvis man er logget ind, ellers til login og
 * derfra direkte til registret med adressen klar. Et felt, der ikke goer
 * noget, er en attrap, og det kan folk se.
 */

function Band({ children, className = '' }) {
  const ref = useBand()
  return (
    <div ref={ref} className={`u-band ${className}`}>
      {children}
    </div>
  )
}

/* Kun det systemet faktisk kan. Intet er "paa vej" eller "kommer snart". */
const VAERDI = [
  {
    navn: 'Korte links, der kan læses op',
    tekst: 'Vælg koden selv, eller lad systemet finde en ledig. shr.dk/okt26 kan skrives af fra en plakat. Den lange kan ikke.',
  },
  {
    navn: 'Du kan se, om nogen klikker',
    tekst: 'Hvert klik tælles med tidspunkt, enhed og hvor besøgende kom fra. Uden at du skal sætte noget op.',
  },
  {
    navn: 'QR-kode til hvert link',
    tekst: 'Genereres af sig selv og kan sættes direkte i tryksager. Den peger på det korte link, så du også kan måle den.',
  },
  {
    navn: 'Links, der lukker sig selv',
    tekst: 'Sæt en udløbsdato på en kampagne. Bagefter svarer linket, at tilbuddet er slut, i stedet for at føre til en død side.',
  },
]

const TRIN = [
  ['Indsæt adressen', 'Kopiér den lange URL ind i feltet. Der er ingen grænse for, hvor lang den må være.'],
  ['Vælg koden', 'Tag den, systemet foreslår, eller skriv din egen. Sæt en udløbsdato på, hvis linket kun skal gælde en periode.'],
  ['Del det, og følg med', 'Linket virker med det samme. Klikkene begynder at tælle fra første besøg.'],
]

export default function Forside() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const loggetInd = Boolean(localStorage.getItem('token'))

  useSEO(
    'shr.dk, forkort lange links og se hvem der klikker',
    'Lav korte links med egen kode, udløbsdato og QR. Se antal klik, enhed og kilde for hvert link.'
  )

  const start = (e) => {
    e.preventDefault()
    const ren = url.trim()
    if (!ren) return
    // Adressen foelger med over, saa man ikke skal indsaette den to gange.
    sessionStorage.setItem('shr_url', ren)
    navigate(loggetInd ? '/dashboard' : '/login')
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* ---------------------------------------------------------- hero */}
      <section className="u-wrap u-gutter pt-[clamp(48px,7vw,96px)] pb-[clamp(56px,8vw,108px)]">
        <div className="max-w-[820px]">
          <Band>
            <h1 className="u-display">
              Forkort lange links.
              <br />
              <span className="text-go">Se, hvem der klikker.</span>
            </h1>
          </Band>

          <Band>
            <p className="u-lead u-measure mt-8">
              shr.dk laver en uoverskuelig adresse om til en kort kode, du kan sætte i en mail,
              på en plakat eller i en annonce. Og tæller bagefter, hvor mange der brugte den.
            </p>
          </Band>

          {/* Selve varen. Feltet staar hoejt, fordi det er dét, folk kom efter. */}
          <Band className="mt-11">
            <form onSubmit={start} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Indsæt din lange adresse her"
                aria-label="Lang adresse"
                className="u-field h-[56px] flex-1 !text-[15.5px]"
              />
              <button type="submit" className="u-btn h-[56px] shrink-0">
                Forkort linket
              </button>
            </form>
            <p className="mt-4 text-[14px] text-ink-faint">
              {loggetInd
                ? 'Du er logget ind. Adressen følger med over i registret.'
                : 'Du skal have en konto. Adressen følger med, når du er logget ind.'}
            </p>
          </Band>

          {/* Det produktet goer, vist i stedet for beskrevet. */}
          <Band className="mt-14">
            <div className="rounded-[7px] border border-edge bg-surface p-6 sm:p-8">
              <p className="u-label">Før</p>
              <p className="u-mono mt-3 break-all text-[13px] leading-[1.7] text-ink-faint sm:text-[14px]">
                https://www.eksempel.dk/kampagne/efteraar-2026/tilmelding?utm_source=nyhedsbrev&amp;utm_medium=email&amp;utm_campaign=okt
              </p>

              <p className="u-label mt-8">Efter</p>
              <p className="u-mono mt-3 text-[clamp(24px,4.4vw,40px)] leading-none tracking-tight text-ink">
                shr.dk/<span className="text-go">okt26</span>
              </p>
            </div>
          </Band>
        </div>
      </section>

      {/* ---------------------------------------------------------- værdien */}
      <section className="u-wrap u-gutter u-section-pad">
        <Band>
          <h2 className="u-section-heading max-w-[20ch]">Hvad du får ud af det.</h2>
        </Band>

        <div className="mt-14 grid gap-x-14 gap-y-11 md:grid-cols-2">
          {VAERDI.map((v) => (
            <Band key={v.navn}>
              <div>
                <h3 className="text-[20px] leading-[1.25]">{v.navn}</h3>
                <p className="mt-3 text-[15.5px] leading-[1.6] text-ink-soft">{v.tekst}</p>
              </div>
            </Band>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- trin */}
      <section className="bg-sunk">
        <div className="u-wrap u-gutter u-section-pad">
          <Band>
            <h2 className="u-section-heading max-w-[18ch]">Tre trin, og linket er i luften.</h2>
          </Band>

          {/* Nummereringen staar der, fordi det FAKTISK er en raekkefoelge.
              Ikke som pynt paa tre tilfaeldige punkter. */}
          <ol className="mt-14 grid gap-y-10 md:grid-cols-3 md:gap-x-12">
            {TRIN.map(([navn, tekst], i) => (
              <Band key={navn}>
                <li className="list-none">
                  <p className="u-mono text-[13px] text-go">Trin {i + 1}</p>
                  <h3 className="mt-3 text-[19px] leading-[1.25]">{navn}</h3>
                  <p className="mt-3 text-[15.5px] leading-[1.6] text-ink-soft">{tekst}</p>
                </li>
              </Band>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------- api */}
      <section className="u-wrap u-gutter u-section-pad">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20">
          <Band>
            <div>
              <p className="u-label">For udviklere</p>
              <h2 className="u-section-heading mt-5 max-w-[16ch]">Eller helt uden om siden.</h2>
              <p className="u-measure mt-6 text-ink-soft">
                Samme funktioner over HTTP med en nøgle fra din profil. Læg det ind i dit CMS,
                dit nyhedsbrev eller din egen kode.
              </p>
              <Link to="/docs" className="u-link mt-7 inline-block text-[15.5px] text-go">
                Læs dokumentationen
              </Link>
            </div>
          </Band>

          <Band className="min-w-0">
            <div className="overflow-x-auto rounded-[7px] border border-edge bg-surface p-6 sm:p-8">
              <pre className="u-mono text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13px]">
{`curl -X POST https://shr.dk/api/urls/shorten \\
  -H "Authorization: Bearer $NOEGLE" \\
  -H "Content-Type: application/json" \\
  -d '{"originalUrl":"https://...","custom_alias":"okt26"}'

{
  "short_code": "okt26",
  "short_url": "https://shr.dk/okt26"
}`}
              </pre>
            </div>
          </Band>
        </div>
      </section>

      {/* ---------------------------------------------------------- slutning */}
      <section className="bg-sunk">
        <div className="u-wrap u-gutter u-section-pad">
          <Band>
            <h2 className="u-section-heading max-w-[17ch]">Kom i gang med det samme.</h2>
          </Band>
          <Band>
            <p className="u-measure mt-6 text-ink-soft">
              Log ind og lav dit første korte link. Har du ikke en konto endnu, opretter en
              administrator den til dig.
            </p>
          </Band>
          <Band className="mt-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/login" className="u-btn w-full sm:w-auto">
                Log ind
              </Link>
              <Link to="/docs" className="u-btn-ghost w-full sm:w-auto">
                Se dokumentationen
              </Link>
            </div>
          </Band>
        </div>
      </section>

      <Footer />
    </div>
  )
}
