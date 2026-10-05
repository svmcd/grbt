// Garment colours, per product type, as sold by eğrikuyu and produced by Cloprod.
// One source of truth for the shop (swatches, cart, checkout validation), the mockup
// renderer (template file, print ink) and fulfilment (Cloprod SPU and colour id).
//
// Keys are stable ids stored in carts, orders, URLs and the Google feed. "siyah" and
// "beyaz" predate this file and stay as they are.

export type GarmentType = "tshirt" | "hoodie" | "sweater" | "longsleeve";
export type Locale4 = "en" | "de" | "fr" | "tr";

export type GarmentColor = {
    key: string;
    hex: string; // swatch colour (Cloprod's value)
    ink: "white" | "black"; // print colour on this garment (logo, name, number, frame)
    // Owner's choice per colour: print everything (text, frame, icon, sleeve number, line art) in
    // this ink instead of `ink`, on every collection; one print colour per garment. `ink` still
    // decides swatch outlines. (White on pink and light blue was unreadable, 1.4:1.)
    printInk?: "white" | "black";
    cloprodColorId: number;
    names: Record<Locale4, string>;
};

export type Garment = {
    type: GarmentType;
    cloprodSpu: string;
    cloprodUrl: string;
    colors: GarmentColor[]; // first = default
};

const c = (key: string, hex: string, ink: GarmentColor["ink"], cloprodColorId: number, en: string, de: string, fr: string, tr: string): GarmentColor => ({
    key,
    hex,
    ink,
    cloprodColorId,
    names: { en, de, fr, tr },
});

export const GARMENTS: Record<GarmentType, Garment> = {
    // 235GSM Men's Low-Shrink Cool-Touch Cotton T-Shirt, 100% cotton
    tshirt: {
        type: "tshirt",
        cloprodSpu: "TS0CI",
        cloprodUrl: "https://www.cloprod.com/catalog/all/t-shirts/235gsm-mens-low-shrink-cool-touch-cotton-t-shirt",
        colors: [
            c("siyah", "#010101", "white", 7, "Black", "Schwarz", "Noir", "Siyah"),
            c("beyaz", "#FFFFFF", "black", 1, "White", "Weiß", "Blanc", "Beyaz"),
            c("acik-mavi", "#C5D7E3", "black", 5, "Light Blue", "Hellblau", "Bleu clair", "Açık Mavi"),
            c("gri", "#585451", "white", 9, "Gray", "Grau", "Gris", "Gri"),
            c("lacivert", "#464E59", "white", 3, "Dark Blue", "Dunkelblau", "Bleu foncé", "Lacivert"),
            c("yesil", "#5F6654", "white", 8, "Green", "Grün", "Vert", "Yeşil"),
        ],
    },
    // 360GSM Unisex Fall&Winter Solid-Color Loopback Hoodie, 85% cotton 15% polyester
    hoodie: {
        type: "hoodie",
        cloprodSpu: "HD0C4",
        cloprodUrl: "https://www.cloprod.com/catalog/all/hoodies/360gsm-unisex-fallwinter-solid-color-loopback-hoodie",
        colors: [
            c("siyah", "#1A1A1A", "white", 6, "Black", "Schwarz", "Noir", "Siyah"),
            c("krem", "#E2E2D8", "black", 1, "Cream White", "Cremeweiß", "Blanc crème", "Krem"),
            c("yulaf", "#E8E9D9", "black", 2, "Oatmeal", "Haferbeige", "Avoine", "Yulaf"),
            c("gri-melanj", "#B4B6B1", "black", 3, "Heather Gray", "Grau meliert", "Gris chiné", "Gri Melanj"),
            c("antrasit", "#333534", "white", 4, "Charcoal", "Anthrazit", "Anthracite", "Antrasit"),
            c("gece-mavisi", "#1C2431", "white", 5, "Midnight Navy", "Mitternachtsblau", "Bleu nuit", "Gece Mavisi"),
        ],
    },
    // 275GSM Men's Vintage Snow-Wash Boxy Long-Sleeve T-Shirt, 100% cotton
    longsleeve: {
        type: "longsleeve",
        cloprodSpu: "LS0IS",
        cloprodUrl: "https://www.cloprod.com/catalog/mans-clothing/long-sleeves/275gsm-mens-vintage-snow-wash-boxy-long-sleeve-t-shirt",
        colors: [
            // Cloprod calls this one "Snowflake": a snow-washed black
            c("siyah", "#202020", "white", 5, "Washed Black", "Washed Black", "Noir délavé", "Yıkamalı Siyah"),
            c("kirmizi", "#AD3D53", "white", 2, "Red", "Rot", "Rouge", "Kırmızı"),
            c("lacivert", "#2B3149", "white", 8, "Navy", "Marineblau", "Bleu marine", "Lacivert"),
            { ...c("haki", "#A69782", "black", 6, "Khaki", "Khaki", "Kaki", "Haki"), printInk: "white" },
            c("kahverengi", "#736052", "white", 7, "Brown", "Braun", "Marron", "Kahverengi"),
            c("pembe", "#FCD3E5", "black", 1, "Pink", "Rosa", "Rose", "Pembe"),
            { ...c("gri", "#9A9A98", "black", 3, "Gray", "Grau", "Gris", "Gri"), printInk: "white" },
            c("antrasit", "#434341", "white", 4, "Charcoal", "Anthrazit", "Anthracite", "Antrasit"),
        ],
    },
    // 360GSM Unisex Solid-Color Loopback Crew Neck Sweatshirt, 85% cotton 15% polyester
    sweater: {
        type: "sweater",
        cloprodSpu: "SS0C3",
        cloprodUrl: "https://www.cloprod.com/catalog/all/sweatshirts/360gsm-unisex-solid-color-loopback-crew-neck-sweatshirt",
        colors: [
            c("siyah", "#1B1B1B", "white", 6, "Black", "Schwarz", "Noir", "Siyah"),
            c("krem", "#E9EADA", "black", 1, "Cream White", "Cremeweiß", "Blanc crème", "Krem"),
            c("yulaf", "#EAE9D7", "black", 2, "Oatmeal", "Haferbeige", "Avoine", "Yulaf"),
            c("gri-melanj", "#C2C4BF", "black", 3, "Heather Gray", "Grau meliert", "Gris chiné", "Gri Melanj"),
            c("antrasit", "#383A39", "white", 4, "Charcoal", "Anthrazit", "Anthracite", "Antrasit"),
            c("gece-mavisi", "#1D2331", "white", 5, "Midnight Navy", "Mitternachtsblau", "Bleu nuit", "Gece Mavisi"),
        ],
    },
};

export const garmentColors = (type: GarmentType): GarmentColor[] => GARMENTS[type].colors;

export function garmentColor(type: GarmentType, key: string): GarmentColor | undefined {
    return GARMENTS[type].colors.find((col) => col.key === key);
}

// Display name of a colour key. With a garment type, that garment's own name ("siyah" on a long
// sleeve is "Washed Black"); otherwise, or when the type lacks the key, the first definition wins.
export function colorName(key: string, locale: Locale4, type?: GarmentType): string {
    const own = type ? garmentColor(type, key) : undefined;
    if (own) return own.names[locale];
    for (const g of Object.values(GARMENTS)) {
        const col = g.colors.find((x) => x.key === key);
        if (col) return col.names[locale];
    }
    return key;
}
