import { notFound } from "next/navigation";
import { colorsFor, getProductBySlug, productTypesFor } from "@/lib/catalog";
import { bandPhotoForSlug, galleryImagesForSlug, type ProductType } from "./gallery-images";
import { ProductView } from "./ProductView";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Pick the value from `allowed` that matches the query value (case-insensitive), if any.
function pick<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  const v = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase();
  return v ? allowed.find((a) => a.toLowerCase() === v) : undefined;
}

// Unknown slugs get the site's 404 page. A variant can be pre-selected from the URL
// (product feed links): ?type=tshirt|longsleeve|hoodie|sweater&color=<colour key>&size=S|M|L|XL|XXL.
// The type must be one this design is sold as (productTypesFor: no long sleeve for Hasret/Sinema).
// The colour must be one this design is sold in on that type (colorsFor), otherwise the
// type's first colour is selected. Invalid values are ignored; without ?size= no size is selected.
export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  let product: ReturnType<typeof getProductBySlug>;
  try {
    product = getProductBySlug(slug);
  } catch {
    product = undefined; // malformed URL encoding
  }
  if (!product) notFound();

  const query = await searchParams;
  const type: ProductType = pick(query.type, productTypesFor(product.slug)) ?? "tshirt";
  const colors = colorsFor(product.slug, type);
  const color = pick(query.color, colors) ?? colors[0];
  const size = pick(query.size, product.sizes) ?? "";

  return (
    <ProductView
      key={product.slug}
      slug={product.slug}
      galleryImages={galleryImagesForSlug(product.slug)}
      bandPhoto={bandPhotoForSlug(product.slug)}
      initialType={type}
      initialColor={color}
      initialSize={size}
    />
  );
}
