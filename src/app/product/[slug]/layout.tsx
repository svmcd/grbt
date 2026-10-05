import type { Metadata } from "next";
import { getLocale } from "@/i18n/server";
import { BRAND, SITE_URL, seoProduct } from "@/lib/seo/products";
import { productReviews } from "@/lib/reviews";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const p = seoProduct(decodeURIComponent(slug), await getLocale());
    if (!p) return {};
    return {
        title: p.name,
        description: p.description,
        alternates: { canonical: p.url },
        openGraph: { type: "website", siteName: BRAND, title: `${p.name} | ${BRAND}`, description: p.description, url: p.url, images: p.images.slice(0, 2) },
    };
}

// Product structured data (schema.org) so Google can show price and availability
export default async function ProductLayout({ params, children }: Props) {
    const { slug } = await params;
    const p = seoProduct(decodeURIComponent(slug), await getLocale());
    // Star rating for Google, only from real approved reviews
    const reviews = p ? await productReviews(p.slug).catch(() => null) : null;
    const jsonLd = p && {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        image: p.images,
        sku: p.slug,
        brand: { "@type": "Brand", name: BRAND },
        category: p.collection,
        ...(reviews && reviews.count > 0
            ? {
                  aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average, reviewCount: reviews.count, bestRating: 5, worstRating: 1 },
                  review: reviews.reviews.slice(0, 5).map((r) => ({
                      "@type": "Review",
                      author: { "@type": "Person", name: r.name || "Customer" },
                      datePublished: r.createdAt.slice(0, 10),
                      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
                      ...(r.text ? { reviewBody: r.text } : {}),
                  })),
              }
            : {}),
        offers: {
            "@type": "Offer",
            url: p.url,
            priceCurrency: "EUR",
            price: p.price.toFixed(2),
            availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: BRAND, url: SITE_URL },
        },
    };
    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
            {children}
        </>
    );
}
