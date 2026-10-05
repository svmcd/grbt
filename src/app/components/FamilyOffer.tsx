"use client";

import { useFormatPrice, useMessages } from "@/i18n/LocaleProvider";
import sectionMessages from "@/i18n/messages/homeSections";

// Memleket family discount (applied in the cart: 2 Memleket items -€5, 3 or more -€10),
// shown as three square bundle boxes. `showHeading={false}` when the page renders its own heading.
export function FamilyOffer({ showHeading = true }: { showHeading?: boolean }) {
  const t = useMessages(sectionMessages).family;
  const eur = useFormatPrice();

  const boxes = [
    { count: t.oneShirt, note: null, amount: null },
    { count: t.twoShirts, note: t.twoFor, amount: `−${eur(5)}` },
    { count: t.threeShirts, note: t.threeFor, amount: `−${eur(10)}` },
  ];

  return (
    <div className="text-ink">
      {showHeading && (
        <div className="mb-6">
          <p className="sub-xs text-subdued">{t.badge}</p>
          <h3 className="sub mt-2 font-semibold">{t.title}</h3>
          <p className="sub mt-1">{t.hook}</p>
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        {boxes.map((box) => (
          <li
            key={box.count}
            className={
              "flex min-h-36 flex-col justify-between border p-3 sm:min-h-44 sm:p-5 " +
              (box.amount ? "border-ink" : "border-line-strong")
            }
          >
            <div>
              <p className="sub font-semibold">{box.count}</p>
              {box.note && <p className="sub-xs mt-2 hidden text-subdued sm:block">{box.note}</p>}
            </div>
            {box.amount ? (
              <p className="h-section">{box.amount}</p>
            ) : (
              <p className="sub-xs text-subdued">{t.regularPrice}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="sub-xs mt-4 text-subdued">{t.mixCities}</p>
    </div>
  );
}
