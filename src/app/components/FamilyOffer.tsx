export function FamilyOffer() {
  return (
    <div className="bg-white border border-black rounded-none -mx-4 p-6 mt-6 lg:flex lg:justify-center overflow-hidden">
      <div className="w-full lg:max-w-md">
        {/* Emotional Hook */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-black border border-black rounded-none mb-3">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              ÖZEL AİLE FIRSATI
            </span>
          </div>
          <h3 className="text-black font-medium text-xl mb-3 font-serif">
            ANNE BABA MEMLEKETİ
          </h3>
          <p className="text-black/80 text-sm mb-2 font-medium">
            Ailenizin köklerini birlikte taşıyın
          </p>
          <p className="text-black/60 text-xs leading-relaxed">
            Babanızın ve annenizin memleketlerini temsil eden tişörtlerle
            <br />
            aile bağlarınızı güçlendirin ve mirasınızı yaşatın
          </p>
        </div>

        {/* Offers with Urgency */}
        <div className="space-y-4">
          <div className="bg-white border border-black rounded-none p-4 relative">
            <div className="absolute top-2 left-2">
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none">
                EN POPÜLER
              </span>
            </div>
            <div className="flex items-center justify-between mb-2 pt-6">
              <div className="text-black font-bold text-lg">2 Tişört</div>
              <div className="absolute top-2 right-2 text-right">
                <div className="text-black/50 text-sm line-through">€80</div>
                <div className="text-black text-lg font-medium">€75</div>
              </div>
            </div>
            <div className="text-black/60 text-sm mb-2">
              Babanızın ve annenizin memleketi için
            </div>
            <div className="text-black/70 text-xs mb-2">€5 tasarruf</div>
            <div className="text-black/50 text-xs">
              Aile fotoğraflarında mükemmel uyum
            </div>
          </div>

          <div className="bg-white border border-black rounded-none p-4 relative">
            <div className="absolute top-2 left-2">
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none">
                EN İYİ DEĞER
              </span>
            </div>
            <div className="flex items-center justify-between mb-2 pt-6">
              <div className="text-black font-bold text-lg">3 Tişört</div>
              <div className="absolute top-2 right-2 text-right">
                <div className="text-black/50 text-sm line-through">€120</div>
                <div className="text-black text-lg font-medium">€110</div>
              </div>
            </div>
            <div className="text-black/60 text-sm mb-2">
              Aile memleketleri için (büyükanne/büyükbaba dahil)
            </div>
            <div className="text-black/70 text-xs mb-2">
              €10 tasarruf • Ücretsiz kargo
            </div>
            <div className="text-black/50 text-xs">
              Tüm aile için memleket gururu
            </div>
          </div>
        </div>

        {/* Trust Signals & Urgency */}
        <div className="text-center mt-3 space-y-3">
          <p className="text-black/50 text-xs">
            Farklı şehirlerden seçim yapabilirsiniz
          </p>
          <div className="bg-black border border-black rounded-none p-3">
            <p className="text-white text-xs font-medium">
              Bu fırsat sınırlı süre için geçerlidir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
