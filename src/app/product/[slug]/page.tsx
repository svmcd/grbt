"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  getProductBySlug,
  getImagesForSlug,
  memleketSlugs,
  hasretSlugs,
  recepIvedikSlugs,
} from "@/lib/catalog";
import { getPriceForSlug } from "@/lib/pricing";
import { getTestPrice } from "@/lib/dev-mode";
import { useCart } from "@/lib/cart-context";
import { useFormatPrice, useLocale, useMessages } from "@/i18n/LocaleProvider";
import commonMessages from "@/i18n/messages/common";
import productPageMessages from "@/i18n/messages/productPage";
import { Gallery } from "./Gallery";
import { ProductDetails } from "./ProductDetails";
import { ImageBand, RelatedProducts } from "./RelatedProducts";
import { ProductReviews } from "./ProductReviews";
import { CheckSquare, FieldLabel, OptionBox, OptionLabel, Panel, Swatch } from "./ProductOptions";
import { track } from "@/lib/track";

type ProductType = "tshirt" | "hoodie" | "sweater";
type PersonalizationMethod = "printed" | "embroidered" | "none";

const FONTS = [
  { name: "Normal", font: "Arial" },
  { name: "Serif", font: "Times New Roman" },
  { name: "Cursive", font: "Brush Script MT, cursive" },
];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => {
    if (slug) track("product_view", { slug: decodeURIComponent(slug) });
  }, [slug]);
  const { locale } = useLocale();
  const common = useMessages(commonMessages);
  const t = useMessages(productPageMessages);
  const price = useFormatPrice();
  const product = slug ? getProductBySlug(slug, locale) : undefined;
  const basePrice = product ? getPriceForSlug(product.slug) : 0;
  const { addItem } = useCart();

  const [selectedProductType, setSelectedProductType] = useState<ProductType>("tshirt");
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || "");
  const [personalizationText, setPersonalizationText] = useState<string>("");
  const [personalizationPlacement, setPersonalizationPlacement] = useState<string>("");
  const [personalizationMethod, setPersonalizationMethod] = useState<PersonalizationMethod>("none");
  const [personalizationFont, setPersonalizationFont] = useState<string>("Normal");
  const [personalizationColor, setPersonalizationColor] = useState<string>("#000000");
  const [giftPackage, setGiftPackage] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Show the sticky add-to-cart bar once the main button has scrolled out of view.
  useEffect(() => {
    const handleScroll = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setShowStickyButton(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) return null;

  const personalizationCost =
    personalizationMethod === "printed" ? 7.5 : personalizationMethod === "embroidered" ? 10 : 0;
  const giftPackageCost = giftPackage ? 5 : 0;
  // Hoodie and sweater add €20
  const productTypeCost =
    selectedProductType === "hoodie" || selectedProductType === "sweater" ? 20 : 0;
  const totalPrice = getTestPrice(basePrice + productTypeCost + personalizationCost + giftPackageCost);

  const isMemleket = memleketSlugs.includes(product.slug);
  const isHasret = hasretSlugs.includes(product.slug);
  const isSinema = recepIvedikSlugs.includes(product.slug);
  const collectionName = isHasret
    ? common.collections.hasret
    : isSinema
    ? common.collections.sinema
    : common.collections.memleket;
  const collectionHref = isHasret
    ? "/collection/hasret"
    : isSinema
    ? "/collection/sinema"
    : "/collection/memleket";

  const images = getImagesForSlug(product.slug, selectedColor, selectedProductType);
  const personalizationIncomplete =
    personalizationMethod !== "none" &&
    (!personalizationText.trim() || !personalizationPlacement.trim());
  const cannotAdd = !selectedColor || !selectedSize || personalizationIncomplete;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert(t.alertColorSize);
      return;
    }
    if (personalizationIncomplete) {
      alert(t.alertPersonalization);
      return;
    }
    addItem({
      slug: product.slug,
      city: product.city,
      color: selectedColor,
      size: selectedSize,
      productType: selectedProductType,
      price: totalPrice * 100, // Convert to cents
      image: getImagesForSlug(product.slug, selectedColor, selectedProductType)[0],
      quantity: 1,
      personalization:
        personalizationMethod !== "none"
          ? {
              method: personalizationMethod,
              text: personalizationText,
              placement: personalizationPlacement,
              font: personalizationFont,
              color: personalizationColor,
              cost: personalizationCost,
            }
          : undefined,
      giftPackage: giftPackage
        ? {
            included: true,
            cost: giftPackageCost,
            message: giftMessage,
          }
        : undefined,
    });
  };

  const garmentName = selectedProductType === "hoodie" ? t.garment.hoodie : t.garment.sweater;
  const surcharges = [
    productTypeCost > 0 ? `+ ${price(productTypeCost)} ${garmentName}` : null,
    personalizationCost > 0 ? `+ ${price(personalizationCost)} ${t.surchargePersonalization}` : null,
    giftPackageCost > 0 ? `+ ${price(giftPackageCost)} ${t.surchargeGift}` : null,
  ].filter(Boolean);

  const personalizationVisible = personalizationOpen || personalizationMethod !== "none";
  const fontFamily = FONTS.find((f) => f.name === personalizationFont)?.font ?? "Arial";
  const matchingSlug =
    slug === "sibel_to_my_recep" ? "recep_to_my_sibel" : slug === "recep_to_my_sibel" ? "sibel_to_my_recep" : null;
  const matchingProduct = matchingSlug ? getProductBySlug(matchingSlug, locale) : undefined;

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] lg:px-12 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-[6vw] xl:gap-x-24">
          {/* Gallery */}
          <div className="lg:sticky lg:top-[144px] lg:self-start">
            <Gallery images={images} city={product.city} />
          </div>

          {/* Info column */}
          <div className="px-4 pt-6 sm:px-8 lg:sticky lg:top-[144px] lg:self-start lg:px-0 lg:pt-0">
            <div className="lg:max-w-[540px]">
              <Link href={collectionHref} className="sub-xs link-reveal text-subdued">
                {collectionName}
              </Link>
              <h1 className="h-product mt-2 text-ink">{product.city}</h1>

              {/* Price */}
              <div className="mt-3">
                <p className="text-[18px] tracking-[0.02em] text-ink">{price(totalPrice)}</p>
                {surcharges.length > 0 && (
                  <p className="sub-xs mt-1 text-subdued">
                    {price(basePrice)} {surcharges.join(" ")}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-6">
                {/* Product type */}
                <div>
                  <OptionLabel label={t.productType} value={common.productTypes[selectedProductType]} />
                  <div className="flex flex-wrap gap-2">
                    {(["tshirt", "hoodie", "sweater"] as const).map((type) => (
                      <OptionBox
                        key={type}
                        selected={selectedProductType === type}
                        onClick={() => setSelectedProductType(type)}
                      >
                        {common.productTypes[type]}
                        {type !== "tshirt" && <span className="ml-1.5 text-subdued">+{price(20)}</span>}
                      </OptionBox>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <OptionLabel label={common.color} value={common.colors[selectedColor] ?? selectedColor} />
                  <div className="-ml-1 flex gap-2">
                    {product.colors.map((c) => (
                      <Swatch
                        key={c}
                        color={c}
                        label={common.colors[c] ?? c}
                        selected={selectedColor === c}
                        onClick={() => setSelectedColor(c)}
                      />
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <OptionLabel label={common.size} value={selectedSize} />
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <OptionBox key={s} selected={selectedSize === s} onClick={() => setSelectedSize(s)}>
                        {s}
                      </OptionBox>
                    ))}
                  </div>
                </div>

                {/* Personalization */}
                <Panel
                  active={personalizationMethod !== "none"}
                  open={personalizationVisible}
                  onToggle={
                    personalizationMethod === "none" ? () => setPersonalizationOpen((o) => !o) : undefined
                  }
                  header={
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="sub text-ink">{t.personalization}</span>
                      <span className="sub-xs text-subdued">
                        {personalizationMethod === "none"
                          ? `+${price(7.5)} / +${price(10)}`
                          : `${common.personalization[personalizationMethod]} +${price(personalizationCost)}`}
                      </span>
                    </span>
                  }
                >
                  <div className="space-y-5">
                    <div>
                      <FieldLabel>{t.personalizationType}</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        <OptionBox
                          selected={personalizationMethod === "none"}
                          onClick={() => setPersonalizationMethod("none")}
                        >
                          {t.none}
                        </OptionBox>
                        <OptionBox
                          selected={personalizationMethod === "printed"}
                          onClick={() => setPersonalizationMethod("printed")}
                        >
                          {common.personalization.printed}
                          <span className="ml-1.5 text-subdued">+{price(7.5)}</span>
                        </OptionBox>
                        <OptionBox
                          selected={personalizationMethod === "embroidered"}
                          onClick={() => setPersonalizationMethod("embroidered")}
                        >
                          {common.personalization.embroidered}
                          <span className="ml-1.5 text-subdued">+{price(10)}</span>
                        </OptionBox>
                      </div>
                    </div>

                    {personalizationMethod !== "none" && (
                      <>
                        <div>
                          <FieldLabel htmlFor="pdp-personalization-text">{t.textLabel}</FieldLabel>
                          <input
                            id="pdp-personalization-text"
                            type="text"
                            value={personalizationText}
                            onChange={(e) => setPersonalizationText(e.target.value.slice(0, 20))}
                            placeholder={t.textPlaceholder}
                            className="storefront-input text-[14px] outline-none placeholder:text-subdued"
                          />
                          <p className="mt-1 text-[12px] text-subdued">
                            {t.charCount(personalizationText.length, 20)}
                          </p>
                        </div>

                        <div>
                          <FieldLabel>{t.fontLabel}</FieldLabel>
                          <div className="flex flex-wrap gap-2">
                            {FONTS.map((f) => (
                              <OptionBox
                                key={f.name}
                                selected={personalizationFont === f.name}
                                onClick={() => setPersonalizationFont(f.name)}
                                className="!normal-case !tracking-normal"
                                style={{ fontFamily: f.font }}
                              >
                                {t.fontNames[f.name] ?? f.name}
                              </OptionBox>
                            ))}
                          </div>
                          {personalizationText && (
                            <div className="mt-3">
                              <FieldLabel>{t.preview}</FieldLabel>
                              <div
                                className="border border-line p-3 text-center"
                                style={{ fontFamily, fontSize: "16px", color: personalizationColor }}
                              >
                                {personalizationText}
                              </div>
                              <p className="mt-1 text-center text-[12px] text-subdued">{t.previewHeight}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <FieldLabel htmlFor="pdp-personalization-color">{t.colorLabel}</FieldLabel>
                          <div className="flex items-center gap-3">
                            <input
                              id="pdp-personalization-color"
                              type="color"
                              value={personalizationColor}
                              onChange={(e) => setPersonalizationColor(e.target.value)}
                              className="h-10 w-12 cursor-pointer border border-line bg-paper p-0.5"
                            />
                            <span className="sub-xs text-ink">{personalizationColor}</span>
                          </div>
                        </div>

                        <div>
                          <FieldLabel htmlFor="pdp-personalization-placement">{t.placementLabel}</FieldLabel>
                          <input
                            id="pdp-personalization-placement"
                            type="text"
                            value={personalizationPlacement}
                            onChange={(e) => setPersonalizationPlacement(e.target.value)}
                            placeholder={t.placementPlaceholder}
                            className="storefront-input text-[14px] outline-none placeholder:text-subdued"
                          />
                        </div>

                        <div className="border border-line p-3">
                          <p className="sub-xs mb-2 text-subdued">{t.infoTitle}</p>
                          <ul className="space-y-1 text-[12px] leading-relaxed text-ink">
                            <li>{t.infoLetterSize}</li>
                            <li>{t.infoTechnique(personalizationMethod)}</li>
                            <li>
                              {t.infoFont}: {t.fontNames[personalizationFont] ?? personalizationFont}
                            </li>
                            <li>
                              {common.color}: {personalizationColor}
                            </li>
                            <li>
                              {t.infoExtraCost}: {price(personalizationCost)}
                            </li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </Panel>

                {/* Gift package */}
                <Panel
                  active={giftPackage}
                  open={giftPackage}
                  header={
                    <label htmlFor="giftPackage" className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        id="giftPackage"
                        checked={giftPackage}
                        onChange={(e) => setGiftPackage(e.target.checked)}
                        className="peer sr-only"
                      />
                      <CheckSquare checked={giftPackage} />
                      <span className="sub flex-1 text-ink">{t.giftCheckbox}</span>
                      <span className="sub-xs text-subdued">+{price(5)}</span>
                    </label>
                  }
                >
                  <p className="sub-xs mb-2 text-subdued">{t.giftContentsTitle}</p>
                  <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-ink">
                    {t.giftContents.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[12px] text-subdued">{t.giftPrepared}</p>
                  <div className="mt-4">
                    <FieldLabel htmlFor="pdp-gift-message">{t.giftMessageLabel}</FieldLabel>
                    <textarea
                      id="pdp-gift-message"
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder={t.giftMessagePlaceholder}
                      className="storefront-input resize-none text-[14px] outline-none placeholder:text-subdued"
                      style={{ height: "auto" }}
                      rows={3}
                      maxLength={100}
                    />
                    <p className="mt-1 text-[12px] text-subdued">{t.charCount(giftMessage.length, 100)}</p>
                  </div>
                </Panel>

                {/* Memleket family discount (real cart rule: 2 items -€5, 3+ items -€10) */}
                {isMemleket && (
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="h-px flex-1 bg-ink" />
                      <span className="sub text-ink">{t.family.title}</span>
                      <span className="h-px flex-1 bg-ink" />
                    </div>
                    <div className="mt-3 border border-line">
                      <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="sub text-ink">{t.family.twoItems}</span>
                        <span className="sub text-ink">−{price(5)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
                        <span className="sub text-ink">{t.family.threeItems}</span>
                        <span className="sub text-ink">−{price(10)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-[12px] text-subdued">{t.family.note}</p>
                  </div>
                )}

                {/* Add to cart */}
                <div>
                  <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleAddToCart}
                    disabled={cannotAdd}
                    className="btn btn-ink w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {common.addToCart}
                  </button>
                  <p className="sub-xs mt-3 text-center text-subdued">{t.productionNotice}</p>
                </div>

                {/* Matching product (Sinema couple shirts) */}
                {matchingSlug && matchingProduct && (
                  <Link
                    href={`/product/${matchingSlug}`}
                    className="group flex items-center gap-4 border border-line p-3 transition-colors hover:border-ink"
                  >
                    <div className="relative h-20 w-20 shrink-0">
                      <Image
                        src={matchingProduct.image}
                        alt={matchingProduct.city}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="sub-xs text-subdued">{t.matchingTitle}</p>
                      <p className="sub mt-0.5 text-ink">{matchingProduct.city}</p>
                      <p className="sub-xs mt-0.5 text-subdued">{price(getPriceForSlug(matchingSlug))}</p>
                      <p className="sub-xs mt-2 text-ink underline underline-offset-4">{t.matchingView}</p>
                    </div>
                  </Link>
                )}
              </div>

              <ProductDetails product={product} isMemleket={isMemleket} />

              <a
                href="https://tiktok.com/@egrikuyu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-3 text-ink"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="sub-xs text-subdued">{t.tiktok}</span>
                <span className="sub-xs link-reveal">@egrikuyu.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <ImageBand slug={product.slug} city={product.city} />
      <ProductReviews slug={product.slug} />
      <RelatedProducts slug={product.slug} />

      {/* Sticky add-to-cart bar (spacer keeps the footer end reachable) */}
      {showStickyButton && <div aria-hidden className="h-[72px]" />}
      {showStickyButton && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-8 lg:px-12">
            <div className="relative hidden h-12 w-12 shrink-0 sm:block">
              <Image src={images[0]} alt="" fill sizes="48px" className="object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="sub truncate text-ink">{product.city}</p>
              <p className="sub-xs truncate text-subdued">
                {[
                  price(totalPrice),
                  common.productTypes[selectedProductType],
                  common.colors[selectedColor] ?? selectedColor,
                  selectedSize,
                  personalizationMethod !== "none" ? common.personalization[personalizationMethod] : null,
                  giftPackage ? common.giftPackage : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cannotAdd}
              className="btn btn-ink shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-10"
            >
              {common.addToCart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
