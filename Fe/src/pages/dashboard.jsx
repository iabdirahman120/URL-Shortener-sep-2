import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useSEO } from '@/hooks/useSEO'

/**
 * Linkregistret.
 *
 * Registret er faelles: ALLE med en konto ser alle links og alle klik, og alle
 * kan oprette. Man kan slette sine egne; en administrator kan slette alt.
 *
 * Det er kun BRUGERE, en administrator opretter. Der er ingen selvbetjent
 * tilmelding.
 *
 * Derfor staar ejerens navn paa hver raekke. Naar alle ser alt, er en liste
 * uden afsender bare en bunke koder.
 */

const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://shr.dk'

/** Er linket loebet ud? Datoen kan vaere null, og det betyder "aldrig". */
function erUdloebet(link) {
  return Boolean(link.expires_at) && new Date(link.expires_at) < new Date()
}

function dansk(dato) {
  if (!dato) return null
  return new Date(dato).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ------------------------------------------------------------------ kopiér */

function Kopier({ tekst }) {
  const [kopieret, setKopieret] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(tekst)
        setKopieret(true)
        setTimeout(() => setKopieret(false), 1600)
      }}
      className="u-link u-mono text-[13px]"
    >
      {/* Knappen siger hvad der skete, ikke hvad den hedder. */}
      {kopieret ? 'Kopieret' : 'Kopiér'}
    </button>
  )
}

/* ----------------------------------------------------------------- statistik */

