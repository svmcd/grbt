import { defineMessages } from "../define";

export default defineMessages({
    en: {
        imageAlt: (name: string) => `${name} design`,
        chooseOptions: "Choose options",
        colorLegend: "Colors",
    },
    de: {
        imageAlt: (name: string) => `Design ${name}`,
        chooseOptions: "Optionen wählen",
        colorLegend: "Farben",
    },
    fr: {
        imageAlt: (name: string) => `Création ${name}`,
        chooseOptions: "Choisir les options",
        colorLegend: "Couleurs",
    },
    tr: {
        imageAlt: (name: string) => `Memleket ${name}`,
        chooseOptions: "Seçenekleri gör",
        colorLegend: "Renkler",
    },
});
