export function TrustSignals() {
  const signals = [
    {
      title: "100% Pamuk",
      description: "Premium kalitede 240 gram/m² pamuklu kumaş",
      details: "Yüksek kaliteli pamuklu kumaş, dayanıklılık ve konfor sağlar.",
      image: "/media/showcase1.png",
    },
    {
      title: "Hollanda'dan Gönderim",
      description: "Hollanda'daki atölyemizden direkt gönderim",
      details:
        "Tüm ürünlerimiz Hollanda'daki modern atölyemizde üretilir ve gönderilir.",
    },
    {
      title: "Aynı Gün Gönderim",
      description: "20:00'dan önce sipariş ver, aynı gün gönder",
      details:
        "Saat 20:00'dan önce verilen siparişler aynı gün içinde kargoya verilir.",
    },
    {
      title: "Hızlı Kargo",
      description: "Avrupa içi 2-6 gün teslimat",
      details: "Avrupa ülkelerine 2-6 iş günü içinde güvenli teslimat.",
    },
    {
      title: "Ücretsiz Kargo",
      description: "€100 üzeri siparişlerde ücretsiz kargo",
      details: "€100 ve üzeri siparişlerde kargo ücreti alınmaz.",
    },
    {
      title: "60 Gün İade",
      description: "60 gün içinde iade hakkı",
      details:
        "Ürününüzden memnun kalmazsanız 60 gün içinde ücretsiz iade edebilirsiniz.",
    },
    {
      title: "Sigortalı Kargo",
      description: "Takip numarası ile sigortalı gönderim",
      details:
        "Tüm gönderilerimiz sigortalıdır ve takip numarası ile takip edilebilir.",
    },
    {
      title: "7/24 Destek",
      description: "7 gün 24 saat müşteri desteği",
      details:
        "Herhangi bir sorunuzda 7 gün 24 saat müşteri hizmetlerimizden destek alabilirsiniz.",
    },
    {
      title: "Premium Paketleme",
      description: "Ücretsiz premium paketleme",
      details: "Tüm ürünlerimiz özel tasarım premium paketlerde gönderilir.",
    },
  ];

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-white font-serif mb-4">
            NEDEN GRBT?
          </h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Kalite, güven ve memleket sevgisini bir araya getiren ürünlerimiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-none p-4 transition-all duration-300 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm mb-1">
                    {signal.title}
                  </h3>
                  <p className="text-white/70 text-xs">{signal.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
