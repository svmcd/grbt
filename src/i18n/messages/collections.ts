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
        turkishTimeSubtitle: "A Turkish tea glass and a running wolf, each with the line “You met me at a very Turkish time in my life.”",
        turkishTimePageSubtitle: "A Turkish tea glass and a running wolf, each with the line “You met me at a very Turkish time in my life.” Available as a T-shirt and a long sleeve.",
        viewAll: "View all",
        productCount: (n: number) => `${n} ${n === 1 ? "product" : "products"}`,
        indexTitle: "Collections",
        tiles: {
            title: "What are you looking for?",
            text: "Our designs are available as a T-shirt, long sleeve, hoodie or sweater.",
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
        turkishTimeSubtitle: "Ein türkisches Teeglas und ein laufender Wolf, jeweils mit dem Satz „You met me at a very Turkish time in my life.“",
        turkishTimePageSubtitle: "Ein türkisches Teeglas und ein laufender Wolf, jeweils mit dem Satz „You met me at a very Turkish time in my life.“ Erhältlich als T-Shirt und als Langarmshirt.",
        viewAll: "Alle ansehen",
        productCount: (n: number) => `${n} ${n === 1 ? "Produkt" : "Produkte"}`,
        indexTitle: "Kollektionen",
        tiles: {
            title: "Wonach suchen Sie?",
            text: "Unsere Designs sind als T-Shirt, Langarmshirt, Hoodie oder Sweater erhältlich.",
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
        turkishTimeSubtitle: "Un verre à thé turc et un loup qui court, chacun avec la phrase « You met me at a very Turkish time in my life. »",
        turkishTimePageSubtitle: "Un verre à thé turc et un loup qui court, chacun avec la phrase « You met me at a very Turkish time in my life. » Disponible en t-shirt et en manches longues.",
        viewAll: "Tout voir",
        productCount: (n: number) => `${n} ${n === 1 ? "produit" : "produits"}`,
        indexTitle: "Collections",
        tiles: {
            title: "Que recherchez-vous ?",
            text: "Nos créations sont disponibles en t-shirt, manches longues, hoodie ou sweat.",
        },
    },
    tr: {
        memleketSubtitle: "Memleketinizi temsil eden tişörtler.",
        hasretSubtitle: "Gurbetteki Türklerin memleket özlemi ve kültürel aidiyetini yansıtan tasarımlar.",
        hasretPageSubtitle:
            "Gurbetteki Türklerin memleket özlemi ve kültürel aidiyetini yansıtan tasarımlar. Her parça bir hatıra, bir özlem, bir bağ.",
        sinemaSubtitle: "Türk sinemasından ilham alan özel tasarımlar.",
        sinemaPageSubtitle: "Türk sinemasından ilham alan özel tasarımlar. Her parça bir hatıra, bir gülümseme.",
        turkishTimeSubtitle: "Bir Türk çay bardağı ve koşan bir kurt, ikisinde de “You met me at a very Turkish time in my life.” sözü.",
        turkishTimePageSubtitle: "Bir Türk çay bardağı ve koşan bir kurt, ikisinde de “You met me at a very Turkish time in my life.” sözü. Tişört ve uzun kollu tişört olarak sunulur.",
        viewAll: "Tümünü gör",
        productCount: (n: number) => `${n} ürün`,
        indexTitle: "Koleksiyonlar",
        tiles: {
            title: "Ne arıyorsunuz?",
            text: "Tasarımlarımız tişört, uzun kollu tişört, hoodie veya sweater olarak sunulur.",
        },
    },
});
