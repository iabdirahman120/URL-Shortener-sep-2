import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

/**
 * Navbaren.
 *
 * Reglen bag hver linje: **hvert element i baren er én linje tekst.** Ingen
 * ikoner ved siden af ord, ingen knapper i tre forskellige hoejder. Da de fire
 * ting havde hver sin hoejde, centrerede `items-center` kasserne og ikke
 * teksten i dem, og saa sad de paa fire forskellige linjer.
 *
 * Temaskifteren er vaek. Siden har ét udtryk, og det er det moerke. En
 * knap, der laver om paa hele paletten, er en indstilling, ingen bad om, og
 * den dobbelte palette var halvdelen af den gamle CSS.
 */
export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [aaben, setAaben] = useState(false)

  const token = localStorage.getItem('token')
  const erAdmin = localStorage.getItem('is_admin') === 'true'
  const her = (sti) => location.pathname === sti

  const logUd = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('is_admin')
    navigate('/')
  }

  /* Punkter der kraever en konto. Admin har ét ekstra. */
  const punkter = token
    ? [
        ['Links', '/dashboard'],
        ...(erAdmin ? [['Brugere', '/admin']] : []),
        ['API', '/docs'],
        ['Profil', '/settings'],
      ]
    : [['Priser', '/#priser'], ['API', '/docs']]

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-paper/85 backdrop-blur-sm">
      <div className="u-wrap u-gutter flex h-[68px] items-center gap-6">
        {/* Maerket. Selve koden staar i mono, fordi det er en kode. */}
        <Link to="/" className="shrink-0 leading-none" aria-label="shr.dk, forside">
          <span className="u-mono text-[17px] font-medium tracking-tight text-ink">
            shr<span className="text-ink-faint">.dk</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 sm:flex" aria-label="Hovedmenu">
          {punkter.map(([navn, sti]) => (
            <Link
              key={sti}
              to={sti}
              className={`u-link whitespace-nowrap text-[14.5px] leading-none ${
                her(sti) ? 'text-ink' : ''
              }`}
            >
              {navn}
            </Link>
          ))}
          {token ? (
            <button onClick={logUd} className="u-link text-[14.5px] leading-none">
              Log ud
            </button>
          ) : (
            <Link to="/login" className="u-btn !min-h-[38px] !px-5 !text-[14.5px]">
              Log ind
            </Link>
          )}
        </nav>

        {/* Under 640px bliver menuen til én knap. Fire punkter i en 360px bred
            bar giver enten sammenkrøllede ord eller vandret rul. */}
        <button
          onClick={() => setAaben((v) => !v)}
          className="u-mono ml-auto text-[13px] uppercase tracking-[0.12em] text-ink-soft sm:hidden"
          aria-expanded={aaben}
        >
          {aaben ? 'Luk' : 'Menu'}
        </button>
      </div>

      {aaben && (
        <div className="border-t border-edge sm:hidden">
          <nav className="u-wrap u-gutter flex flex-col gap-1 py-4" aria-label="Menu">
            {punkter.map(([navn, sti]) => (
              <Link
                key={sti}
                to={sti}
                onClick={() => setAaben(false)}
                className="py-2.5 text-[16px] text-ink-soft transition-colors hover:text-ink"
              >
                {navn}
              </Link>
            ))}
            {token ? (
              <button onClick={logUd} className="py-2.5 text-left text-[16px] text-ink-soft">
                Log ud
              </button>
            ) : (
              <Link to="/login" onClick={() => setAaben(false)} className="u-btn mt-3">
                Log ind
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
