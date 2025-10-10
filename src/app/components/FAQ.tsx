"use client";

import { useState } from "react";

export function FAQ() {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const faqs = [
    {
      question: "Hangi malzeme kullanılıyor?",
      answer:
        "Premium %100 pamuk kumaş kullanıyoruz. Dayanıklı ve sürdürülebilir kalitede üretim yapıyoruz.",
    },
    {
      question: "Kargo süresi ne kadar?",
      answer:
        "Avrupa'da 1-7 gün içinde teslimat yapıyoruz. Hollanda'dan gönderdiğimiz için yaşadığınız yere ne kadar yakınsa o kadar hızlı teslim alırsınız.",
    },
    {
      question: "İade politikası nasıl?",
      answer:
        "60 gün içinde iade edebilirsiniz. Ürünün kullanılmamış olması gerekiyor.",
    },
    {
      question: "Tişörtler nerede üretiliyor?",
      answer:
        "Güvenilir partnerimizden yüksek kaliteli tişörtler alıyoruz. Hollanda'daki Wormerveer fabrikamızda tasarlayıp, baskı ve nakış işlemlerini gerçekleştiriyoruz.",
    },
    {
      question: "Bedenler nasıl?",
      answer: "Bedenler normal kesimdir, standart ölçülerde üretiliyor.",
    },
    {
      question: "Bağış sistemi nedir?",
      answer:
        "Sadece Memleket koleksiyonundan ürün aldığınızda kendi memleketinizi desteklemiş oluyorsunuz. Türkiye'de sokak hayvanları sorunu olduğu için hayvan barınaklarını destekliyoruz. Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
    },
    {
      question: "Nasıl iletişime geçebilirim?",
      answer:
        "E-posta, Instagram, TikTok, telefon numarası ve WhatsApp üzerinden bize ulaşabilirsiniz.",
    },
    {
      question: "Takip sistemi nasıl çalışıyor?",
      answer:
        "Sipariş verdiğinizde onay e-postası gönderiyoruz. Kargoya verildiğinde takip numarası alırsınız. Herhangi bir sorun yaşarsanız bizimle iletişime geçin.",
    },
  ];

  return (
    <div className="py-16 px-4 bg-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-white font-serif mb-4">
            SIKÇA SORULAN SORULAR
          </h2>
          <p className="text-white/70 text-sm">
            Merak ettiğiniz her şey için yanıtlar burada
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-black/40 border border-white/10 rounded-none overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                onClick={() =>
                  setExpandedItem(expandedItem === index ? null : index)
                }
              >
                <span className="text-white font-medium text-sm pr-4">
                  {faq.question}
                </span>
                <span className="text-white/50 text-lg flex-shrink-0">
                  {expandedItem === index ? "−" : "+"}
                </span>
              </button>

              {expandedItem === index && (
                <div className="px-6 pb-4">
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/70 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
