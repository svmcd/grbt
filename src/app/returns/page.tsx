export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex p-8 flex-col items-center">
      <div className="w-full max-w-3xl text-left space-y-4">
        <h1 className="text-3xl font-light">İade Politikası</h1>
        <h2 className="text-xl mt-6">Geri çekme hakkı (AB)</h2>
        <p className="text-muted/80">
          Teslimattan itibaren 14 gün içinde sebep göstermeden geri çekme
          hakkınız vardır. Ürünler giyilmemiş, yıkanmamış ve etiketleriyle
          birlikte orijinal durumda olmalıdır.
        </p>
        <h2 className="text-xl mt-6">Nasıl iade edilir</h2>
        <p className="text-muted/80">
          Sipariş numaranızla birlikte Destek sayfası üzerinden destek ekibiyle
          iletişime geçin. İade talimatları sağlayacağız.
        </p>
        <h2 className="text-xl mt-6">İadeler</h2>
        <p className="text-muted/80">
          Onaylandıktan sonra, iadeler orijinal ödeme yöntemine iade edilen
          ürünlerin alınmasından itibaren 14 gün içinde yapılır.
        </p>
        <h2 className="text-xl mt-6">İstisnalar</h2>
        <p className="text-muted/80">
          Final satış ürünleri veya kişiselleştirilmiş ürünler yasaya izin
          verdiği ölçüde istisna tutulabilir.
        </p>
      </div>
    </div>
  );
}
