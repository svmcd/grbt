// Translated product copy. Turkish (the original) lives in src/lib/catalog.ts.
export type ProductCopy = {
    description: string;
    donationText: string;
    designOrigin: string;
    cityInfo?: {
        general: string;
        culture: string;
    };
};

export type CatalogTranslations = Record<string, ProductCopy>;
