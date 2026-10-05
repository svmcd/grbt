import { defineMessages } from "../define";

// Header, announcement bar, search drawer, mobile menu, Footer and the 404 page.
// Shared words (home, contact, close, collection names) come from common.ts;
// the newsletter form reads homeSections.ts. Announcement, trust row and brand
// text below repeat existing site copy (homeSections trust signals, home hero).
export default defineMessages({
    en: {
        announcement: "Free shipping on orders over €100",
        header: {
            menu: "Menu",
            search: "Search",
            cart: "Cart",
            language: "Language",
        },
        search: {
            placeholder: "Search products...",
            noResults: "No products found",
            collections: "Collections",
        },
        trust: [
            { title: "Worldwide Shipping", text: "Free from €100, standard €8" },
            { title: "Personal Support", text: "Questions? info@egrikuyu.com" },
            { title: "Secure Payment", text: "Your payment is processed securely by Stripe" },
        ],
        footer: {
            newsletter: "Newsletter",
            moreInfo: "More info",
            about: "About Us",
            aboutText: "Exclusive designs representing the cities of Türkiye. Wear your hometown with pride.",
            country: "Netherlands",
            trackOrder: "Track My Order",
            shippingPolicy: "Shipping Policy",
            returnPolicy: "Return Policy",
            support: "Support",
            privacy: "Privacy Policy",
            terms: "Terms and Conditions",
        },
        notFound: {
            title: "Page not found",
            text: "The page you are looking for seems to have disappeared. Return to the homepage.",
        },
    },
    de: {
        announcement: "Kostenloser Versand ab 100 €",
        header: {
            menu: "Menü",
            search: "Suche",
            cart: "Warenkorb",
            language: "Sprache",
        },
        search: {
            placeholder: "Produkte suchen...",
            noResults: "Keine Produkte gefunden",
            collections: "Kollektionen",
        },
        trust: [
            { title: "Weltweiter Versand", text: "Ab 100 € kostenlos, Standard 8 €" },
            { title: "Persönlicher Support", text: "Fragen? info@egrikuyu.com" },
            { title: "Sichere Zahlung", text: "Ihre Zahlung wird sicher über Stripe abgewickelt" },
        ],
        footer: {
            newsletter: "Newsletter",
            moreInfo: "Weitere Informationen",
            about: "Über uns",
            aboutText: "Exklusive Designs, die die Städte der Türkei repräsentieren. Tragen Sie Ihre Heimat mit Stolz.",
            country: "Niederlande",
            trackOrder: "Bestellung verfolgen",
            shippingPolicy: "Versandrichtlinien",
            returnPolicy: "Rückgaberichtlinien",
            support: "Support",
            privacy: "Datenschutzerklärung",
            terms: "AGB",
        },
        notFound: {
            title: "Seite nicht gefunden",
            text: "Die gesuchte Seite scheint nicht mehr zu existieren. Kehren Sie zur Startseite zurück.",
        },
    },
    fr: {
        announcement: "Livraison gratuite au-delà de 100 €",
        header: {
            menu: "Menu",
            search: "Recherche",
            cart: "Panier",
            language: "Langue",
        },
        search: {
            placeholder: "Rechercher des produits...",
            noResults: "Aucun produit trouvé",
            collections: "Collections",
        },
        trust: [
            { title: "Livraison dans le monde entier", text: "Offerte dès 100 €, standard 8 €" },
            { title: "Assistance personnalisée", text: "Une question ? info@egrikuyu.com" },
            { title: "Paiement sécurisé", text: "Votre paiement est traité de manière sécurisée par Stripe" },
        ],
        footer: {
            newsletter: "Newsletter",
            moreInfo: "Plus d'informations",
            about: "À propos",
            aboutText: "Des créations exclusives qui représentent les villes de Turquie. Portez votre ville natale avec fierté.",
            country: "Pays-Bas",
            trackOrder: "Suivre ma commande",
            shippingPolicy: "Politique de livraison",
            returnPolicy: "Politique de retour",
            support: "Assistance",
            privacy: "Politique de confidentialité",
            terms: "Conditions générales",
        },
        notFound: {
            title: "Page introuvable",
            text: "La page que vous cherchez semble avoir disparu. Retournez à la page d'accueil.",
        },
    },
    tr: {
        announcement: "€100 üzeri siparişlerde ücretsiz kargo",
        header: {
            menu: "Menü",
            search: "Ara",
            cart: "Sepet",
            language: "Dil",
        },
        search: {
            placeholder: "Ürün ara...",
            noResults: "Ürün bulunamadı",
            collections: "Koleksiyonlar",
        },
        trust: [
            { title: "Dünyanın Her Yerine Kargo", text: "€100 üzeri ücretsiz, standart €8" },
            { title: "Kişisel Destek", text: "Sorunuz mu var? info@egrikuyu.com" },
            { title: "Güvenli Ödeme", text: "Ödemeniz Stripe üzerinden güvenle işlenir" },
        ],
        footer: {
            newsletter: "Bülten",
            moreInfo: "Daha fazla bilgi",
            about: "Hakkımızda",
            aboutText: "Türkiye'nin şehirlerini temsil eden özel tasarımlar. Memleketinizi gururla taşıyın.",
            country: "Hollanda",
            trackOrder: "Siparişimi Takip Et",
            shippingPolicy: "Kargo Politikası",
            returnPolicy: "İade Politikası",
            support: "Destek",
            privacy: "Gizlilik Politikası",
            terms: "Şartlar ve Koşullar",
        },
        notFound: {
            title: "Sayfa bulunamadı",
            text: "Aradığın sayfa yok olmuş gibi. Ana sayfaya dön.",
        },
    },
});
