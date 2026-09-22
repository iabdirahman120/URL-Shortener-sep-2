import { useEffect, useRef } from 'react'

/**
 * Scroll-spotlightet.
 *
 * Porteret fra zng.dk, hvor formen blev maalt ved at koere en blok gennem
 * skaermen i 100px-spring og aflaese dens opacitet:
 *
 *   midte 957px -> 0,000      midte 157px -> 0,991
 *   midte 857px -> 0,865      midte  57px -> 0,113
 *   midte 757px -> 1,000      midte -43px -> 0,000
 *
 * Det er altsaa ikke en klokkekurve, men et haardt baand: indholdet staar fuldt
 * oplyst gennem de midterste ~80% af skaermen og falmer over cirka 100px i hver
 * kant. Det afgoerende er, at det falmer UD igen paa vej forbi. Det er dét, der
 * faar siden til at laese som et spotlight frem for som en liste af ting, der
 * er dukket op.
 */
const TOP_EDGE = 0.05
const TOP_FULL = 0.16
const BOTTOM_FULL = 0.86
const BOTTOM_EDGE = 0.96

/**
 * Samme form, men et smallere fade paa smaa skaerme.
 *
 * Tallene ovenfor er maalt i et 900px hoejt vindue, hvor der altid er flere
 * blokke paa skaermen: én maa gerne vaere falmet i kanten, naar to andre staar
 * oplyst i midten. Paa en telefon er der som regel kun én blok ad gangen, og
 * med 21% af skaermen som fade-zone endte man gang paa gang med en skaerm, hvor
 * toppen var paa vej ud og bunden endnu ikke var kommet ind. Derfor bunder
 * mobilen i 0,35 i stedet for i sort.
 */
const MOBIL_TOP_EDGE = 0.0
const MOBIL_TOP_FULL = 0.42
const MOBIL_BOTTOM_FULL = 0.58
const MOBIL_BOTTOM_EDGE = 1.0
const MOBIL_MIN = 0.45

/**
 * Det punkt paa blokken, baandet maaler paa.
 *
 * Over 1024px er det blokkens egen midte. Derunder er det midten af den
 * SYNLIGE del: en blok, der er hoejere end skaermen, har sin midte uden for
 * skaermen det meste af tiden, og saa ville hele blokken staa paa opacity 0,
 * mens den fyldte hele skaermen.
 */
function bandCentre(top, height, vh, vw) {
  if (vw >= 1024) return top + height / 2
  const synligTop = Math.max(top, 0)
  const synligBund = Math.min(top + height, vh)
  if (synligBund <= synligTop) return top + height / 2
  return (synligTop + synligBund) / 2
}

function bandOpacity(centre, vh, vw) {
  const lille = vw < 1024
  const kantTop = lille ? MOBIL_TOP_EDGE : TOP_EDGE
  const fuldTop = lille ? MOBIL_TOP_FULL : TOP_FULL
  const fuldBund = lille ? MOBIL_BOTTOM_FULL : BOTTOM_FULL
  const kantBund = lille ? MOBIL_BOTTOM_EDGE : BOTTOM_EDGE

  // Bunden er 0,25 og ikke 0. Paa lys bund ligner en helt usynlig blok en
  // fejl, hvor der mangler tekst. Paa moerk bund lignede den bare moerke.
  const BUND = lille ? MOBIL_MIN : 0.25
  const t = centre / vh
  if (t <= kantTop || t >= kantBund) return BUND

  const loft = (v) => BUND + (1 - BUND) * v
  if (t < fuldTop) return loft((t - kantTop) / (fuldTop - kantTop))
  if (t > fuldBund) return loft((kantBund - t) / (kantBund - fuldBund))
  return 1
}

/**
 * Én delt animationssloejfe for hele siden.
 *
 * Hver blok kunne have sin egen scroll-lytter, men saa koerer der tyve
 * lyttere paa samme begivenhed. Her staar der én sloejfe, og den stopper helt,
 * naar ingen blokke er tilmeldt.
 */
const tilmeldte = new Set()
let koerer = false

function frame() {
  const vh = window.innerHeight
  const vw = window.innerWidth
  for (const el of tilmeldte) {
    const r = el.getBoundingClientRect()
    const c = bandCentre(r.top, r.height, vh, vw)
    el.style.opacity = String(bandOpacity(c, vh, vw))
  }
  koerer = tilmeldte.size > 0
  if (koerer) requestAnimationFrame(frame)
}

/**
 * Saet `ref` paa den blok, der skal falme med.
 *
 * Blokken skal vaere lille nok til at staa paa en skaerm ad gangen. Et helt
 * afsnit fungerer; en hel sektion goer ikke, for saa staar alt paa nul, mens
 * det fylder skaermen.
 */
export function useBand() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respekterer brugerens systemvalg. Er bevaegelse slaaet fra, staar
    // blokken bare fuldt oplyst.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      return
    }

    tilmeldte.add(el)
    if (!koerer) {
      koerer = true
      requestAnimationFrame(frame)
    }
    return () => {
      tilmeldte.delete(el)
      el.style.opacity = '1'
    }
  }, [])

  return ref
}
