import { defineMessages } from "../define";

// Homepage (src/app/page.tsx)
export default defineMessages({
    en: {
        heroAlt: "eğrikuyu T-shirts from the Memleket Collection",
        featured: { badge: "New collection", title: "Turkish Time", quote: "You met me at a very Turkish time in my life.", productCta: "Shop the red long sleeve", collectionCta: "View the collection", altMain: "Kurt long sleeve in red, Turkish Time collection", altSecond: "Çay long sleeve in red, Turkish Time collection" },
        heroTitle: { line1: "Carry Your", line2: "Hometown", line3: "on T-shirts" },
        offers: {
            freeShipping: (amount: string) => `Free shipping on orders over ${amount}`,
            family: (two: string, three: string) => `${two} off 2 items, ${three} off 3 or more`,
        },
        shopMemleket: "Discover Memleket",
    },
    de: {
        heroAlt: "eğrikuyu T-Shirts aus der Memleket-Kollektion",
        featured: { badge: "Neue Kollektion", title: "Turkish Time", quote: "You met me at a very Turkish time in my life.", productCta: "Das rote Langarmshirt ansehen", collectionCta: "Zur Kollektion", altMain: "Kurt Langarmshirt in Rot, Kollektion Turkish Time", altSecond: "Çay Langarmshirt in Rot, Kollektion Turkish Time" },
        heroTitle: { line1: "Tragen Sie", line2: "Ihre Heimat", line3: "auf T-Shirts" },
        offers: {
            freeShipping: (amount: string) => `Kostenloser Versand bei Bestellungen über ${amount}`,
            family: (two: string, three: string) => `${two} Rabatt auf 2 Artikel, ${three} auf 3 oder mehr`,
        },
        shopMemleket: "Memleket entdecken",
    },
    fr: {
        heroAlt: "T-shirts eğrikuyu de la collection Memleket",
        featured: { badge: "Nouvelle collection", title: "Turkish Time", quote: "You met me at a very Turkish time in my life.", productCta: "Voir le manches longues rouge", collectionCta: "Voir la collection", altMain: "Manches longues Kurt en rouge, collection Turkish Time", altSecond: "Manches longues Çay en rouge, collection Turkish Time" },
        heroTitle: { line1: "Portez", line2: "votre terre natale", line3: "sur vos t-shirts" },
        offers: {
            freeShipping: (amount: string) => `Livraison gratuite pour les commandes de plus de ${amount}`,
            family: (two: string, three: string) => `${two} de remise sur 2 articles, ${three} sur 3 ou plus`,
        },
        shopMemleket: "Découvrir Memleket",
    },
    tr: {
        heroAlt: "Memleket Koleksiyonundan eğrikuyu tişörtleri",
        featured: { badge: "Yeni koleksiyon", title: "Turkish Time", quote: "You met me at a very Turkish time in my life.", productCta: "Kırmızı uzun kolluyu incele", collectionCta: "Koleksiyonu gör", altMain: "Kırmızı Kurt uzun kollu, Turkish Time koleksiyonu", altSecond: "Kırmızı Çay uzun kollu, Turkish Time koleksiyonu" },
        heroTitle: { line1: "Memleketinizi", line2: "Tişörtlerde", line3: "Taşıyın" },
        offers: {
            freeShipping: (amount: string) => `${amount} üzeri siparişlerde ücretsiz kargo`,
            family: (two: string, three: string) => `2 üründe ${two}, 3 ve üzerinde ${three} indirim`,
        },
        shopMemleket: "Memleket'i keşfedin",
    },
});
