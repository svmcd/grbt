export type PhoneCaseData = {
  title: string;
  slug: string;
  numberOfProductImages: number;
  price: number; // Base price in euros
  description?: string;
};

export const phoneCaseSlugs: string[] = ["kilim"];

export const phoneCaseData: Record<string, PhoneCaseData> = {
  kilim: {
    title: "Kilim",
    slug: "kilim-phone-case",
    numberOfProductImages: 5,
    price: 40,
    description: "Geleneksel kilim desenlerinden ilham alan özel telefon kılıfı tasarımı.",
  },
};

export function getPhoneCaseBySlug(slug: string): PhoneCaseData | undefined {
  const decodedSlug = decodeURIComponent(slug);
  // Handle both "kilim" and "kilim-phone-case" formats
  if (phoneCaseData[decodedSlug]) {
    return phoneCaseData[decodedSlug];
  }
  // Try removing "-phone-case" suffix
  const baseSlug = decodedSlug.replace("-phone-case", "");
  return phoneCaseData[baseSlug];
}

export function getPhoneCaseImages(slug: string): string[] {
  const images: string[] = [];
  const baseSlug = slug.replace("-phone-case", "");
  const phoneCase = phoneCaseData[baseSlug] || phoneCaseData[slug];
  if (!phoneCase) return images;

  // Add product images (main images, not embroidery)
  for (let i = 1; i <= phoneCase.numberOfProductImages; i++) {
    images.push(`/products/phonecases/${baseSlug}/saffron/${i}.png`);
  }
  return images;
}

export function getPhoneCaseEmbroideryImage(slug: string): string {
  const baseSlug = slug.replace("-phone-case", "");
  return `/products/phonecases/${baseSlug}/embroidery.png`;
}

