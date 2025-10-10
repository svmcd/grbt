export default function ShippingPage() {
  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-3xl text-left space-y-4">
        <h1 className="text-3xl font-light">Kargo Politikası</h1>
        <p className="text-muted/80">
          Hollanda'dan AB'ye ve seçili uluslararası destinasyonlara kargo
          yapıyoruz.
        </p>
        <h2 className="text-xl mt-6">İşleme</h2>
        <p className="text-muted/80">Siparişler 1-3 iş günü içinde işlenir.</p>
        <h2 className="text-xl mt-6">Teslimat süreleri</h2>
        <p className="text-muted/80">
          Hollanda 1-3 gün, AB 3-7 gün, Uluslararası 7-14 gün. Süreler
          tahminidir.
        </p>
        <h2 className="text-xl mt-6">Gümrük ve Vergiler</h2>
        <p className="text-muted/80">
          AB KDV'si uygulanabilir olduğunda dahildir. AB dışı siparişler alıcı
          tarafından ödenmesi gereken ithalat vergileri/gümrük vergileri
          içerebilir.
        </p>
        <h2 className="text-xl mt-6">Takip</h2>
        <p className="text-muted/80">
          Kargo gönderildiğinde takip bağlantısı sağlanacaktır. Güncellemeler
          için Siparişimi Takip Et'i kullanın.
        </p>
      </div>
    </div>
  );
}
