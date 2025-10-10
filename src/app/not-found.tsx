export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl text-white font-light mb-2">
          Sayfa bulunamadı
        </h1>
        <p className="text-muted/80">
          Aradığın sayfa yok olmuş gibi. Ana sayfaya dön.
        </p>
      </div>
    </div>
  );
}
