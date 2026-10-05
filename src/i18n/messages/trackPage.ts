import { defineMessages } from "../define";

// /track order tracking form
export default defineMessages({
    en: {
        title: "Track My Order",
        placeholder: "Order number",
        submit: "Track",
        result: (order: string) => `Tracking information for ${order} will appear here.`,
    },
    de: {
        title: "Bestellung verfolgen",
        placeholder: "Bestellnummer",
        submit: "Verfolgen",
        result: (order: string) => `Die Sendungsinformationen für ${order} werden hier angezeigt.`,
    },
    fr: {
        title: "Suivre ma commande",
        placeholder: "Numéro de commande",
        submit: "Suivre",
        result: (order: string) => `Les informations de suivi pour ${order} s'afficheront ici.`,
    },
    tr: {
        title: "Siparişimi Takip Et",
        placeholder: "Sipariş numarası",
        submit: "Takip Et",
        result: (order: string) => `${order} için takip bilgileri burada görünecek.`,
    },
});
