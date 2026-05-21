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

export default function Terms() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="max-w-2xl mx-auto w-full px-6 py-12">
                <h1 className="text-3xl font-bold text-foreground mb-2">Vilkår og betingelser</h1>
                <p className="text-sm text-muted-foreground mb-10">Sidst opdateret: maj 2026</p>

                <Section title="1. Accept af vilkår">
                    <p>Ved at oprette en konto på shr.dk accepterer du disse vilkår og betingelser. Hvis du ikke accepterer vilkårene, bedes du undlade at bruge tjenesten.</p>
                </Section>

                <Section title="2. Brug af tjenesten">
                    <p>Du må bruge shr.dk til at forkorte URL'er til lovlige formål. Det er ikke tilladt at:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Forkorte links til ulovligt indhold, malware, phishing eller spam</li>
                        <li>Omgå geo-restriktioner eller ophavsretsbeskyttelse</li>
                        <li>Bruge tjenesten til at bedrage eller vildlede andre brugere</li>
                        <li>Overbelaste vores servere med automatiserede anmodninger</li>
                    </ul>
                </Section>

                <Section title="3. Gratis konto">
                    <p>Gratis konti kan oprette op til 50 aktive links. Vi forbeholder os retten til at begrænse eller lukke konti der misbruges.</p>
                </Section>

                <Section title="4. Pro-abonnement">
                    <p>Pro-abonnementet faktureres månedligt via Stripe. Du kan til enhver tid opsige abonnementet. Der refunderes ikke for igangværende betalingsperioder.</p>
                </Section>

                <Section title="5. Tilgængelighed">
                    <p>Vi stræber efter høj oppetid, men kan ikke garantere 100% tilgængelighed. Vi forbeholder os retten til at foretage vedligeholdelse og opdateringer, som midlertidigt kan påvirke tjenesten.</p>
                </Section>

                <Section title="6. Links og indhold">
                    <p>Du er ansvarlig for det indhold dine korte links peger på. shr.dk overvåger ikke aktivt destinationerne for kortlinks, men vi forbeholder os retten til at slette links der krænker disse vilkår.</p>
                </Section>

                <Section title="7. Opsigelse">
                    <p>Du kan til enhver tid slette din konto via indstillingssiden. Vi kan opsige eller suspendere din konto ved brud på disse vilkår.</p>
                </Section>

                <Section title="8. Ansvarsbegrænsning">
                    <p>shr.dk stilles til rådighed "som den er". Vi påtager os intet ansvar for tab som følge af brug eller manglende adgang til tjenesten.</p>
                </Section>

                <Section title="9. Ændringer">
                    <p>Vi forbeholder os retten til at ændre disse vilkår. Væsentlige ændringer varsles via email til registrerede brugere.</p>
                </Section>

                <Section title="10. Kontakt">
                    <p>Spørgsmål til vilkårene kan sendes til: <a href="mailto:hej@shr.dk" className="text-primary hover:underline">hej@shr.dk</a></p>
                </Section>
            </div>
            <Footer />
        </div>
    )
}
