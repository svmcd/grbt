import { defineMessages } from "../define";

// Collection copy shared by the homepage sections, the collection tiles and the /collection pages.
// Collection names themselves come from common.collections.
export default defineMessages({
    en: {
        memleketSubtitle: "T-shirts that represent your hometown.",
        hasretSubtitle: "Designs that reflect the longing for home and the cultural belonging of Turks living abroad.",
        hasretPageSubtitle:
            "Designs that reflect the longing for home and the cultural belonging of Turks living abroad. Every piece is a memory, a longing, a bond.",
        sinemaSubtitle: "Exclusive designs inspired by Turkish cinema.",
        sinemaPageSubtitle: "Exclusive designs inspired by Turkish cinema. Every piece is a memory, a smile.",
        viewAll: "View all",
        productCount: (n: number) => `${n} ${n === 1 ? "product" : "products"}`,
        indexTitle: "Collections",
        tiles: {
            title: "What are you looking for?",
            text: "Every design is available as a T-shirt, hoodie or sweater.",
        },
    },
    de: {
        memleketSubtitle: "T-Shirts, die Ihre Heimat repräsentieren.",
        hasretSubtitle:
            "Designs, die die Sehnsucht nach der Heimat und die kulturelle Zugehörigkeit der Türken im Ausland widerspiegeln.",
        hasretPageSubtitle:
            "Designs, die die Sehnsucht nach der Heimat und die kulturelle Zugehörigkeit der Türken im Ausland widerspiegeln. Jedes Stück ist eine Erinnerung, eine Sehnsucht, eine Verbindung.",
        sinemaSubtitle: "Exklusive Designs, inspiriert vom türkischen Kino.",
        sinemaPageSubtitle: "Exklusive Designs, inspiriert vom türkischen Kino. Jedes Stück ist eine Erinnerung, ein Lächeln.",
        viewAll: "Alle ansehen",
        productCount: (n: number) => `${n} ${n === 1 ? "Produkt" : "Produkte"}`,
        indexTitle: "Kollektionen",
        tiles: {
            title: "Wonach suchen Sie?",
            text: "Jedes Design ist als T-Shirt, Hoodie oder Sweater erhältlich.",
        },
    },
    fr: {
        memleketSubtitle: "Des t-shirts qui représentent votre ville natale.",
        hasretSubtitle:
            "Des créations qui reflètent la nostalgie du pays et l'appartenance culturelle des Turcs vivant à l'étranger.",
        hasretPageSubtitle:
            "Des créations qui reflètent la nostalgie du pays et l'appartenance culturelle des Turcs vivant à l'étranger. Chaque pièce est un souvenir, une nostalgie, un lien.",
        sinemaSubtitle: "Des créations exclusives inspirées du cinéma turc.",
        sinemaPageSubtitle: "Des créations exclusives inspirées du cinéma turc. Chaque pièce est un souvenir, un sourire.",
        viewAll: "Tout voir",
        productCount: (n: number) => `${n} ${n === 1 ? "produit" : "produits"}`,
        indexTitle: "Collections",
        tiles: {
            title: "Que recherchez-vous ?",
            text: "Chaque création est disponible en t-shirt, hoodie ou sweat.",
        },
    },
    tr: {
        memleketSubtitle: "Memleketinizi temsil eden tişörtler.",
        hasretSubtitle: "Gurbetteki Türklerin memleket özlemi ve kültürel aidiyetini yansıtan tasarımlar.",
        hasretPageSubtitle:
            "Gurbetteki Türklerin memleket özlemi ve kültürel aidiyetini yansıtan tasarımlar. Her parça bir hatıra, bir özlem, bir bağ.",
        sinemaSubtitle: "Türk sinemasından ilham alan özel tasarımlar.",
        sinemaPageSubtitle: "Türk sinemasından ilham alan özel tasarımlar. Her parça bir hatıra, bir gülümseme.",
        viewAll: "Tümünü gör",
        productCount: (n: number) => `${n} ürün`,
        indexTitle: "Koleksiyonlar",
        tiles: {
            title: "Ne arıyorsunuz?",
            text: "Her tasarım tişört, hoodie veya sweater olarak mevcuttur.",
        },
    },
});
