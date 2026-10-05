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
                    description: "Premium 235 g/m² cotton fabric",
                    details: "High-quality cotton fabric provides durability and comfort.",
                },
                {
                    title: "Made to Order",
                    description: "Made to order for you",
                    details: "Every item is made to order for you and shipped directly to your address.",
                },
                {
                    title: "Production in 1-3 Days",
                    description: "Produced within 1-3 business days",
                    details: "Every order is produced within 1-3 business days and then handed to the carrier.",
                },
                {
                    title: "International Shipping",
                    description: "Shipped directly to your address",
                    details: "Standard shipping €8, free from €100. Delivery times depend on the destination and are shown on the product page and at checkout.",
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
                    title: "Personal Support",
                    description: "Questions? Write to info@egrikuyu.com",
                    details: "For any question about your order or our products, write to info@egrikuyu.com and we will personally help you.",
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
            error: "Something went wrong. Please try again.",
        },
    },
    de: {
        trust: {
            title: "WARUM EĞRİKUYU?",
            subtitle: "Produkte, die Qualität, Vertrauen und Heimatliebe vereinen",
            signals: [
                {
                    title: "100 % Baumwolle",
                    description: "Baumwollstoff in Premiumqualität mit 235 g/m²",
                    details: "Hochwertiger Baumwollstoff sorgt für Haltbarkeit und Komfort.",
                },
                {
                    title: "Auf Bestellung gefertigt",
                    description: "Auf Bestellung für Sie gefertigt",
                    details: "Jeder Artikel wird auf Bestellung für Sie gefertigt und direkt an Ihre Adresse versendet.",
                },
                {
                    title: "Herstellung in 1-3 Tagen",
                    description: "Herstellung innerhalb von 1-3 Werktagen",
                    details: "Jede Bestellung wird innerhalb von 1-3 Werktagen hergestellt und danach dem Versanddienstleister übergeben.",
                },
                {
                    title: "Internationaler Versand",
                    description: "Direkt an Ihre Adresse versendet",
                    details: "Standardversand 8 €, ab 100 € kostenlos. Die Lieferzeit hängt vom Zielland ab und wird auf der Produktseite und an der Kasse angezeigt.",
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
                    title: "Persönlicher Support",
                    description: "Fragen? Schreiben Sie an info@egrikuyu.com",
                    details: "Bei Fragen zu Ihrer Bestellung oder unseren Produkten schreiben Sie an info@egrikuyu.com, wir helfen Ihnen persönlich weiter.",
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
            error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        },
    },
    fr: {
        trust: {
            title: "POURQUOI EĞRİKUYU ?",
            subtitle: "Des produits qui réunissent qualité, confiance et amour du pays natal",
            signals: [
                {
                    title: "100 % coton",
                    description: "Tissu en coton premium de 235 g/m²",
                    details: "Un tissu en coton de haute qualité, résistant et confortable.",
                },
                {
                    title: "Fabriqué à la commande",
                    description: "Fabriqué à la commande pour vous",
                    details: "Chaque article est fabriqué à la commande pour vous et expédié directement à votre adresse.",
                },
                {
                    title: "Fabrication en 1 à 3 jours",
                    description: "Fabriqué sous 1 à 3 jours ouvrés",
                    details: "Chaque commande est fabriquée sous 1 à 3 jours ouvrés, puis remise au transporteur.",
                },
                {
                    title: "Livraison internationale",
                    description: "Expédié directement à votre adresse",
                    details: "Livraison standard 8 €, offerte dès 100 €. Les délais dépendent de la destination et sont indiqués sur la page produit et lors du paiement.",
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
                    title: "Assistance personnalisée",
                    description: "Une question ? Écrivez à info@egrikuyu.com",
                    details: "Pour toute question sur votre commande ou nos produits, écrivez à info@egrikuyu.com et nous vous répondrons personnellement.",
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
            error: "Une erreur est survenue. Veuillez réessayer.",
        },
    },
    tr: {
        trust: {
            title: "NEDEN EĞRİKUYU?",
            subtitle: "Kalite, güven ve memleket sevgisini bir araya getiren ürünlerimiz",
            signals: [
                {
                    title: "100% Pamuk",
                    description: "Premium kalitede 235 gram/m² pamuklu kumaş",
                    details: "Yüksek kaliteli pamuklu kumaş, dayanıklılık ve konfor sağlar.",
                },
                {
                    title: "Siparişe Özel Üretim",
                    description: "Size özel olarak siparişe göre üretilir",
                    details: "Her ürün size özel olarak siparişe göre üretilir ve doğrudan adresinize gönderilir.",
                },
                {
                    title: "1-3 Günde Üretim",
                    description: "1-3 iş günü içinde üretilir",
                    details: "Her sipariş 1-3 iş günü içinde üretilir ve ardından kargo firmasına teslim edilir.",
                },
                {
                    title: "Uluslararası Kargo",
                    description: "Doğrudan adresinize gönderilir",
                    details: "Standart kargo €8, €100 üzeri ücretsiz. Teslimat süresi varış ülkesine göre değişir ve ürün sayfasında ve ödeme sırasında gösterilir.",
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
                    title: "Kişisel Destek",
                    description: "Sorunuz mu var? info@egrikuyu.com adresine yazın",
                    details: "Siparişiniz veya ürünlerimizle ilgili her soru için info@egrikuyu.com adresine yazın, size bizzat yardımcı olalım.",
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
            error: "Bir hata oluştu. Lütfen tekrar deneyin.",
        },
    },
});
