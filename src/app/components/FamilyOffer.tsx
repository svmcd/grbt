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
            Köklerinizi birlikte taşıyın, bağlarınızı güçlendirin
          </p>
        </div>

        {/* Offers with Urgency */}
        <div className="space-y-4">
          <div className="bg-black border border-black rounded-none p-4 relative">
            <div className="absolute top-2 left-2">
              <span className="bg-white text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none">
                EN POPÜLER
              </span>
            </div>
            <div className="flex items-center justify-between mb-2 pt-6">
              <div className="text-white font-bold text-lg">2 Tişört</div>
              <div className="absolute top-2 right-2 text-right">
                <div className="text-white/50 text-sm line-through">€80</div>
                <div className="text-white text-lg font-medium">€75</div>
              </div>
            </div>
            <div className="text-white/80 text-sm mb-2">
              Anne ve babanızın memleketi için
            </div>
            <div className="text-white/90 text-xs mb-2">€5 tasarruf</div>
            <div className="text-white/60 text-xs">
              Aile bağlarınızı güçlendirin
            </div>
          </div>

          <div className="bg-black border border-black rounded-none p-4 relative">
            <div className="absolute top-2 left-2">
              <span className="bg-white text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none">
                EN İYİ DEĞER
              </span>
            </div>
            <div className="flex items-center justify-between mb-2 pt-6">
              <div className="text-white font-bold text-lg">3 Tişört</div>
              <div className="absolute top-2 right-2 text-right">
                <div className="text-white/50 text-sm line-through">€120</div>
                <div className="text-white text-lg font-medium">€110</div>
              </div>
            </div>
            <div className="text-white/80 text-sm mb-2">
              Daha fazla istiyorsanız
            </div>
            <div className="text-white/90 text-xs mb-2">
              €10 tasarruf • Ücretsiz kargo
            </div>
            <div className="text-white/60 text-xs">En iyi değer</div>
          </div>
        </div>

        {/* Trust Signals & Urgency */}
        <div className="text-center mt-3 space-y-3">
          <p className="text-black/50 text-xs">
            Farklı şehirlerden seçim yapabilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}
