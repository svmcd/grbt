export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-3xl text-left space-y-4">
        <h1 className="text-3xl font-light">Gizlilik Politikası</h1>
        <p className="text-muted/80">
          Kişisel verilerinizin korunması bizim için önemlidir.
        </p>
        <h2 className="text-xl mt-6">Veri Toplama</h2>
        <p className="text-muted/80">
          Sipariş işleme, müşteri hizmetleri ve web sitesi iyileştirmesi için
          gerekli bilgileri topluyoruz.
        </p>
        <h2 className="text-xl mt-6">Veri Kullanımı</h2>
        <p className="text-muted/80">
          Toplanan veriler yalnızca hizmet sağlama ve iyileştirme amaçlarıyla
          kullanılır. Üçüncü taraflarla paylaşılmaz.
        </p>
        <h2 className="text-xl mt-6">Çerezler</h2>
        <p className="text-muted/80">
          Web sitesi deneyimini iyileştirmek için çerezler kullanıyoruz.
          Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
        </p>
        <h2 className="text-xl mt-6">İletişim</h2>
        <p className="text-muted/80">
          Gizlilik konularında sorularınız için info@grbt.studio adresinden bize
          ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
}
