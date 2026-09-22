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

/**
 * De to planer.
 *
 * `spaerret: false` betyder, at funktionen endnu ikke er laast i backenden.
 * Den staar her, saa listen ikke lyver for den, der laeser koden, selv om
 * kunden ikke kan se forskel.
 */
const PLANER = [
  {
    navn: 'Gratis',
    pris: 0,
    linje: 'Til dig der skal have et par links ud at leve.',
    med: [
      'Korte links med egen kode',
      'Klik talt pr. link',
      'QR-kode til hvert link',
      'Udløbsdato og adgangskode',
    ],
    knap: 'Kom i gang',
    til: '/login',
  },
  {
    navn: 'Pro',
    pris: 49,
    linje: 'Til dig der kører kampagner og skal kunne se, hvad der virker.',
    med: [
      'Alt i Gratis',
      'Ubegrænset antal links',
      'Statistik på enhed og kilde',
      'REST-API med egen nøgle',
      'Eksport til CSV',
      'Svar inden for en arbejdsdag',
    ],
    knap: 'Vælg Pro',
    fremhaevet: true,
  },
]

/* Spoergsmaal folk faktisk stiller. Staar som FAQPage i den strukturerede
   data, saa svarene kan citeres direkte i Google og i AI-soegninger. */
const SPOERGSMAAL = [
  {
    q: 'Hvad koster en URL-forkorter?',
    a: 'shr.dk er gratis at bruge med egen kode, klikstatistik, QR-koder, udløbsdato og adgangskode på links. Pro koster 49 kr. om måneden og giver ubegrænset antal links, statistik på enhed og kilde, REST-API og eksport til CSV.',
  },
  {
    q: 'Holder et kort link for evigt?',
    a: 'Ja, medmindre du selv sætter en udløbsdato. Standarden er, at linket aldrig udløber. Sætter du en dato, svarer linket bagefter, at det er udløbet, i stedet for at føre til en side, der ikke findes.',
  },
  {
    q: 'Kan jeg vælge, hvad der står efter shr.dk/?',
    a: 'Ja. Du kan skrive din egen kode, for eksempel shr.dk/okt26, hvis den ikke allerede er taget. Lader du feltet stå tomt, finder systemet en ledig kode selv.',
  },
  {
    q: 'Kan jeg se, hvem der klikker?',
    a: 'Du kan se hvor mange, hvornår, fra hvilken slags enhed og hvor de kom fra. Du kan ikke se, hvem den enkelte person er, og der sættes ingen cookies hos den besøgende.',
  },
  {
    q: 'Kan jeg beskytte et link med en adgangskode?',
    a: 'Ja. Slå adgangskode til, når du opretter linket. Besøgende skal skrive koden, før de sendes videre. Koden gemmes hashet og kan ikke læses af nogen, heller ikke af os.',
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
  const [resultat, setResultat] = useState(null)
  const [henter, setHenter] = useState(false)
  const [fejl, setFejl] = useState('')
  const [kopieret, setKopieret] = useState(false)
  const [koeber, setKoeber] = useState(false)
  const [koebFejl, setKoebFejl] = useState('')

  /**
   * Start betalingen.
   *
   * Betaling kraever en konto, saa er man ikke logget ind, sendes man derhen
   * foerst. Fejler kaldet, staar der hvad man goer i stedet for en raa
   * serverfejl: Stripe er maaske slet ikke sat op endnu.
   */
  const koebPro = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    setKoebFejl('')
    setKoeber(true)
    try {
      const svar = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await svar.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setKoebFejl('Betalingen kunne ikke startes lige nu. Skriv til os, så sætter vi Pro op manuelt.')
    } catch {
      setKoebFejl('Der er ingen forbindelse. Prøv igen om lidt.')
    } finally {
      setKoeber(false)
    }
  }

  useSEO(
    'shr.dk, forkort lange links og se hvem der klikker',
    'Lav korte links med egen kode, udløbsdato og QR. Se antal klik, enhed og kilde for hvert link.'
  )

  /**
   * Forkort med det samme.
   *
   * Ingen konto kraeves, og adressen maa gerne staa uden https. Serveren
   * saetter det paa. Linket er aegte og virker permanent; det er dét, der
   * goer det vaerd at oprette en konto for at kunne foelge det.
   */
  const start = async (e) => {
    e.preventDefault()
    const ren = url.trim()
    if (!ren) return
    setFejl('')
    setHenter(true)
    setResultat(null)
    try {
      const svar = await fetch('/api/public/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: ren }),
      })
      const data = await svar.json()
      if (!svar.ok) {
        setFejl(data.error || 'Linket kunne ikke laves. Prøv igen.')
        return
      }
      setResultat(`${window.location.origin}/${data.short_code}`)
      setUrl('')
    } catch {
      setFejl('Der er ingen forbindelse. Prøv igen om lidt.')
    } finally {
      setHenter(false)
    }
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

          {/* Selve varen. Feltet staar hoejt, fordi det er dét, folk kom efter.
              `type="text"` og ikke `type="url"`: browseren afviser ellers
              "eksempel.dk", fordi der mangler https foran. Serveren saetter
              det paa, saa kravet er kunstigt. */}
          <Band className="mt-11">
            <form onSubmit={start} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                inputMode="url"
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="eksempel.dk/den/lange/adresse"
                aria-label="Adresse der skal forkortes"
                className="u-field h-[56px] flex-1 !text-[15.5px]"
              />
              <button type="submit" disabled={henter} className="u-btn h-[56px] shrink-0">
                {henter ? 'Forkorter' : 'Forkort linket'}
              </button>
            </form>

            {fejl && (
              <p role="alert" className="mt-4 text-[14.5px] text-rust">
                {fejl}
              </p>
            )}

            {!resultat && !fejl && (
              <p className="mt-4 text-[14px] text-ink-faint">
                Du behøver ikke en konto, og du behøver ikke skrive https foran.
              </p>
            )}

            {/* Resultatet. Linket foerst, tilbuddet bagefter. */}
            {resultat && (
              <div className="mt-6 rounded-[8px] border border-go bg-surface p-6 sm:p-7">
                <p className="u-label">Her er dit link</p>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={resultat}
                    target="_blank"
                    rel="noreferrer"
                    className="u-mono break-all text-[clamp(19px,2.6vw,28px)] leading-tight text-go"
                  >
                    {resultat.replace(/^https?:\/\//, '')}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resultat)
                      setKopieret(true)
                      setTimeout(() => setKopieret(false), 1800)
                    }}
                    className="u-btn shrink-0 !min-h-[46px]"
                  >
                    {kopieret ? 'Kopieret' : 'Kopiér'}
                  </button>
                </div>

                <p className="mt-6 text-[15px] leading-[1.6] text-ink-soft">
                  Linket virker nu og udløber ikke. Vil du se hvor mange der klikker, vælge din
                  egen kode eller sætte en udløbsdato, skal du have en plan.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="#priser" className="u-btn w-full sm:w-auto">
                    Se planerne
                  </a>
                  <Link to="/login" className="u-btn-ghost w-full sm:w-auto">
                    Log ind
                  </Link>
                </div>
              </div>
            )}
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

      {/* ----------------------------------------------------------- priser */}
      <section id="priser" className="u-wrap u-gutter u-section-pad">
        <Band>
          <h2 className="u-section-heading max-w-[16ch]">To planer, og ikke flere.</h2>
        </Band>
        <Band>
          <p className="u-lead u-measure mt-6">
            Start gratis. Skift til Pro, når du har brug for flere links og vil kunne se,
            hvor klikkene kommer fra.
          </p>
        </Band>

        {/* To planer side om side. Ingen midterste plan, der kun er der for at
            faa den dyre til at se billig ud, og ingen "Mest populær"-pille. */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PLANER.map((p) => (
            <Band key={p.navn}>
              <div
                className={`flex h-full flex-col rounded-[8px] bg-surface p-8 sm:p-9 ${
                  p.fremhaevet ? 'border-2 border-go' : 'border border-edge'
                }`}
              >
                <h3 className="text-[20px]">{p.navn}</h3>

                <p className="mt-5 flex items-baseline gap-2">
                  <span className="u-mono text-[42px] leading-none tracking-tight text-ink">
                    {p.pris}
                  </span>
                  <span className="text-[15px] text-ink-faint">kr. om måneden</span>
                </p>

                <p className="mt-5 text-[15.5px] leading-[1.55] text-ink-soft">{p.linje}</p>

                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {p.med.map((m) => (
                    <li key={m} className="flex gap-3 text-[15.5px] text-ink-soft">
                      {/* Groen prik frem for et flueben-ikon. Ikonet er det
                          samme i hver anden skabelon. */}
                      <span aria-hidden="true" className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-go" />
                      {m}
                    </li>
                  ))}
                </ul>

                <div className="mt-9">
                  {p.til ? (
                    <Link to={p.til} className="u-btn-ghost w-full">
                      {p.knap}
                    </Link>
                  ) : (
                    <button onClick={koebPro} disabled={koeber} className="u-btn w-full">
                      {koeber ? 'Henter betaling' : p.knap}
                    </button>
                  )}
                </div>
              </div>
            </Band>
          ))}
        </div>

        {koebFejl && (
          <Band>
            <p role="alert" className="mt-6 text-[14.5px] text-rust">
              {koebFejl}
            </p>
          </Band>
        )}

        <Band>
          <p className="mt-8 text-[14px] text-ink-faint">
            Priser er uden moms. Du kan opsige Pro når som helst, og den løber til
            udgangen af den betalte periode.
          </p>
        </Band>
      </section>

      {/* ------------------------------------------------------ spørgsmål */}
      <section className="bg-sunk">
        <div className="u-wrap u-gutter u-section-pad">
          <Band>
            <h2 className="u-section-heading max-w-[18ch]">Det folk spørger om.</h2>
          </Band>

          <dl className="mt-12 flex flex-col">
            {SPOERGSMAAL.map((f, i) => (
              <Band key={f.q}>
                <div className={`grid gap-x-12 gap-y-3 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${
                  i > 0 ? 'border-t border-edge' : ''
                }`}>
                  <dt className="text-[18px] font-medium leading-[1.3]">{f.q}</dt>
                  <dd className="text-[15.5px] leading-[1.6] text-ink-soft">{f.a}</dd>
                </div>
              </Band>
            ))}
          </dl>
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
