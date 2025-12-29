"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getPhoneCaseBySlug,
  getPhoneCaseImages,
  getPhoneCaseEmbroideryImage,
} from "@/lib/phone-case-catalog";
import { useCart } from "@/lib/cart-context";
import { getTestPrice } from "@/lib/dev-mode";
import Image from "next/image";
import Link from "next/link";
import { TrustSignals } from "@/app/components/TrustSignals";
import { FAQ } from "@/app/components/FAQ";
import { NewsletterSignup } from "@/app/components/NewsletterSignup";
import { SocialLinks } from "@/app/components/SocialLinks";
import { ProductCard } from "@/app/components/ProductCard";
import { Gallery } from "@/app/product/[slug]/Gallery";
import {
  getProductBySlug,
  memleketSlugs,
  hasretSlugs,
  recepIvedikSlugs,
} from "@/lib/catalog";

const PHONE_MODELS = [
  // iPhone 17 Series
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone Air",
  // iPhone 16 Series
  "iPhone 16 Plus",
  "iPhone 16 128GB",
  "iPhone 16e",
  "iPhone 16",
  // iPhone 15 Series
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15 128GB",
  "iPhone 15",
  // iPhone 14 Series
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14 128GB",
  "iPhone 14",
  // iPhone 13 Series
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13 mini",
  "iPhone 13",
  // Samsung Galaxy S Series
  "Samsung Galaxy S25+",
  "Samsung Galaxy S25",
  "Samsung Galaxy S24 Ultra",
  "Samsung Galaxy S24+",
  "Samsung Galaxy S24",
  "Samsung Galaxy S23 Ultra",
  "Samsung Galaxy S23+",
  "Samsung Galaxy S23 FE",
  "Samsung Galaxy S23",
  "Samsung Galaxy S22 Ultra",
  "Samsung Galaxy S22+",
  "Samsung Galaxy S22",
  "Samsung Galaxy S21 Ultra",
  "Samsung Galaxy S21+",
  "Samsung Galaxy S21 FE",
  "Samsung Galaxy S21",
  "Samsung Galaxy S20 Ultra",
  "Samsung Galaxy S20+",
  "Samsung Galaxy S20 FE",
  "Samsung Galaxy S20",
  // Samsung Galaxy A Series
  "Samsung Galaxy A73",
  "Samsung Galaxy A72",
  "Samsung Galaxy A71",
  "Samsung Galaxy A70",
  "Samsung Galaxy A56",
  "Samsung Galaxy A55",
  "Samsung Galaxy A54",
  "Samsung Galaxy A53",
  "Samsung Galaxy A52s",
  "Samsung Galaxy A52",
  "Samsung Galaxy A51",
  "Samsung Galaxy A50",
  "Samsung Galaxy A42",
  "Samsung Galaxy A41",
  "Samsung Galaxy A40",
  "Samsung Galaxy A36 5G",
  "Samsung Galaxy A36",
  "Samsung Galaxy A35",
  "Samsung Galaxy A34",
  "Samsung Galaxy A33",
  "Samsung Galaxy A32",
  "Samsung Galaxy A31",
  "Samsung Galaxy A30s",
  "Samsung Galaxy A26",
  "Samsung Galaxy A25",
  "Samsung Galaxy A24",
  "Samsung Galaxy A23",
  "Samsung Galaxy A22",
  "Samsung Galaxy A21s",
  "Samsung Galaxy A21",
  "Samsung Galaxy A20e",
  "Samsung Galaxy A20",
  "Samsung Galaxy A17",
  "Samsung Galaxy A16",
  "Samsung Galaxy A15",
  "Samsung Galaxy A14",
  "Samsung Galaxy A13",
  "Samsung Galaxy A12",
  "Samsung Galaxy A11",
  "Samsung Galaxy A10s",
  "Samsung Galaxy A05s",
  "Samsung Galaxy A05",
  "Samsung Galaxy A04s",
  "Samsung Galaxy A04e",
  "Samsung Galaxy A04",
  "Samsung Galaxy A03 Core",
  "Samsung Galaxy A03s",
  "Samsung Galaxy A03",
  "Samsung Galaxy A02s",
  "Samsung Galaxy A02",
  "Samsung Galaxy A01",
  // OnePlus
  "OnePlus 15",
  "OnePlus 13S",
  "OnePlus 13T",
  "OnePlus 13R",
  "OnePlus 13",
  "OnePlus 12",
  "OnePlus 10T",
  "OnePlus 9R",
  "OnePlus 8",
  "OnePlus Nord 5",
  "OnePlus Nord CE 5",
  "OnePlus Nord CE4 Lite",
  "Diğer",
];

