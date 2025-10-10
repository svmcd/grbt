"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getProductBySlug,
  getImagesForSlug,
  memleketSlugs,
  hasretSlugs,
} from "@/lib/catalog";
import { getPriceForSlug } from "@/lib/pricing";
import { getTestPrice } from "@/lib/dev-mode";
import { useCart } from "@/lib/cart-context";
import { Gallery } from "./Gallery";
import Image from "next/image";
import { TrustSignals } from "@/app/components/TrustSignals";
import { FAQ } from "@/app/components/FAQ";
import { NewsletterSignup } from "@/app/components/NewsletterSignup";
import { SocialLinks } from "@/app/components/SocialLinks";
import { ProductCard } from "@/app/components/ProductCard";
import { FamilyOffer } from "@/app/components/FamilyOffer";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const basePrice = product ? getPriceForSlug(product.slug) : 0;
  const { addItem } = useCart();

  // State declarations - moved before early return
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors[0] || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes[0] || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [personalizationText, setPersonalizationText] = useState<string>("");
  const [personalizationPlacement, setPersonalizationPlacement] =
    useState<string>("");
  const [personalizationMethod, setPersonalizationMethod] = useState<
    "printed" | "embroidered" | "none"
  >("none");
  const [personalizationFont, setPersonalizationFont] =
    useState<string>("Normal");
  const [personalizationColor, setPersonalizationColor] =
    useState<string>("#000000");
  const [giftPackage, setGiftPackage] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [randomProducts, setRandomProducts] = useState<any[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if original button is out of view and scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setShowStickyButton(rect.bottom < 0);
      }

      // Show scroll to top button after scrolling down 300px
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate random products on client side only
  useEffect(() => {
    const allSlugs = [...memleketSlugs, ...hasretSlugs].filter(
      (s) => s !== slug
    );
    // Shuffle and take 3 random products
    const shuffled = allSlugs.sort(() => 0.5 - Math.random());
    const randomSlugs = shuffled.slice(0, 3);

    const randomProductsData = randomSlugs
      .map((slug) => {
        const product = getProductBySlug(slug);
        return product ? { ...product, slug } : null;
      })
      .filter(Boolean);

    setRandomProducts(randomProductsData);
  }, [slug]);

  // Early return after all hooks
  if (!product) return null;

  // Calculate personalization cost
  const personalizationCost =
    personalizationMethod === "printed"
      ? 7.5
      : personalizationMethod === "embroidered"
      ? 10
      : 0;

  // Calculate gift package cost
  const giftPackageCost = giftPackage ? 5 : 0;

  const totalPrice = getTestPrice(
    basePrice + personalizationCost + giftPackageCost
  );

  // Determine collection name
  const isHasretCollection = hasretSlugs.includes(product.slug);
  const collectionName = isHasretCollection
    ? "Hasret Koleksiyonu"
    : "Memleket Koleksiyonu";

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-20 pb-4">
        <nav className="text-white/60 text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/collection"
            className="hover:text-white transition-colors"
          >
            {collectionName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.city}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div>
            <Gallery
              images={getImagesForSlug(product.slug, selectedColor)}
              city={product.city}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-white/60 text-sm uppercase tracking-[0.2em] font-light">
                  {collectionName}
                </div>
                <h1 className="text-3xl sm:text-4xl text-white font-light tracking-tight font-serif">
                  {product.city.toUpperCase()}
                </h1>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl text-white font-light">
                  €{totalPrice}
                </div>
                {(personalizationCost > 0 || giftPackageCost > 0) && (
                  <div className="text-white/60 text-sm">
                    <div className="text-white/40 text-xs line-through">
                      €{basePrice}
                    </div>
                    {personalizationCost > 0 && (
                      <div>+ €{personalizationCost} kişiselleştirme</div>
                    )}
                    {giftPackageCost > 0 && (
                      <div>+ €{giftPackageCost} hediye paketi</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {/* Color Selection */}
              <div>
                <div className="text-white/80 text-sm mb-3 font-medium">
                  Renk
                </div>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        padding: "8px 16px",
                        border:
                          selectedColor === c
                            ? "1px solid rgba(0, 0, 0, 0.3)"
                            : "1px solid rgba(0, 0, 0, 0.1)",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        backgroundColor:
                          selectedColor === c
                            ? "rgba(0, 0, 0, 0.05)"
                            : "transparent",
                        color:
                          selectedColor === c
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(0, 0, 0, 0.6)",
                        cursor: "pointer",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="text-white/80 text-sm mb-3 font-medium">
                  Beden
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: "8px 16px",
                        border:
                          selectedSize === s
                            ? "1px solid rgba(0, 0, 0, 0.3)"
                            : "1px solid rgba(0, 0, 0, 0.1)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        backgroundColor:
                          selectedSize === s
                            ? "rgba(0, 0, 0, 0.05)"
                            : "transparent",
                        color:
                          selectedSize === s
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(0, 0, 0, 0.6)",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Personalization Options */}
            <div className="space-y-4">
              <div>
                <div className="text-white/80 text-sm mb-3 font-medium">
                  Kişiselleştirme
                </div>
                <div className="space-y-3">
                  {/* Personalization Method */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">
                      Kişiselleştirme Türü
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPersonalizationMethod("none")}
                        style={{
                          padding: "8px 16px",
                          border:
                            personalizationMethod === "none"
                              ? "1px solid rgba(0, 0, 0, 0.3)"
                              : "1px solid rgba(0, 0, 0, 0.1)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor:
                            personalizationMethod === "none"
                              ? "rgba(0, 0, 0, 0.05)"
                              : "transparent",
                          color:
                            personalizationMethod === "none"
                              ? "rgba(0, 0, 0, 0.8)"
                              : "rgba(0, 0, 0, 0.6)",
                          cursor: "pointer",
                        }}
                      >
                        Yok
                      </button>
                      <button
                        onClick={() => setPersonalizationMethod("printed")}
                        style={{
                          padding: "8px 16px",
                          border:
                            personalizationMethod === "printed"
                              ? "1px solid rgba(0, 0, 0, 0.3)"
                              : "1px solid rgba(0, 0, 0, 0.1)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor:
                            personalizationMethod === "printed"
                              ? "rgba(0, 0, 0, 0.05)"
                              : "transparent",
                          color:
                            personalizationMethod === "printed"
                              ? "rgba(0, 0, 0, 0.8)"
                              : "rgba(0, 0, 0, 0.6)",
                          cursor: "pointer",
                        }}
                      >
                        Baskı (+€7.50)
                      </button>
                      <button
                        onClick={() => setPersonalizationMethod("embroidered")}
                        style={{
                          padding: "8px 16px",
                          border:
                            personalizationMethod === "embroidered"
                              ? "1px solid rgba(0, 0, 0, 0.3)"
                              : "1px solid rgba(0, 0, 0, 0.1)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor:
                            personalizationMethod === "embroidered"
                              ? "rgba(0, 0, 0, 0.05)"
                              : "transparent",
                          color:
                            personalizationMethod === "embroidered"
                              ? "rgba(0, 0, 0, 0.8)"
                              : "rgba(0, 0, 0, 0.6)",
                          cursor: "pointer",
                        }}
                      >
                        İşleme (+€10)
                      </button>
                    </div>
                  </div>

                  {/* Personalization Text */}
                  {personalizationMethod !== "none" && (
                    <div>
                      <div className="text-white/60 text-xs mb-2">
                        Metin (Maksimum 20 karakter)
                      </div>
                      <input
                        type="text"
                        value={personalizationText}
                        onChange={(e) =>
                          setPersonalizationText(e.target.value.slice(0, 20))
                        }
                        placeholder="Kişiselleştirme metni..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/50"
                      />
                      <div className="text-white/40 text-xs mt-1">
                        {personalizationText.length}/20 karakter
                      </div>
                    </div>
                  )}

                  {/* Font Selection */}
                  {personalizationMethod !== "none" && (
                    <div>
                      <div className="text-white/60 text-xs mb-2">
                        Font Seçimi
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { name: "Normal", font: "Arial" },
                          { name: "Serif", font: "Times New Roman" },
                          { name: "Cursive", font: "Brush Script MT, cursive" },
                        ].map((fontOption) => (
                          <button
                            key={fontOption.name}
                            onClick={() =>
                              setPersonalizationFont(fontOption.name)
                            }
                            style={{
                              padding: "6px 12px",
                              border:
                                personalizationFont === fontOption.name
                                  ? "1px solid rgba(0, 0, 0, 0.3)"
                                  : "1px solid rgba(0, 0, 0, 0.1)",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor:
                                personalizationFont === fontOption.name
                                  ? "rgba(0, 0, 0, 0.05)"
                                  : "transparent",
                              color:
                                personalizationFont === fontOption.name
                                  ? "rgba(0, 0, 0, 0.8)"
                                  : "rgba(0, 0, 0, 0.6)",
                              cursor: "pointer",
                              fontFamily: fontOption.font,
                            }}
                          >
                            {fontOption.name}
                          </button>
                        ))}
                      </div>

                      {/* Font Preview */}
                      {personalizationText && (
                        <div className="mt-3">
                          <div className="text-white/60 text-xs mb-2">
                            Önizleme
                          </div>
                          <div
                            className="bg-white/10 border border-white/20 rounded-none p-3 text-center"
                            style={{
                              fontFamily:
                                personalizationFont === "Normal"
                                  ? "Arial"
                                  : personalizationFont === "Serif"
                                  ? "Times New Roman"
                                  : "Brush Script MT, cursive",
                              fontSize: "16px",
                              fontWeight: "normal",
                              color: personalizationColor,
                            }}
                          >
                            {personalizationText}
                          </div>
                          <div className="text-white/40 text-xs mt-1 text-center">
                            Ürün üzerinde 1 cm yüksekliğinde
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Color Selection */}
                  {personalizationMethod !== "none" && (
                    <div>
                      <div className="text-white/60 text-xs mb-2">
                        Renk Seçimi
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={personalizationColor}
                          onChange={(e) =>
                            setPersonalizationColor(e.target.value)
                          }
                          className="w-12 h-10 border border-white/20 rounded-none cursor-pointer"
                        />
                        <span className="text-white/80 text-sm">
                          {personalizationColor}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Personalization Placement */}
                  {personalizationMethod !== "none" && (
                    <div>
                      <div className="text-white/60 text-xs mb-2">
                        Yerleşim Açıklaması
                      </div>
                      <input
                        type="text"
                        value={personalizationPlacement}
                        onChange={(e) =>
                          setPersonalizationPlacement(e.target.value)
                        }
                        placeholder="Örn: Sol göğüs, sağ kol, arka..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/50"
                      />
                    </div>
                  )}

                  {/* Personalization Info */}
                  {personalizationMethod !== "none" && (
                    <div className="bg-white/5 border border-white/10 rounded-none p-3">
                      <div className="text-white/60 text-xs mb-1">
                        Kişiselleştirme Bilgileri
                      </div>
                      <div className="text-white/80 text-xs">
                        • Harfler yaklaşık 1 cm boyutunda olacak
                        <br />•{" "}
                        {personalizationMethod === "printed"
                          ? "Baskı"
                          : "İşleme"}{" "}
                        tekniği kullanılacak
                        <br />• Font: {personalizationFont}
                        <br />• Renk: {personalizationColor}
                        <br />• Ek ücret: €
                        {personalizationMethod === "printed" ? "7.50" : "10"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gift Package Option */}
            <div className="space-y-4">
              <div>
                <div className="text-white/80 text-sm mb-3 font-medium">
                  Hediye Paketi
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="giftPackage"
                      checked={giftPackage}
                      onChange={(e) => setGiftPackage(e.target.checked)}
                      className="w-4 h-4 text-white bg-white/5 border-white/20 rounded-none focus:ring-white/20 focus:ring-2"
                    />
                    <label
                      htmlFor="giftPackage"
                      className="text-white/80 text-sm cursor-pointer"
                    >
                      Özel hediye paketi (+€5)
                    </label>
                  </div>

                  {giftPackage && (
                    <div className="bg-white/5 border border-white/10 rounded-none p-4">
                      <div className="text-white/60 text-xs mb-2 font-medium">
                        Hediye Paketi İçeriği
                      </div>
                      <div className="text-white/80 text-xs space-y-1">
                        <div>• Özel tasarım hediye kutusu</div>
                        <div>• 1 lokum</div>
                        <div>• Özel ambalaj ve kurdele</div>
                        <div>• Hediye mesajı ekleme imkanı</div>
                      </div>
                      <div className="text-white/60 text-xs mt-3">
                        Mükemmel hediye deneyimi için özel olarak hazırlanır
                      </div>

                      {/* Gift Message Input */}
                      <div className="mt-4">
                        <div className="text-white/60 text-xs mb-2">
                          Hediye Mesajı (Opsiyonel)
                        </div>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Hediye alan kişi için özel mesajınız..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/50 resize-none"
                          rows={3}
                          maxLength={100}
                        />
                        <div className="text-white/40 text-xs mt-1">
                          {giftMessage.length}/100 karakter
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pre-order Notice */}
            <div className="bg-white/5 border border-white/10 rounded-none p-4 mb-4">
              <div className="text-center">
                <div className="text-white/60 text-xs mb-2 uppercase tracking-wider font-bold">
                  ÖN SİPARİŞ | PRE ORDER
                </div>
                <div className="text-white/80 text-sm">
                  Şimdi sipariş verirseniz,{" "}
                  <span className="text-white font-medium">
                    {new Date(
                      Date.now() + 14 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>{" "}
                  tarihinde kargoya verilir.
                </div>
                {memleketSlugs.includes(product.slug) && (
                  <div className="text-white text-xs mt-2 font-medium">
                    Her renkte sadece 10 adet üretilecek • Sınırlı sayıda üretim
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              ref={buttonRef}
              onClick={() => {
                if (!selectedColor || !selectedSize) {
                  alert("Lütfen hem renk hem de beden seçin");
                  return;
                }
                if (
                  personalizationMethod !== "none" &&
                  (!personalizationText.trim() ||
                    !personalizationPlacement.trim())
                ) {
                  alert(
                    "Kişiselleştirme için metin ve yerleşim açıklaması gereklidir"
                  );
                  return;
                }
                addItem({
                  slug: product.slug,
                  city: product.city,
                  color: selectedColor,
                  size: selectedSize,
                  price: totalPrice,
                  image: getImagesForSlug(product.slug, selectedColor)[0],
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
              }}
              disabled={
                !selectedColor ||
                !selectedSize ||
                (personalizationMethod !== "none" &&
                  (!personalizationText.trim() ||
                    !personalizationPlacement.trim()))
              }
              className="w-full py-4 bg-white text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:bg-white/90 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sepete Ekle
            </button>

            {/* Product Specifications */}
            <div className="space-y-4 py-6 border-t border-white/10">
              <div className="text-center">
                <h3 className="text-white font-medium text-sm mb-4 font-serif">
                  ÜRÜN ÖZELLİKLERİ
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-white/60 text-xs mb-1">Kumaş</div>
                  <div className="text-white text-sm font-medium">
                    %100 Pamuk
                  </div>
                  <div className="text-white/50 text-xs">240 g/m²</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Kesim</div>
                  <div className="text-white text-sm font-medium">
                    Normal Kesim
                  </div>
                  <div className="text-white/50 text-xs">Rahat Fit</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Baskı</div>
                  <div className="text-white text-sm font-medium">
                    El Baskısı
                  </div>
                  <div className="text-white/50 text-xs">Hassas Teknik</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs mb-1">Üretim</div>
                  <div className="text-white text-sm font-medium">Hollanda</div>
                  <div className="text-white/50 text-xs">Modern Atölye</div>
                </div>
              </div>
            </div>

            {/* Donation Info - Only for Memleket Collection */}
            {memleketSlugs.includes(product.slug) && (
              <div className="bg-white/5 border border-white/10 rounded-none p-4 mt-6">
                <div className="text-center">
                  <div className="text-white/60 text-xs mb-2">
                    SOSYAL SORUMLULUK
                  </div>
                  <div className="text-white/80 text-sm">
                    {product.donation.organization}
                  </div>
                  {product.donation.link && (
                    <div className="mt-3">
                      <a
                        href={product.donation.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors rounded-none"
                      >
                        <span>Kurumu Ziyaret Et</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                  <div className="text-white/50 text-xs mt-2">
                    Hayvan dostlarımız için birlikte çalışıyoruz
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Family Offer - Only for Memleket Collection */}
          {memleketSlugs.includes(product.slug) && (
            <div className="lg:col-span-2">
              <FamilyOffer />
            </div>
          )}
        </div>

        {/* City Information Section - Only for Memleket Collection */}
        {product.cityInfo && (
          <div className="mt-16">
            <div className="bg-white/5 border border-white/10 rounded-none p-8">
              <h3 className="text-white font-light text-xl mb-6">
                {product.city} Hakkında
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-medium text-sm mb-3">
                    Şehir Bilgileri
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {product.cityInfo.general}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm mb-3">
                    Kültürel Değerler
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {product.cityInfo.culture}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="mt-12">
          <h3 className="text-white font-light text-xl mb-8">Özellikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">Malzeme</span>
              </div>
              <p className="text-white/80 text-sm">
                %100 Premium Pamuk - 240 GSM
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">
                  Tasarım & Baskı
                </span>
              </div>
              <p className="text-white/80 text-sm">
                Hollanda'da tasarlanıp el baskısı ile üretildi
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">Kalite</span>
              </div>
              <p className="text-white/80 text-sm">
                Premium malzemeler ve kaliteli işçilik
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">Kesim</span>
              </div>
              <p className="text-white/80 text-sm">Rahat ve modern kesim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart Button */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-white/10 p-4 z-50">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <div className="text-white text-sm font-medium">
                {product.city.toUpperCase()} - €{totalPrice}
              </div>
              <div className="text-white/60 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  {selectedColor}
                </span>{" "}
                • <span className="font-bold text-[10px]">{selectedSize}</span>
                {personalizationMethod !== "none" && (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-bold text-[10px]">
                      {personalizationMethod === "printed" ? "Baskı" : "İşleme"}
                    </span>
                  </>
                )}
                {giftPackage && (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-bold text-[10px]">
                      🎁 Hediye Paketi
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                if (!selectedColor || !selectedSize) {
                  alert("Lütfen hem renk hem de beden seçin");
                  return;
                }
                if (
                  personalizationMethod !== "none" &&
                  (!personalizationText.trim() ||
                    !personalizationPlacement.trim())
                ) {
                  alert(
                    "Kişiselleştirme için metin ve yerleşim açıklaması gereklidir"
                  );
                  return;
                }
                addItem({
                  slug: product.slug,
                  city: product.city,
                  color: selectedColor,
                  size: selectedSize,
                  price: totalPrice,
                  image: getImagesForSlug(product.slug, selectedColor)[0],
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
              }}
              disabled={
                !selectedColor ||
                !selectedSize ||
                (personalizationMethod !== "none" &&
                  (!personalizationText.trim() ||
                    !personalizationPlacement.trim()))
              }
              className="px-6 py-3 bg-white text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:bg-white/90 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sepete Ekle
            </button>
          </div>
        </div>
      )}

      {/* Factory Section */}
      <div className="py-20 px-4 sm:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-6 text-white font-serif">
              ÜRETİM SÜRECİMİZ
            </h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Her ürünümüz, Hollanda'daki atölyemizde özenle tasarlanıp
              üretilir. Kalite ve sürdürülebilirlik bizim önceliğimizdir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative aspect-square mb-6">
                <Image
                  src="/media/showcase2.png"
                  alt="Tasarım Süreci"
                  fill
                  className="object-cover rounded-none"
                />
              </div>
              <h3 className="text-xl font-light mb-4 text-white font-serif">
                01. TASARIM
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Her şehir için özel olarak tasarlanan motifler ve desenler,
                kültürel öğelerden ilham alınarak oluşturulur.
              </p>
            </div>

            <div className="text-center">
              <div className="relative aspect-square mb-6">
                <Image
                  src="/media/factory.png"
                  alt="Hollanda Atölyesi"
                  fill
                  className="object-cover rounded-none"
                />
              </div>
              <h3 className="text-xl font-light mb-4 text-white font-serif">
                02. ÜRETİM
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Hollanda'daki modern atölyemizde, premium kalitede pamuklu
                kumaşlar üzerine hassas baskı teknikleri uygulanır.
              </p>
            </div>

            <div className="text-center">
              <div className="relative aspect-square mb-6">
                <Image
                  src="/media/showcase4.png"
                  alt="Kalite Kontrol"
                  fill
                  className="object-cover rounded-none"
                />
              </div>
              <h3 className="text-xl font-light mb-4 text-white font-serif">
                03. KALİTE
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Her ürün, titiz kalite kontrolünden geçer. Dayanıklılık ve
                konfor standartlarımızı karşılamayan ürünler üretimden
                çıkarılır.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <TrustSignals />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter Signup */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>

      {/* Random Collection Section */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
              Diğer Ürünleri Keşfedin
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Koleksiyonumuzdan daha fazla şehir ve tasarım keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block px-8 py-4 font-medium tracking-wider uppercase text-sm transition-all duration-300 bg-white text-black hover:bg-white/90 rounded-none"
              style={{
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            >
              Tüm Koleksiyonları Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <SocialLinks />

      {/* Scroll to Top Button - Mobile Only */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 sm:hidden w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-none flex items-center justify-center text-black hover:bg-white/20 transition-colors z-40"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
