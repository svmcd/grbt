import { defineMessages } from "../define";

// Reusable marketing sections: FamilyOffer (homepage), NewsletterSignup (footer); `trust` is kept for the footer
type Signal = { title: string; description: string; details: string };

export default defineMessages({
    en: {
        trust: {
            title: "WHY EĞRİKUYU?",
            subtitle: "Products that bring together quality, trust and love for the homeland",
            signals: [
                {
                    title: "100% Cotton",
                    description: "Premium 240 g/m² cotton fabric",
                    details: "High-quality cotton fabric provides durability and comfort.",
                },
                {
                    title: "Shipped from the Netherlands",
                    description: "Shipped directly from our workshop in the Netherlands",
                    details: "All our products are made and shipped from our modern workshop in the Netherlands.",
                },
                {
                    title: "Same-Day Dispatch",
                    description: "Order before 20:00, shipped the same day",
                    details: "Orders placed before 20:00 are handed to the carrier the same day.",
                },
                {
                    title: "Fast Shipping",
                    description: "Delivery within Europe in 2-6 days",
                    details: "Secure delivery to European countries within 2-6 business days.",
                },
                {
                    title: "Free Shipping",
                    description: "Free shipping on orders over €100",
                    details: "No shipping fee on orders of €100 or more.",
                },
                {
                    title: "60-Day Returns",
                    description: "Right of return within 60 days",
                    details: "If you are not satisfied with your product, you can return it free of charge within 60 days.",
                },
                {
                    title: "Insured Shipping",
                    description: "Insured delivery with a tracking number",
                    details: "All our shipments are insured and can be followed with a tracking number.",
                },
                {
                    title: "24/7 Support",
                    description: "Customer support 24 hours a day, 7 days a week",
                    details: "For any question, our customer service is available 24 hours a day, 7 days a week.",
                },
                {
                    title: "Premium Packaging",
                    description: "Free premium packaging",
                    details: "All our products are shipped in specially designed premium packaging.",
                },
            ] as Signal[],
        },
        family: {
            badge: "SPECIAL FAMILY OFFER",
            title: "YOUR PARENTS' HOMETOWNS",
            hook: "Carry your roots together, strengthen your bonds",
            oneShirt: "1 T-shirt",
            twoShirts: "2 T-shirts",
            threeShirts: "3+ T-shirts",
            regularPrice: "Regular price",
            twoFor: "For your mother's and father's hometowns",
            threeFor: "If you would like more",
            mixCities: "You can choose from different cities",
        },
        newsletter: {
            thanks: "Thank you! You have successfully subscribed to our newsletter.",
            title: "News and Special Offers",
            intro: "Be the first to hear about new collections and special discounts.",
            placeholder: "Your email address",
            subscribe: "SUBSCRIBE",
            privacy: "We only use your email address to send the newsletter. You can unsubscribe at any time.",
        },
    },
    de: {
        trust: {
            title: "WARUM EĞRİKUYU?",
            subtitle: "Produkte, die Qualität, Vertrauen und Heimatliebe vereinen",
            signals: [
                {
                    title: "100 % Baumwolle",
                    description: "Baumwollstoff in Premiumqualität mit 240 g/m²",
                    details: "Hochwertiger Baumwollstoff sorgt für Haltbarkeit und Komfort.",
                },
                {
                    title: "Versand aus den Niederlanden",
                    description: "Direktversand aus unserer Werkstatt in den Niederlanden",
                    details: "Alle unsere Produkte werden in unserer modernen Werkstatt in den Niederlanden hergestellt und versendet.",
                },
                {
                    title: "Versand am selben Tag",
                    description: "Bestellung vor 20:00 Uhr, Versand am selben Tag",
                    details: "Bestellungen, die vor 20:00 Uhr eingehen, werden am selben Tag dem Versanddienst übergeben.",
                },
                {
                    title: "Schneller Versand",
                    description: "Lieferung innerhalb Europas in 2-6 Tagen",
                    details: "Sichere Lieferung in europäische Länder innerhalb von 2-6 Werktagen.",
                },
                {
                    title: "Kostenloser Versand",
                    description: "Kostenloser Versand bei Bestellungen über 100 €",
                    details: "Ab einem Bestellwert von 100 € fallen keine Versandkosten an.",
                },
                {
                    title: "60 Tage Rückgabe",
                    description: "Rückgaberecht innerhalb von 60 Tagen",
                    details: "Wenn Sie mit Ihrem Produkt nicht zufrieden sind, können Sie es innerhalb von 60 Tagen kostenlos zurückgeben.",
                },
                {
                    title: "Versicherter Versand",
                    description: "Versicherter Versand mit Sendungsnummer",
                    details: "Alle unsere Sendungen sind versichert und können mit einer Sendungsnummer verfolgt werden.",
                },
                {
                    title: "Support rund um die Uhr",
                    description: "Kundensupport an 7 Tagen, 24 Stunden",
                    details: "Bei Fragen erreichen Sie unseren Kundenservice an 7 Tagen der Woche rund um die Uhr.",
                },
                {
                    title: "Premium-Verpackung",
                    description: "Kostenlose Premium-Verpackung",
                    details: "Alle unsere Produkte werden in eigens gestalteten Premium-Verpackungen versendet.",
                },
            ],
        },
        family: {
            badge: "BESONDERES FAMILIENANGEBOT",
            title: "DIE HEIMAT IHRER ELTERN",
            hook: "Tragen Sie Ihre Wurzeln gemeinsam und stärken Sie Ihre Verbundenheit",
            oneShirt: "1 T-Shirt",
            twoShirts: "2 T-Shirts",
            threeShirts: "3+ T-Shirts",
            regularPrice: "Normalpreis",
            twoFor: "Für die Heimatstädte Ihrer Mutter und Ihres Vaters",
            threeFor: "Wenn Sie mehr möchten",
            mixCities: "Sie können verschiedene Städte auswählen",
        },
        newsletter: {
            thanks: "Vielen Dank! Sie haben unseren Newsletter erfolgreich abonniert.",
            title: "Neuigkeiten und Sonderangebote",
            intro: "Erfahren Sie zuerst von neuen Kollektionen und besonderen Rabatten.",
            placeholder: "Ihre E-Mail-Adresse",
            subscribe: "ABONNIEREN",
            privacy: "Wir verwenden Ihre E-Mail-Adresse ausschließlich für den Versand des Newsletters. Sie können sich jederzeit abmelden.",
        },
    },
    fr: {
        trust: {
            title: "POURQUOI EĞRİKUYU ?",
            subtitle: "Des produits qui réunissent qualité, confiance et amour du pays natal",
            signals: [
                {
                    title: "100 % coton",
                    description: "Tissu en coton premium de 240 g/m²",
                    details: "Un tissu en coton de haute qualité, résistant et confortable.",
                },
                {
                    title: "Expédié des Pays-Bas",
                    description: "Expédition directe depuis notre atelier aux Pays-Bas",
                    details: "Tous nos produits sont fabriqués et expédiés depuis notre atelier moderne aux Pays-Bas.",
                },
                {
                    title: "Expédition le jour même",
                    description: "Commandez avant 20h00, expédition le jour même",
                    details: "Les commandes passées avant 20h00 sont remises au transporteur le jour même.",
                },
                {
                    title: "Livraison rapide",
                    description: "Livraison en Europe en 2 à 6 jours",
                    details: "Livraison sécurisée vers les pays européens en 2 à 6 jours ouvrés.",
                },
                {
                    title: "Livraison gratuite",
                    description: "Livraison gratuite pour les commandes de plus de 100 €",
                    details: "Aucuns frais de livraison pour les commandes de 100 € ou plus.",
                },
                {
                    title: "Retours sous 60 jours",
                    description: "Droit de retour sous 60 jours",
                    details: "Si votre produit ne vous satisfait pas, vous pouvez le retourner gratuitement sous 60 jours.",
                },
                {
                    title: "Envoi assuré",
                    description: "Envoi assuré avec numéro de suivi",
                    details: "Tous nos envois sont assurés et peuvent être suivis grâce à un numéro de suivi.",
                },
                {
                    title: "Assistance 24h/24, 7j/7",
                    description: "Service client 7 jours sur 7, 24 heures sur 24",
                    details: "Pour toute question, notre service client est disponible 7 jours sur 7, 24 heures sur 24.",
                },
                {
                    title: "Emballage premium",
                    description: "Emballage premium offert",
                    details: "Tous nos produits sont expédiés dans un emballage premium spécialement conçu.",
                },
            ],
        },
        family: {
            badge: "OFFRE FAMILLE SPÉCIALE",
            title: "LA VILLE NATALE DE VOS PARENTS",
            hook: "Portez vos racines ensemble, renforcez vos liens",
            oneShirt: "1 t-shirt",
            twoShirts: "2 t-shirts",
            threeShirts: "3+ t-shirts",
            regularPrice: "Prix normal",
            twoFor: "Pour les villes natales de votre mère et de votre père",
            threeFor: "Si vous en voulez davantage",
            mixCities: "Vous pouvez choisir des villes différentes",
        },
        newsletter: {
            thanks: "Merci ! Votre inscription à notre newsletter a bien été prise en compte.",
            title: "Actualités et offres spéciales",
            intro: "Soyez informé en avant-première des nouvelles collections et des remises spéciales.",
            placeholder: "Votre adresse e-mail",
            subscribe: "S'ABONNER",
            privacy: "Nous utilisons votre adresse e-mail uniquement pour l'envoi de la newsletter. Vous pouvez vous désabonner à tout moment.",
        },
    },
    tr: {
        trust: {
            title: "NEDEN EĞRİKUYU?",
            subtitle: "Kalite, güven ve memleket sevgisini bir araya getiren ürünlerimiz",
            signals: [
                {
                    title: "100% Pamuk",
                    description: "Premium kalitede 240 gram/m² pamuklu kumaş",
                    details: "Yüksek kaliteli pamuklu kumaş, dayanıklılık ve konfor sağlar.",
                },
                {
                    title: "Hollanda'dan Gönderim",
                    description: "Hollanda'daki atölyemizden direkt gönderim",
                    details: "Tüm ürünlerimiz Hollanda'daki modern atölyemizde üretilir ve gönderilir.",
                },
                {
                    title: "Aynı Gün Gönderim",
                    description: "20:00'dan önce sipariş ver, aynı gün gönder",
                    details: "Saat 20:00'dan önce verilen siparişler aynı gün içinde kargoya verilir.",
                },
                {
                    title: "Hızlı Kargo",
                    description: "Avrupa içi 2-6 gün teslimat",
                    details: "Avrupa ülkelerine 2-6 iş günü içinde güvenli teslimat.",
                },
                {
                    title: "Ücretsiz Kargo",
                    description: "€100 üzeri siparişlerde ücretsiz kargo",
                    details: "€100 ve üzeri siparişlerde kargo ücreti alınmaz.",
                },
                {
                    title: "60 Gün İade",
                    description: "60 gün içinde iade hakkı",
                    details: "Ürününüzden memnun kalmazsanız 60 gün içinde ücretsiz iade edebilirsiniz.",
                },
                {
                    title: "Sigortalı Kargo",
                    description: "Takip numarası ile sigortalı gönderim",
                    details: "Tüm gönderilerimiz sigortalıdır ve takip numarası ile takip edilebilir.",
                },
                {
                    title: "7/24 Destek",
                    description: "7 gün 24 saat müşteri desteği",
                    details: "Herhangi bir sorunuzda 7 gün 24 saat müşteri hizmetlerimizden destek alabilirsiniz.",
                },
                {
                    title: "Premium Paketleme",
                    description: "Ücretsiz premium paketleme",
                    details: "Tüm ürünlerimiz özel tasarım premium paketlerde gönderilir.",
                },
            ],
        },
        family: {
            badge: "ÖZEL AİLE FIRSATI",
            title: "ANNE BABA MEMLEKETİ",
            hook: "Köklerinizi birlikte taşıyın, bağlarınızı güçlendirin",
            oneShirt: "1 Tişört",
            twoShirts: "2 Tişört",
            threeShirts: "3+ Tişört",
            regularPrice: "Normal fiyat",
            twoFor: "Anne ve babanızın memleketi için",
            threeFor: "Daha fazla istiyorsanız",
            mixCities: "Farklı şehirlerden seçim yapabilirsiniz",
        },
        newsletter: {
            thanks: "Teşekkürler! Bültenimize başarıyla abone oldunuz.",
            title: "Haberler ve Özel Teklifler",
            intro: "Yeni koleksiyonlar ve özel indirimler hakkında ilk siz haberdar olun.",
            placeholder: "E-posta adresiniz",
            subscribe: "ABONE OL",
            privacy: "E-posta adresinizi sadece bülten gönderimi için kullanırız. İstediğiniz zaman abonelikten çıkabilirsiniz.",
        },
    },
});
