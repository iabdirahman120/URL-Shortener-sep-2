import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

function Section({ title, children }) {
    return (
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
        </section>
    )
}

export default function Privacy() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="max-w-2xl mx-auto w-full px-6 py-12">
                <h1 className="text-3xl font-bold text-foreground mb-2">Privatlivspolitik</h1>
                <p className="text-sm text-muted-foreground mb-10">Sidst opdateret: maj 2026</p>

                <Section title="1. Hvem er vi?">
                    <p>shr.dk er en dansk URL-forkortningstjeneste. Vi er dataansvarlige for de personoplysninger vi behandler om dig som bruger af vores service.</p>
                </Section>

                <Section title="2. Hvilke data indsamler vi?">
                    <p>Vi indsamler og behandler følgende data:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Kontooplysninger:</strong> Navn, email og krypteret adgangskode ved oprettelse af konto.</li>
                        <li><strong>Link-data:</strong> De URL'er du forkorter, herunder custom alias og udløbsdato.</li>
                        <li><strong>Klik-statistik:</strong> Tidspunkt for klik, referrer (hvorfra besøgeren kom) og user-agent (enhedstype).</li>
                        <li><strong>Betalingsdata:</strong> Faktureringsoplysninger ved Pro-abonnement behandles af Stripe — vi opbevarer ikke kortdata.</li>
                    </ul>
                </Section>

                <Section title="3. Formål med behandlingen">
                    <p>Vi bruger dine data til at:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Levere og forbedre vores URL-forkortningstjeneste</li>
                        <li>Vise dig klik-statistik for dine links</li>
                        <li>Administrere dit abonnement og fakturering</li>
                        <li>Sende nødvendige transaktionelle emails (fx nulstilling af adgangskode)</li>
                    </ul>
                </Section>

                <Section title="4. Grundlag for behandlingen">
                    <p>Behandlingen sker på grundlag af opfyldelse af aftale (servicelevering) og dit samtykke ved oprettelse af konto, jf. GDPR art. 6, stk. 1, litra b og a.</p>
                </Section>

                <Section title="5. Opbevaring">
                    <p>Vi opbevarer dine data så længe din konto er aktiv. Klik-statistik opbevares i 12 måneder. Du kan til enhver tid anmode om sletning af din konto og tilhørende data ved at kontakte os.</p>
                </Section>

                <Section title="6. Deling af data">
                    <p>Vi sælger ikke dine data. Vi deler kun data med tredjeparter i det omfang det er nødvendigt for at levere servicen (fx Stripe til betalingsbehandling). Alle tredjeparter er databeskyttelseskompliant.</p>
                </Section>

                <Section title="7. Dine rettigheder">
                    <p>Du har ret til at:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Få indsigt i de data vi behandler om dig</li>
                        <li>Få rettet urigtige data</li>
                        <li>Få slettet dine data</li>
                        <li>Gøre indsigelse mod behandlingen</li>
                        <li>Klage til Datatilsynet (datatilsynet.dk)</li>
                    </ul>
                </Section>

                <Section title="8. Kontakt">
                    <p>Har du spørgsmål til vores behandling af persondata, kan du kontakte os på: <a href="mailto:hej@shr.dk" className="text-primary hover:underline">hej@shr.dk</a></p>
                </Section>
            </div>
            <Footer />
        </div>
    )
}