const TEXT_SIZES = {
  small: { label: "Küçük", maxChars: 64 },
  medium: { label: "Orta", maxChars: 35 },
  large: { label: "Büyük", maxChars: 20 },
};

const FONT_STYLES = {
  normal: "Normal",
  calligraphy: "Kaligrafi",
  serif: "Serif",
};

const PLACEMENTS = [
  { value: "center", label: "Orta" },
  { value: "top-center", label: "Üst Orta" },
  { value: "bottom-center", label: "Alt Orta" },
  { value: "top-left", label: "Üst Sol" },
  { value: "top-right", label: "Üst Sağ" },
  { value: "bottom-left", label: "Alt Sol" },
  { value: "bottom-right", label: "Alt Sağ" },
  { value: "left-center", label: "Sol Orta" },
  { value: "right-center", label: "Sağ Orta" },
];

export default function PhoneCasePage() {
  const { slug } = useParams<{ slug: string }>();
  const phoneCase = slug ? getPhoneCaseBySlug(slug) : undefined;
  const { addItem } = useCart();

  const [selectedPhoneModel, setSelectedPhoneModel] = useState<string>("");
  const [customPhoneModel, setCustomPhoneModel] = useState<string>("");
  const [phoneModelSearch, setPhoneModelSearch] = useState<string>("");
  const [showPhoneModelDropdown, setShowPhoneModelDropdown] =
    useState<boolean>(false);
  const [personalization, setPersonalization] = useState({
    enabled: false,
    text: "",
    textSize: "medium" as keyof typeof TEXT_SIZES,
    fontStyle: "normal" as keyof typeof FONT_STYLES,
    textColor: "#000000",
    placement: "center",
  });
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [randomProducts, setRandomProducts] = useState<any[]>([]);

  // Generate random products on client side only
  useEffect(() => {
    const allSlugs = [...memleketSlugs, ...hasretSlugs, ...recepIvedikSlugs];
    const shuffled = [...allSlugs].sort(() => 0.5 - Math.random());
    const selected = shuffled
      .slice(0, 3)
      .map((slug) => getProductBySlug(slug))
      .filter(Boolean);
    setRandomProducts(selected);
  }, []);

  // Show scroll to top button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!phoneCase) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Ürün bulunamadı</div>
      </div>
    );
  }

  const basePrice = phoneCase.price; // €40
  const personalizationPrice = personalization.enabled ? 10 : 0; // €10
  const totalPriceEur = basePrice + personalizationPrice; // Total in euros
  const totalPrice = getTestPrice(totalPriceEur) * 100; // Convert to cents

  const baseSlug = phoneCase.slug.replace("-phone-case", "");
  const images = getPhoneCaseImages(baseSlug);
  const embroideryImage = getPhoneCaseEmbroideryImage(baseSlug);

  const handleAddToCart = () => {
    // Determine phone model from selection or search
    const phoneModel =
      selectedPhoneModel === "Diğer"
        ? customPhoneModel.trim()
        : selectedPhoneModel || phoneModelSearch.trim();

    if (!phoneModel) {
      alert("Lütfen telefon modeli seçin veya girin");
      return;
    }

    if (personalization.enabled && !personalization.text.trim()) {
      alert("Lütfen kişiselleştirme metnini girin");
      return;
    }

    addItem({
      slug: phoneCase.slug,
      city: phoneCase.title,
      color: "",
      size: phoneModel,
      productType: "phonecase",
      price: totalPrice,
      image: images[0] || `/products/phonecases/${baseSlug}/saffron/1.png`,
      quantity: 1,
      personalization: personalization.enabled
        ? {
            method: "printed",
            text: personalization.text,
            placement: personalization.placement,
            font: personalization.fontStyle,
            color: personalization.textColor,
            cost: 10,
          }
        : undefined,
      giftPackage: giftPackaging
        ? {
            included: true,
            cost: 5,
            message: giftMessage,
          }
        : undefined,
      phoneModel: phoneModel,
      customPhoneModel:
        selectedPhoneModel === "Diğer" ? customPhoneModel.trim() : undefined,
    });
  };

  const handleTextChange = (text: string) => {
    // Auto-adjust size if text exceeds current size limit
    let newSize = personalization.textSize;
    if (text.length > TEXT_SIZES[personalization.textSize].maxChars) {
      if (text.length <= TEXT_SIZES.small.maxChars) {
        newSize = "small";
      } else if (text.length <= TEXT_SIZES.medium.maxChars) {
        newSize = "medium";
      } else {
        newSize = "large";
        // Truncate if exceeds large limit
        text = text.slice(0, TEXT_SIZES.large.maxChars);
      }
    }

    setPersonalization({
      ...personalization,
      text,
      textSize: newSize,
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-20 pb-4">
        <nav className="text-white/60 text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">Telefon Kılıfı</span>
          <span className="mx-2">/</span>
          <span className="text-white">{phoneCase.title}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div>
            <Gallery
              images={
                images.length > 0
                  ? images
                  : [`/products/phonecases/${baseSlug}/saffron/1.png`]
              }
              city={phoneCase.title}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
                {phoneCase.title} Telefon Kılıfı
              </h1>
              <div className="text-2xl text-white mb-4">
                €{totalPrice / 100}
              </div>
              {phoneCase.description && (
                <p className="text-white/60 text-sm mb-4">
                  {phoneCase.description}
                </p>
              )}
              <div className="bg-white/5 border border-white/10 rounded-none px-4 py-2 mb-6">
                <p className="text-white/80 text-xs">
                  <span className="font-medium">Ön sipariş ürünü</span> • 2
                  hafta içinde üretilir ve kargoya verilir
                </p>
              </div>
            </div>

            {/* Phone Model Selection */}
            <div className="relative">
              <div className="text-white/80 text-sm mb-3 font-medium">
                Telefon Modeli
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={
                    selectedPhoneModel === "Diğer"
                      ? customPhoneModel
                      : phoneModelSearch || selectedPhoneModel
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setPhoneModelSearch(value);
                    setShowPhoneModelDropdown(true);
                    if (selectedPhoneModel === "Diğer") {
                      setCustomPhoneModel(value);
                    } else {
                      setSelectedPhoneModel("");
                    }
                  }}
                  onFocus={() => setShowPhoneModelDropdown(true)}
                  onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => setShowPhoneModelDropdown(false), 200);
                  }}
                  placeholder="Model ara veya seçin"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                />
                {showPhoneModelDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-black border border-white/20 max-h-60 overflow-y-auto">
                    {PHONE_MODELS.filter((model) =>
                      model
                        .toLowerCase()
                        .includes(phoneModelSearch.toLowerCase())
                    ).map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          if (model === "Diğer") {
                            setSelectedPhoneModel("Diğer");
                            setPhoneModelSearch("");
                            setCustomPhoneModel("");
                          } else {
                            setSelectedPhoneModel(model);
                            setPhoneModelSearch(model);
                            setCustomPhoneModel("");
                          }
                          setShowPhoneModelDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white text-sm hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        {model}
                      </button>
                    ))}
                    {PHONE_MODELS.filter((model) =>
                      model
                        .toLowerCase()
                        .includes(phoneModelSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-white/60 text-sm">
                        Sonuç bulunamadı
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedPhoneModel === "Diğer" && (
                <div className="mt-2 text-white/60 text-xs">
                  Özel model girişi aktif
                </div>
              )}
            </div>

            {/* Personalization */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="personalization"
                  checked={personalization.enabled}
                  onChange={(e) =>
                    setPersonalization({
                      ...personalization,
                      enabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-white bg-white/5 border-white/20 rounded-none focus:ring-white/20 focus:ring-2"
                />
                <label
                  htmlFor="personalization"
                  className="text-white/80 text-sm cursor-pointer"
                >
                  Kişiselleştirme (+€10)
                </label>
              </div>

              {personalization.enabled && (
                <div className="bg-white/5 border border-white/10 rounded-none p-4 space-y-4">
                  {/* Text Input */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">
                      Metin (Maksimum{" "}
                      {TEXT_SIZES[personalization.textSize].maxChars} karakter)
                    </div>
                    <textarea
                      value={personalization.text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      maxLength={TEXT_SIZES[personalization.textSize].maxChars}
                      placeholder="Kişiselleştirme metnini girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/50 resize-none"
                      rows={3}
                    />
                    <div className="text-white/40 text-xs mt-1">
                      {personalization.text.length}/
                      {TEXT_SIZES[personalization.textSize].maxChars} karakter
                    </div>
                  </div>

                  {/* Embroidery Example Image */}
                  {personalization.enabled && personalization.text.trim() && (
                    <div className="mt-4">
                      <div className="text-white/60 text-xs mb-2">
                        Örnek Görsel
                      </div>
                      <div className="relative w-full aspect-square max-w-xs mx-auto">
                        <Image
                          src={embroideryImage}
                          alt="Kişiselleştirme örneği"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-white/40 text-xs mt-1 text-center">
                        Kişiselleştirme bu şekilde uygulanacaktır
                      </div>
                    </div>
                  )}

                  {/* Text Size */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">
                      Metin Boyutu
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(TEXT_SIZES).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setPersonalization({
                              ...personalization,
                              textSize: key as keyof typeof TEXT_SIZES,
                            })
                          }
                          className={`px-3 py-2 text-xs border rounded-none transition-all ${
                            personalization.textSize === key
                              ? "bg-white/10 border-white/40 text-white"
                              : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {value.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Style */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">Font Stili</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(FONT_STYLES).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setPersonalization({
                              ...personalization,
                              fontStyle: key as keyof typeof FONT_STYLES,
                            })
                          }
                          className={`px-3 py-4 border rounded-none transition-all text-center ${
                            personalization.fontStyle === key
                              ? "bg-white/10 border-white/40 text-white"
                              : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                          }`}
                          style={{
                            fontFamily:
                              key === "calligraphy"
                                ? "cursive"
                                : key === "serif"
                                ? "serif"
                                : "sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">
                      Metin Rengi
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={personalization.textColor}
                        onChange={(e) =>
                          setPersonalization({
                            ...personalization,
                            textColor: e.target.value,
                          })
                        }
                        className="w-12 h-12 bg-white/5 border border-white/20 rounded-none cursor-pointer"
                      />
                      <input
                        type="text"
                        value={personalization.textColor}
                        onChange={(e) =>
                          setPersonalization({
                            ...personalization,
                            textColor: e.target.value,
                          })
                        }
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Placement */}
                  <div>
                    <div className="text-white/60 text-xs mb-2">Yerleşim</div>
                    <div className="flex flex-wrap gap-2">
                      {PLACEMENTS.map((placement) => (
                        <button
                          key={placement.value}
                          onClick={() =>
                            setPersonalization({
                              ...personalization,
                              placement: placement.value,
                            })
                          }
                          className={`px-4 py-2 text-xs border rounded-none transition-all ${
                            personalization.placement === placement.value
                              ? "bg-white/10 border-white/40 text-white"
                              : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {placement.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gift Packaging */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="giftPackaging"
                  checked={giftPackaging}
                  onChange={(e) => setGiftPackaging(e.target.checked)}
                  className="w-4 h-4 text-white bg-white/5 border-white/20 rounded-none focus:ring-white/20 focus:ring-2"
                />
                <label
                  htmlFor="giftPackaging"
                  className="text-white/80 text-sm cursor-pointer"
                >
                  Hediye paketi (+€5)
                </label>
              </div>
              {giftPackaging && (
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Hediye mesajı (opsiyonel)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-none focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder-white/50 resize-none mt-3"
                  rows={2}
                  maxLength={100}
                />
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-white text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 hover:bg-white/90 rounded-none"
            >
              Sepete Ekle
            </button>

            <p className="text-white/60 text-xs text-center">
              Ön sipariş ürünü • 2 hafta içinde üretilir ve kargoya verilir
            </p>

            {/* Bundle Offers */}
            <div className="bg-black border border-white/10 rounded-none p-4 mt-4">
              <div className="text-white font-medium text-sm mb-2">
                Özel Paket Fırsatları
              </div>
              <div className="space-y-1.5 text-xs text-white/80">
                <div>
                  • 2 Telefon Kılıfı al, 2. kılıfta{" "}
                  <span className="text-white font-medium">-€10</span> indirim
                </div>
                <div>
                  • Telefon Kılıfı + Tişört al, tişörtte{" "}
                  <span className="text-white font-medium">-€5</span> indirim{" "}
                  <Link
                    href="/collection/memleket"
                    className="text-white underline underline-offset-1 hover:text-white/70 transition-colors border-b border-white"
                  >
                    → Tişörtleri gör
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="mt-12">
          <h3 className="text-white font-light text-xl mb-8">Özellikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">
                  El Yapımı & Dokuma
                </span>
              </div>
              <p className="text-white/80 text-sm">
                Geleneksel dokuma teknikleriyle el yapımı üretim
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">
                  %100 Pamuk İplik
                </span>
              </div>
              <p className="text-white/80 text-sm">
                Premium kalitede %100 pamuk iplik kullanımı
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white font-medium text-sm">
                  Üstün Tutuş & Koruma
                </span>
              </div>
              <p className="text-white/80 text-sm">
                Telefonunuzu güvenle korur, kaymaz tutuş sağlar
              </p>
            </div>
          </div>
        </div>
      </div>

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
                Geleneksel desenlerden ilham alan telefon kılıfı tasarımları,
                kültürel öğelerden esinlenerek oluşturulur.
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
                Hollanda'daki modern atölyemizde, premium kalitede malzemeler
                üzerine hassas dokuma ve işleme teknikleri uygulanır.
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
                koruma standartlarımızı karşılamayan ürünler üretimden
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
      {randomProducts.length > 0 && (
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
      )}

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