function Statistik({ link, token, luk }) {
  const [data, setData] = useState(null)
  const [fejl, setFejl] = useState('')

  useEffect(() => {
    fetch(`/api/urls/${link.id}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setFejl('Kunne ikke hente statistikken.'))
  }, [link.id, token])

  const maks = data?.daily?.length ? Math.max(...data.daily.map((d) => Number(d.clicks) || 0), 1) : 1

  return (
    <div className="border-t border-edge bg-sunk px-5 py-7 sm:px-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="u-label">Klik, seneste 30 dage</p>
        <button onClick={luk} className="u-link u-mono text-[13px]">
          Luk
        </button>
      </div>

      {fejl && <p className="mt-5 text-[14.5px] text-rust">{fejl}</p>}
      {!data && !fejl && <p className="mt-5 text-[14.5px] text-ink-faint">Henter</p>}

      {data && (
        <>
          {/* Soejlerne tegnes i CSS. Et diagrambibliotek til tredive tal er
              300 kB for noget, der er tredive divs. */}
          <div className="mt-6 flex h-[110px] items-end gap-[3px]" role="img"
               aria-label={`Klik pr. dag, højeste ${maks}`}>
            {data.daily.map((d) => {
              const n = Number(d.clicks) || 0
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${n} klik`}
                  className="flex-1 rounded-[2px] bg-go/25 transition-colors hover:bg-ink"
                  style={{ height: `${Math.max(2, (n / maks) * 100)}%` }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex justify-between">
            <span className="u-mono text-[11.5px] text-ink-faint">30 dage siden</span>
            <span className="u-mono text-[11.5px] text-ink-faint">i dag</span>
          </div>

          <div className="mt-9 grid gap-8 sm:grid-cols-2">
            {[
              ['Enheder', data.devices, 'user_agent'],
              ['Kom fra', data.referrers, 'referrer'],
            ].map(([titel, raekker, noegle]) => (
              <div key={titel}>
                <p className="u-label">{titel}</p>
                {raekker?.length ? (
                  <ul className="mt-4 flex flex-col gap-2">
                    {raekker.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex justify-between gap-4 text-[14.5px]">
                        <span className="truncate text-ink-soft">{r[noegle] || 'Ukendt'}</span>
                        <span className="u-mono shrink-0 text-ink">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-[14.5px] text-ink-faint">Ingen klik endnu.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- valg */

/**
 * To knapper, hvor den ene altid er valgt.
 *
 * Bevidst ikke et afkrydsningsfelt: et tomt felt siger ikke, hvad der sker,
 * hvis man lader vaere. Her staar standarden skrevet ud, saa "Udloeber aldrig"
 * er noget man kan laese frem for noget, man skal gaette sig til.
 */
function Valg({ navn, valgt, saet, fra, til }) {
  return (
    <div className="mt-4 inline-flex rounded-[5px] border border-edge p-1" role="radiogroup" aria-label={navn}>
      {[
        [false, fra],
        [true, til],
      ].map(([v, tekst]) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={valgt === v}
          onClick={() => saet(v)}
          className={`rounded-[3px] px-3.5 py-2 text-[13.5px] transition-colors ${
            valgt === v ? 'bg-go text-white' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {tekst}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ én række */

function Raekke({ link, minId, erAdmin, token, slet }) {
  const [viser, setViser] = useState(null) // 'qr' | 'stats' | null
  const kort = `${BASE}/${link.custom_alias || link.short_code}`
  const doed = erUdloebet(link)

  return (
    <div className="border-t border-edge first:border-t-0">
      <div className="grid gap-x-8 gap-y-4 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <a
              href={kort}
              target="_blank"
              rel="noreferrer"
              className={`u-mono text-[19px] tracking-tight ${doed ? 'text-ink-faint line-through' : 'text-ink'}`}
            >
              {kort.replace(/^https?:\/\//, '')}
            </a>
            <Kopier tekst={kort} />
            {/* Farve bruges kun her, og kun til én ting. */}
            {doed && <span className="u-mono text-[12px] uppercase tracking-[0.1em] text-rust">Udløbet</span>}
            {link.has_password && (
              <span className="u-mono text-[12px] uppercase tracking-[0.1em] text-ink-faint">Kodeord</span>
            )}
          </div>

          <p className="u-mono mt-3 truncate text-[13px] text-ink-faint" title={link.original_url}>
            {link.original_url}
          </p>

          <p className="mt-3 text-[13.5px] text-ink-faint">
            {link.ejer_navn || 'Ukendt bruger'}
            {link.created_at && <> · oprettet {dansk(link.created_at)}</>}
            {link.expires_at && <> · udløber {dansk(link.expires_at)}</>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
          <div className="text-right">
            <p className="u-mono text-[24px] leading-none text-ink">{link.clicks ?? 0}</p>
            <p className="u-label mt-1.5">klik</p>
          </div>
          <button
            onClick={() => setViser(viser === 'stats' ? null : 'stats')}
            className="u-link text-[14px]"
          >
            Statistik
          </button>
          <button onClick={() => setViser(viser === 'qr' ? null : 'qr')} className="u-link text-[14px]">
            QR
          </button>
          {(erAdmin || link.user_id === minId) && (
            <button
              onClick={() => slet(link.id)}
              className="u-link text-[14px] hover:!text-rust"
            >
              Slet
            </button>
          )}
        </div>
      </div>

      {viser === 'qr' && (
        <div className="border-t border-edge bg-sunk px-5 py-7 sm:px-7">
          <div className="flex flex-wrap items-center gap-7">
            {/* Hvid baggrund bag koden. En QR paa moerk bund kan mange
                telefonkameraer ikke laese. */}
            <div className="rounded-[3px] bg-white p-4">
              <QRCodeSVG value={kort} size={132} level="M" />
            </div>
            <div>
              <p className="u-label">QR-kode</p>
              <p className="u-mono mt-3 text-[14px] text-fg">{kort.replace(/^https?:\/\//, '')}</p>
              <button onClick={() => setViser(null)} className="u-link mt-4 block text-[13.5px]">
                Luk
              </button>
            </div>
          </div>
        </div>
      )}

      {viser === 'stats' && <Statistik link={link} token={token} luk={() => setViser(null)} />}
    </div>
  )
}

/* ------------------------------------------------------------------- siden */

export default function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const erAdmin = localStorage.getItem('is_admin') === 'true'

  // Mit eget bruger-id laeses ud af tokenet. Det er ikke en sikkerhedsgraense,
  // kun til at afgoere om slet-knappen skal staa paa raekken. Serveren
  // kontrollerer ejerskabet uanset hvad browseren paastaar.
  const minId = (() => {
    try {
      return JSON.parse(atob((token || '').split('.')[1] || '')).userId ?? null
    } catch {
      return null
    }
  })()

  const [links, setLinks] = useState([])
  const [henter, setHenter] = useState(true)
  const [fejl, setFejl] = useState('')

  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [udloeber, setUdloeber] = useState('')
  const [kode, setKode] = useState('')
  // Standarden er "aldrig" og "ingen kodeord". Det staar som en valgt knap
  // og ikke som et tomt felt, saa man kan se, hvad der sker, hvis man ikke
  // roerer noget.
  const [harUdloeb, setHarUdloeb] = useState(false)
  const [harKode, setHarKode] = useState(false)
  const [opretter, setOpretter] = useState(false)
  const [opretFejl, setOpretFejl] = useState('')

  const [soeg, setSoeg] = useState('')

  useSEO('Links | shr.dk', 'Alle korte links og deres klik.')

  const hent = useCallback(() => {
    fetch('/api/urls/my-links', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          navigate('/login')
          return []
        }
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => setLinks(Array.isArray(d) ? d : []))
      .catch(() => setFejl('Kunne ikke hente listen. Prøv at genindlæse.'))
      .finally(() => setHenter(false))
  }, [token, navigate])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    // Skrev man en adresse paa forsiden, staar den klar her i stedet for at
    // skulle indsaettes igen.
    const gemt = sessionStorage.getItem('shr_url')
    if (gemt) {
      setUrl(gemt)
      sessionStorage.removeItem('shr_url')
    }
    hent()
  }, [token, navigate, hent])

  const opret = async (e) => {
    e.preventDefault()
    setOpretFejl('')
    setOpretter(true)
    try {
      const svar = await fetch('/api/urls/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          originalUrl: url,
          custom_alias: alias || undefined,
          expires_at: harUdloeb && udloeber ? udloeber : undefined,
          password: harKode && kode ? kode : undefined,
        }),
      })
      const data = await svar.json()
      if (!svar.ok) {
        setOpretFejl(data.error || data.message || 'Linket kunne ikke oprettes.')
        return
      }
      setUrl('')
      setAlias('')
      setUdloeber('')
      setKode('')
      setHarUdloeb(false)
      setHarKode(false)
      hent()
    } catch {
      setOpretFejl('Kunne ikke få forbindelse. Prøv igen om lidt.')
    } finally {
      setOpretter(false)
    }
  }

  const slet = async (id) => {
    if (!window.confirm('Slet linket? Besøgende, der har det, vil få en fejl.')) return
    await fetch(`/api/urls/delete/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    hent()
  }

  const csv = () => {
    const raekker = [
      ['kort_kode', 'original_url', 'klik', 'ejer', 'oprettet', 'udloeber'],
      ...links.map((l) => [
        l.custom_alias || l.short_code,
        l.original_url,
        l.clicks ?? 0,
        l.ejer_navn || '',
        l.created_at || '',
        l.expires_at || '',
      ]),
    ]
    const tekst = raekker.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([tekst], { type: 'text/csv;charset=utf-8' }))
    a.download = `shr-links-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const fundet = links.filter((l) => {
    if (!soeg.trim()) return true
    const n = soeg.toLowerCase()
    return (
      (l.custom_alias || l.short_code || '').toLowerCase().includes(n) ||
      (l.original_url || '').toLowerCase().includes(n) ||
      (l.ejer_navn || '').toLowerCase().includes(n)
    )
  })

  const klikIAlt = links.reduce((s, l) => s + (Number(l.clicks) || 0), 0)

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="u-wrap u-gutter flex-1 py-[clamp(48px,7vw,96px)]">
        <p className="u-label">Linkregister</p>
        <h1 className="u-section-heading mt-6">Alle links.</h1>

        {/* Tallene er talt paa listen, ikke paastaaet. */}
        <p className="u-measure-wide mt-7 text-ink-soft">
          {links.length} {links.length === 1 ? 'link' : 'links'} og {klikIAlt} klik i alt.
          Alle med en konto kan se hele listen og oprette nye.
        </p>

        {/* ---------------------------------------------- opret, alle brugere */}
        <form onSubmit={opret} className="mt-14 border-t border-edge pt-10">
          <p className="u-label">Nyt link</p>

          {/* Det paakraevede staar for sig selv og fylder mest. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://eksempel.dk/den/lange/adresse"
              className="u-field flex-1"
              aria-label="Lang adresse"
            />
            <button type="submit" disabled={opretter} className="u-btn shrink-0">
              {opretter ? 'Opretter' : 'Opret link'}
            </button>
          </div>

          <div className="mt-9 rounded-[7px] border border-edge bg-surface p-6 sm:p-7">
            <p className="u-label">Valgfrit</p>
            <p className="mt-2 text-[14px] text-ink-soft">
              Rører du ikke noget herunder, får linket en tilfældig kode, udløber aldrig
              og kan åbnes af alle, der har det.
            </p>

            <div className="mt-7 grid gap-8 md:grid-cols-3">
              {/* ------------------------------------------------ egen kode */}
              <div>
                <label htmlFor="alias" className="block text-[15px] font-medium">
                  Egen kode
                </label>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-faint">
                  Ellers finder systemet en ledig.
                </p>
                <input
                  id="alias"
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="okt26"
                  className="u-field mt-3"
                />
              </div>

              {/* ----------------------------------------------- udløbsdato */}
              <div>
                <p className="text-[15px] font-medium">Udløb</p>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-faint">
                  Efter datoen svarer linket, at det er udløbet.
                </p>
                <Valg
                  navn="udloeb"
                  valgt={harUdloeb}
                  saet={setHarUdloeb}
                  fra="Udløber aldrig"
                  til="Vælg dato"
                />
                {harUdloeb && (
                  <input
                    type="date"
                    value={udloeber}
                    onChange={(e) => setUdloeber(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="u-field mt-3"
                    aria-label="Udløbsdato"
                  />
                )}
              </div>

              {/* -------------------------------------------------- kodeord */}
              <div>
                <p className="text-[15px] font-medium">Adgangskode</p>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-faint">
                  Besøgende skal skrive koden, før de sendes videre.
                </p>
                <Valg
                  navn="kodeord"
                  valgt={harKode}
                  saet={setHarKode}
                  fra="Åbent for alle"
                  til="Kræv kode"
                />
                {harKode && (
                  <input
                    type="text"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="kodeord til linket"
                    className="u-field mt-3"
                    aria-label="Adgangskode på linket"
                  />
                )}
              </div>
            </div>
          </div>

          {opretFejl && (
            <p role="alert" className="mt-5 text-[14.5px] text-rust">
              {opretFejl}
            </p>
          )}
        </form>

        {/* ------------------------------------------------------------ listen */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-edge pt-10">
          <input
            type="search"
            value={soeg}
            onChange={(e) => setSoeg(e.target.value)}
            placeholder="Søg i kode, adresse eller ejer"
            className="u-field max-w-[380px]"
            aria-label="Søg"
          />
          {links.length > 0 && (
            <button onClick={csv} className="u-link text-[14px]">
              Hent som CSV
            </button>
          )}
        </div>

        <div className="mt-8">
          {henter && <p className="py-10 text-ink-faint">Henter listen</p>}

          {fejl && (
            <p role="alert" className="py-10 text-rust">
              {fejl}
            </p>
          )}

          {!henter && !fejl && links.length === 0 && (
            <p className="py-10 text-ink-soft">
              Der er ingen links endnu.
              {' Opret det første i feltet ovenfor.'}
            </p>
          )}

          {!henter && !fejl && links.length > 0 && fundet.length === 0 && (
            <p className="py-10 text-ink-soft">
              Ingen links matcher <span className="u-mono text-fg">{soeg}</span>.
            </p>
          )}

          {fundet.map((l) => (
            <Raekke key={l.id} link={l} minId={minId} erAdmin={erAdmin} token={token} slet={slet} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
