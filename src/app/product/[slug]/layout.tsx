import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getUrlLocale } from "@/i18n/server";
import { BRAND, SITE_URL, allProductSlugs, productPath, seoProduct } from "@/lib/seo/products";
import { alternatesFor, localeUrl } from "@/lib/seo/locales";
import { merchantReturnPolicy, shippingDetails } from "@/lib/seo/offer";
import { productReviews } from "@/lib/reviews";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

// The product for this URL in the page's language, or the 404 page for unknown slugs
async function load(params: Props["params"]) {
    const { slug: raw } = await params;
    let slug: string;
    try {
        slug = decodeURIComponent(raw);
    } catch {
        notFound();
    }
    if (!allProductSlugs().includes(slug)) notFound();
    const p = seoProduct(slug, await getLocale());
    if (!p) notFound();
    // Canonical and hreflang follow the URL's language (/tr/product/… is Turkish)
    const path = productPath(slug);
    const urlLocale = await getUrlLocale();
    return { p, path, urlLocale, url: localeUrl(path, urlLocale) };
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
    const { p, path, urlLocale, url } = await load(params);
    return {
        title: p.name,
        description: p.description,
        alternates: alternatesFor(path, urlLocale),
        openGraph: { type: "website", siteName: BRAND, title: `${p.name} | ${BRAND}`, description: p.description, url, images: p.images.slice(0, 2) },
    };
}

// Product structured data (schema.org) so Google can show price and availability
export default async function ProductLayout({ params, children }: Props) {
    const { p, url } = await load(params);
    // Star rating for Google, only from real approved reviews
    const reviews = await productReviews(p.slug).catch(() => null);
    const jsonLd = {
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
            url,
            priceCurrency: "EUR",
            price: p.price.toFixed(2),
            availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: BRAND, url: SITE_URL },
            shippingDetails: shippingDetails(p.price),
            hasMerchantReturnPolicy: merchantReturnPolicy,
        },
    };
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            {children}
        </>
    );
}
