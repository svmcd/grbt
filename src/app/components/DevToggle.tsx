"use client";

export function DevToggle() {
  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg opacity-5">
      <div className="text-xs font-bold mb-2">DEV MODE</div>
      <div className="text-xs text-red-200">
        All prices: €0.01
        <br />
        Shipping: Free
      </div>
    </div>
  );
}
