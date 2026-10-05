import { defineMessages } from "../define";

// 404 page (src/app/not-found.tsx)
export default defineMessages({
    en: {
        title: "Page not found",
        text: "The page you are looking for seems to have disappeared.",
        cta: "Continue shopping",
    },
    de: {
        title: "Seite nicht gefunden",
        text: "Die gesuchte Seite scheint nicht mehr zu existieren.",
        cta: "Weiter einkaufen",
    },
    fr: {
        title: "Page introuvable",
        text: "La page que vous cherchez semble avoir disparu.",
        cta: "Continuer vos achats",
    },
    tr: {
        title: "Sayfa bulunamadı",
        text: "Aradığın sayfa yok olmuş gibi.",
        cta: "Alışverişe devam et",
    },
});
