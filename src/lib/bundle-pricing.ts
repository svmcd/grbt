import { CartItem } from "./cart-context";

export type BundleAdjustedItem = {
  item: CartItem;
  originalPrice: number;
  adjustedPrice: number;
  bundleDiscount: number;
  bundleType?: "phonecase-phonecase" | "phonecase-shirt";
};

/**
 * Calculates bundle pricing for cart items
 * Bundles:
 * 1. 2 Phone cases = €10 discount on second phone case
 * 2. Phone case + Shirt = €5 discount on first shirt
 */
export function calculateBundlePricing(items: CartItem[]): BundleAdjustedItem[] {
  const phoneCases = items.filter((item) => item.productType === "phonecase");
  const shirts = items.filter(
    (item) =>
      item.productType === "tshirt" ||
      item.productType === "hoodie" ||
      item.productType === "sweater"
  );

  const hasPhoneCase = phoneCases.length > 0;
  const hasShirt = shirts.length > 0;
  const hasTwoPhoneCases = phoneCases.reduce((sum, item) => sum + item.quantity, 0) >= 2;
  const isEligibleForPhoneCaseBundle = hasTwoPhoneCases;
  const isEligibleForShirtBundle = hasPhoneCase && hasShirt;

  return items.map((item) => {
    const originalPrice = item.price;
    let adjustedPrice = originalPrice;
    let bundleDiscount = 0;
    let bundleType: "phonecase-phonecase" | "phonecase-shirt" | undefined = undefined;

    // Bundle 1: 2 Phone cases = €10 discount on second phone case
    if (item.productType === "phonecase" && isEligibleForPhoneCaseBundle) {
      // Count phone cases before this item
      let phoneCaseCountBefore = 0;
      let foundCurrentItem = false;
      
      for (const phoneCase of phoneCases) {
        // Check if this is the current item by comparing all identifying properties
        const isCurrentItem = 
          phoneCase.slug === item.slug &&
          phoneCase.size === item.size &&
          JSON.stringify(phoneCase.personalization) === JSON.stringify(item.personalization) &&
          JSON.stringify(phoneCase.giftPackage) === JSON.stringify(item.giftPackage);
        
        if (isCurrentItem && !foundCurrentItem) {
          foundCurrentItem = true;
          // Apply discount to the second phone case
          // If phoneCaseCountBefore === 0 and item.quantity >= 2, discount applies to 2nd unit of this item
          // If phoneCaseCountBefore === 1, discount applies to 1st unit of this item
          if (item.quantity > 0) {
            let discountedUnits = 0;
            
            if (phoneCaseCountBefore === 0 && item.quantity >= 2) {
              // This is the first phone case item and has 2+ quantity, discount the 2nd unit
              discountedUnits = 1;
            } else if (phoneCaseCountBefore === 1) {
              // There's exactly 1 phone case before this, discount the 1st unit of this item
              discountedUnits = Math.min(1, item.quantity);
            }
            
            if (discountedUnits > 0) {
              const fullPriceUnits = item.quantity - discountedUnits;

              const discountedTotal = discountedUnits * (originalPrice - 1000); // -€10
              const fullPriceTotal = fullPriceUnits * originalPrice;
              const totalPrice = discountedTotal + fullPriceTotal;
              adjustedPrice = Math.round(totalPrice / item.quantity);

              bundleDiscount = 1000 * discountedUnits; // €10 discount per discounted unit
              bundleType = "phonecase-phonecase";
            }
          }
          // Don't break - continue to count all items, but don't count the current item's quantity
          continue;
        }
        
        // Count all items before we find the current item
        if (!foundCurrentItem) {
          phoneCaseCountBefore += phoneCase.quantity;
        }
      }
    }

    // Bundle 2: Phone case + Shirt = €5 discount on first shirt
    if (
      (item.productType === "tshirt" || item.productType === "hoodie" || item.productType === "sweater") &&
      isEligibleForShirtBundle &&
      !bundleType // Don't override phone case bundle if already applied
    ) {
      // Find this item's position in the shirts sequence
      let shirtCountBefore = 0;
      for (const shirt of shirts) {
        if (
          shirt.slug === item.slug &&
          shirt.color === item.color &&
          shirt.size === item.size &&
          shirt.productType === item.productType &&
          JSON.stringify(shirt.personalization) === JSON.stringify(item.personalization) &&
          JSON.stringify(shirt.giftPackage) === JSON.stringify(item.giftPackage)
        ) {
          break;
        }
        shirtCountBefore += shirt.quantity;
      }

      // Only apply discount to the first shirt
      const isFirstShirt = shirtCountBefore === 0;
      if (isFirstShirt && item.quantity > 0) {
        // Calculate how many units get the discount (only 1)
        const discountedUnits = Math.min(1, item.quantity);
        const fullPriceUnits = item.quantity - discountedUnits;

        // Calculate weighted average price
        const discountedTotal = discountedUnits * (originalPrice - 500); // -€5
        const fullPriceTotal = fullPriceUnits * originalPrice;
        const totalPrice = discountedTotal + fullPriceTotal;
        adjustedPrice = Math.round(totalPrice / item.quantity);

        bundleDiscount = 500; // €5 discount
        bundleType = "phonecase-shirt";
      }
    }

    return {
      item,
      originalPrice,
      adjustedPrice: Math.max(0, adjustedPrice), // Ensure price doesn't go negative
      bundleDiscount,
      bundleType,
    };
  });
}

/**
 * Get total bundle discount amount
 */
export function getTotalBundleDiscount(items: CartItem[]): number {
  const adjusted = calculateBundlePricing(items);
  return adjusted.reduce((sum, adj) => sum + adj.bundleDiscount, 0);
}

