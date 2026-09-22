import { Link } from 'react-router-dom'

/**
 * Footeren.
 *
 * To grupper og en bundlinje. Ikke fire spalter med ét link i hver, som er
 * et gitter der laader som om der er mere indhold, end der er.
 */
const GRUPPER = [
  ['Produkt', [['Sådan virker det', '/'], ['API', '/docs'], ['Log ind', '/login']]],
  ['Juridisk', [['Privatlivspolitik', '/privacy'], ['Betingelser', '/terms']]],
]

export function Footer() {
  const aar = new Date().getFullYear()

  return (
    <footer className="border-t border-edge bg-paper">
      <div className="u-wrap u-gutter grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="u-mono text-[17px] font-medium tracking-tight text-ink">
            shr<span className="text-ink-faint">.dk</span>
          </span>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.6] text-ink-soft">
            Korte links med klikstatistik, QR-koder og udløbsdato. Dansk domæne, dansk
            hosting og ingen sporing af dine besøgende ud over det, du selv kan se.
          </p>
        </div>

        {GRUPPER.map(([titel, links]) => (
          <nav key={titel} aria-label={titel}>
            <p className="u-label">{titel}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {links.map(([navn, sti]) => (
                <li key={navn + sti}>
                  <Link to={sti} className="u-link text-[15px]">
                    {navn}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-edge-soft">
        <div className="u-wrap u-gutter flex flex-wrap items-center justify-between gap-4 py-7">
          <p className="u-mono text-[12.5px] text-ink-faint">© {aar} shr.dk</p>
          <p className="u-mono text-[12.5px] text-ink-faint">Drevet i Danmark</p>
        </div>
      </div>
    </footer>
  )
}
