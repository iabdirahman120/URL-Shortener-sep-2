/**
 * Haandterer en udloebet session ét sted.
 *
 * Et token holder syv dage. Derefter svarer serveren 401 "Ugyldig token", og
 * indtil nu viste siden bare den besked i roedt ved siden af en tom liste.
 * Man kunne ikke se, at man skulle logge ind igen, og et genindlaes hjalp
 * ikke, for tokenet laa stadig i localStorage.
 *
 * Der er 25 steder i frontenden, der henter med et token, og kun ét af dem
 * haandterede 401. I stedet for at rette dem hver for sig, laegges det her:
 * `fetch` pakkes ind én gang, og et 401-svar paa vores eget API rydder
 * sessionen og sender til login.
 *
 * Kun kald til /api/ roeres. Et 401 fra Stripe eller en tredjepart skal ikke
 * logge nogen ud.
 */
export function opsaetSession() {
  const original = window.fetch

  window.fetch = async (input, init) => {
    const svar = await original(input, init)

    if (svar.status !== 401) return svar

    const adresse = typeof input === 'string' ? input : input?.url || ''
    const vores = adresse.startsWith('/api/') || adresse.includes(window.location.host + '/api/')
    if (!vores) return svar

    // Login-kaldet svarer ogsaa 401 ved forkert adgangskode. Dér skal
    // brugeren blive staaende og se fejlen, ikke sendes rundt i ring.
    if (adresse.includes('/api/auth/login')) return svar

    localStorage.removeItem('token')
    localStorage.removeItem('is_admin')

    if (window.location.pathname !== '/login') {
      // `udloebet` faar login-siden til at forklare, hvorfor man er havnet
      // der. Uden den ligner det, at man bare blev smidt ud.
      window.location.replace('/login?udloebet=1')
    }
    return svar
  }
}
