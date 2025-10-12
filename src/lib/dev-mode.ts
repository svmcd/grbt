// Development mode - always 1 cent in dev
export const DEV_MODE = process.env.NODE_ENV === 'development';

// Toggle for dev pricing (set to false to disable dev pricing even in dev mode)
export const ENABLE_DEV_PRICING = true;

// Helper function to get price based on mode
export function getTestPrice(originalPrice: number): number {
    return (DEV_MODE && ENABLE_DEV_PRICING) ? 0.01 : originalPrice;
}

// Helper function to get shipping price based on mode
export function getTestShippingPrice(originalPrice: number): number {
    return (DEV_MODE && ENABLE_DEV_PRICING) ? 0 : originalPrice;
}
