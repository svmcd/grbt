export default function SupportPage() {
  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-3xl text-left space-y-4">
        <h1 className="text-3xl font-light">Destek</h1>
        <p className="text-muted/80">
          Yardıma mı ihtiyacınız var? Bize info@grbt.studio veya +31 6 2881 2182
          numarasından ulaşabilirsiniz. Sipariş güncellemeleri için Siparişimi
          Takip Et sayfasına bakın.
        </p>
        <h2 className="text-xl mt-6">Sık Sorulan Sorular</h2>
        <p className="text-muted/80">
          Kargo süreleri, iadeler, bedenler ve bakım talimatları politikalarımız
          ve ürün sayfalarımızda yer almaktadır.
        </p>
      </div>
    </div>
  );
}
