export default function TermsPage() {
  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-3xl text-left space-y-4">
        <h1 className="text-3xl font-light">Şartlar ve Koşullar</h1>
        <p className="text-muted/80">
          Bu şartlar ve koşullar grbt.studio web sitesini kullanımınızı yönetir.
        </p>
        <h2 className="text-xl mt-6">Kullanım</h2>
        <p className="text-muted/80">
          Bu siteyi kullanarak bu şartları kabul etmiş sayılırsınız. Siteyi
          yalnızca yasal amaçlarla kullanabilirsiniz.
        </p>
        <h2 className="text-xl mt-6">Siparişler</h2>
        <p className="text-muted/80">
          Tüm siparişler stok durumuna tabidir. Fiyatlar değişiklik
          gösterebilir. Ödeme onaylandıktan sonra sipariş işleme alınır.
        </p>
        <h2 className="text-xl mt-6">İletişim</h2>
        <p className="text-muted/80">
          Sorularınız için info@grbt.studio adresinden bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
}
