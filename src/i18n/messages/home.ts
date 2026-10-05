import { defineMessages } from "../define";

// Homepage (src/app/page.tsx)
export default defineMessages({
    en: {
        heroAlt: "eğrikuyu T-shirts from the Memleket Collection",
        heroTitle: { line1: "Carry Your", line2: "Hometown", line3: "on T-shirts" },
        offers: {
            freeShipping: (amount: string) => `Free shipping on orders over ${amount}`,
            family: (two: string, three: string) => `Memleket: ${two} off 2 T-shirts, ${three} off 3 or more`,
        },
        shopMemleket: "Discover Memleket",
    },
    de: {
        heroAlt: "eğrikuyu T-Shirts aus der Memleket-Kollektion",
        heroTitle: { line1: "Tragen Sie", line2: "Ihre Heimat", line3: "auf T-Shirts" },
        offers: {
            freeShipping: (amount: string) => `Kostenloser Versand bei Bestellungen über ${amount}`,
            family: (two: string, three: string) => `Memleket: ${two} Rabatt auf 2 T-Shirts, ${three} auf 3 oder mehr`,
        },
        shopMemleket: "Memleket entdecken",
    },
    fr: {
        heroAlt: "T-shirts eğrikuyu de la collection Memleket",
        heroTitle: { line1: "Portez", line2: "votre terre natale", line3: "sur vos t-shirts" },
        offers: {
            freeShipping: (amount: string) => `Livraison gratuite pour les commandes de plus de ${amount}`,
            family: (two: string, three: string) => `Memleket : ${two} de remise sur 2 t-shirts, ${three} sur 3 ou plus`,
        },
        shopMemleket: "Découvrir Memleket",
    },
    tr: {
        heroAlt: "Memleket Koleksiyonundan eğrikuyu tişörtleri",
        heroTitle: { line1: "Memleketinizi", line2: "Tişörtlerde", line3: "Taşıyın" },
        offers: {
            freeShipping: (amount: string) => `${amount} üzeri siparişlerde ücretsiz kargo`,
            family: (two: string, three: string) => `Memleket: 2 tişörtte ${two}, 3 ve üzerinde ${three} indirim`,
        },
        shopMemleket: "Memleket'i keşfedin",
    },
});
