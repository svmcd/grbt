"use client";

import Link from "next/link";
import Image from "next/image";
import { memleketSlugs, hasretSlugs, recepIvedikSlugs, getProductBySlug } from "@/lib/catalog";
import { phoneCaseSlugs, getPhoneCaseBySlug } from "@/lib/phone-case-catalog";
import { ProductCard } from "@/app/components/ProductCard";
import { TrustSignals } from "@/app/components/TrustSignals";
import { FAQ } from "@/app/components/FAQ";
import { NewsletterSignup } from "@/app/components/NewsletterSignup";
import { SocialLinks } from "@/app/components/SocialLinks";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/media/hero-desktop.png"
            alt="GRBT Brand Hero"
            fill
            className="object-cover hidden sm:block"
            priority
          />
          <Image
            src="/media/hero-mobile.png"
            alt="GRBT Brand Hero"
            fill
            className="object-cover block sm:hidden"
            priority
          />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative z-10 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-6xl font-light text-black font-serif leading-tight">
                  Memleketinizi
                  <br />
                  <span className="text-black/100">Tişörtlerde</span>
                  <br />
                  Taşıyın
                </h1>

                <p className="text-black/70 text-lg leading-relaxed max-w-md">
                  Türkiye'nin şehirlerini temsil eden özel tasarımlar.
                  Memleketinizi gururla taşıyın.
                </p>
              </div>

              {/* Right Content - Stats/Features */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2">
                      21
                    </div>
                    <div className="text-black/60 text-sm uppercase tracking-wider">
                      Şehir
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2">
                      100%
                    </div>
                    <div className="text-black/60 text-sm uppercase tracking-wider">
                      Pamuk
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2">
                      5%
                    </div>
                    <div className="text-black/60 text-sm uppercase tracking-wider">
                      Bağış
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black mb-2">
                      Hollanda
                    </div>
                    <div className="text-black/60 text-sm uppercase tracking-wider">
                      Üretim
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-none p-6">
                  <div className="text-black/80 text-sm mb-3">
                    Kalbinizdeki Şehir
                  </div>
                  <div className="text-black text-lg font-light mb-2">
                    Şehrinizdeki sessiz dostlar için
                  </div>
                  <div className="text-black/60 text-sm">
                    Her tişört satışında, kendi şehrinizdeki sokak hayvanlarına
                    sıcak bir yuva ve sevgi dolu bakım sağlıyoruz. Siz
                    giyindikçe, onlar da hayata tutunuyor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Memleket Collection Section */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
              Memleket Koleksiyonu
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Memleketinizi temsil eden tişörtler.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {memleketSlugs
              .slice(0, 3)
              .map((slug) => getProductBySlug(slug))
              .filter(
                (p): p is NonNullable<ReturnType<typeof getProductBySlug>> =>
                  !!p
              )
              .map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/collection/memleket"
              className="inline-block px-8 py-4 font-medium tracking-wider uppercase text-sm transition-all duration-300 bg-white text-black hover:bg-white/90 rounded-none"
              style={{
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            >
              Memleket Koleksiyonunu Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Phone Case Collection Section */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
              Telefon Kılıfları
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Geleneksel desenlerden ilham alan özel telefon kılıfı tasarımları.
            </p>
          </div>

          <div className="flex justify-center">
            {phoneCaseSlugs
              .map((slug) => {
                const phoneCase = getPhoneCaseBySlug(slug);
                return phoneCase ? { ...phoneCase, originalSlug: slug } : null;
              })
              .filter((p): p is NonNullable<typeof p> => !!p)
              .map((phoneCase) => (
                <Link
                  key={phoneCase.slug}
                  href={`/phone-case/${phoneCase.slug}`}
                  className="group block max-w-sm w-full"
                >
                  <div className="relative aspect-square mb-6">
                    <Image
                      src={`/products/phonecases/${phoneCase.originalSlug}/saffron/1.png`}
                      alt={phoneCase.title}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-white font-light text-xl group-hover:text-white/80 transition-colors font-serif">
                      {phoneCase.title}
                    </h3>
                    <div className="text-white/80 text-sm">
                      €{phoneCase.price}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Sinema Collection Section */}
      <div className="py-20 px-4 sm:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
              Sinema Koleksiyonu
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Türk sinemasından ilham alan özel tasarımlar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recepIvedikSlugs
              .filter((slug) => slug === "sibel_to_my_recep" || slug === "devam" || slug === "sensiz_olmaz")
              .map((slug) => getProductBySlug(slug))
              .filter(
                (p): p is NonNullable<ReturnType<typeof getProductBySlug>> =>
                  !!p
              )
              .map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/collection/sinema"
              className="inline-block px-8 py-4 font-medium tracking-wider uppercase text-sm transition-all duration-300 bg-white text-black hover:bg-white/90 rounded-none"
              style={{
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            >
              Sinema Koleksiyonunu Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Hasret Collection Section */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif">
              Hasret Koleksiyonu
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Gurbetteki Türklerin memleket özlemi ve kültürel aidiyetini
              yansıtan tasarımlar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {hasretSlugs
              .map((slug) => getProductBySlug(slug))
              .filter(
                (p): p is NonNullable<ReturnType<typeof getProductBySlug>> =>
                  !!p
              )
              .map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/collection/hasret"
              className="inline-block px-8 py-4 font-medium tracking-wider uppercase text-sm transition-all duration-300 bg-white text-black hover:bg-white/90 rounded-none"
              style={{
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            >
              Hasret Koleksiyonunu Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Hikayemiz Section */}
      <div className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light mb-8 text-white font-serif">
                HİKAYEMİZ
              </h2>
              <div className="space-y-6 text-white/80 leading-relaxed">
                <p>
                  Her şehir kendine özgü bir hikaye anlatır. Afyon'un termal
                  kaynaklarından Trabzon'un yeşil doğasına, Konya'nın mistik
                  atmosferinden Nevşehir'in peri bacalarına kadar.
                </p>
                <p>
                  Bu şehirlerin karakterini, renklerini ve ruhunu tişörtlerimize
                  yansıtıyoruz. Her tasarım, o şehrin özgün kimliğini taşır.
                </p>
                <p>
                  Memleketinizi yanınızda taşıyın. Şehrinizin hikayesini giyim
                  sanatıyla birleştirin ve kültürel mirasınızı yaşatın.
                </p>
              </div>
            </div>
            <div className="relative aspect-square">
              <Image
                src="/media/showcase1.png"
                alt="GRBT Brand Story"
                fill
                className="object-cover rounded-none"
              />
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

      {/* Social Links */}
      <SocialLinks />
    </div>
  );
}
