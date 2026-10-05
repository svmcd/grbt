import type { Locale } from "@/i18n/config";
import paymentMethodMessages from "@/i18n/messages/paymentMethods";

export type PaymentMethod = {
    id: string;
    name: string;
    type: 'card' | 'digital_wallet' | 'bank_transfer' | 'buy_now_pay_later';
    icon?: string;
    description?: string;
};

export const paymentMethods: PaymentMethod[] = [
    {
        id: 'card',
        name: 'Credit Card',
        type: 'card',
        description: 'Visa, Mastercard, American Express'
    },
    {
        id: 'apple_pay',
        name: 'Apple Pay',
        type: 'digital_wallet',
        description: 'Pay with Touch ID or Face ID'
    },
    {
        id: 'paypal',
        name: 'PayPal',
        type: 'digital_wallet',
        description: 'Pay with your PayPal account'
    },
    {
        id: 'bancontact',
        name: 'Bancontact',
        type: 'bank_transfer',
        description: 'Belgian bank transfer'
    },
    {
        id: 'ideal',
        name: 'iDEAL',
        type: 'bank_transfer',
        description: 'Dutch bank transfer'
    },
    {
        id: 'revolut_pay',
        name: 'Revolut Pay',
        type: 'digital_wallet',
        description: 'Pay with Revolut'
    }
];

// Without a locale the original (English) labels are returned
function localizePaymentMethod(method: PaymentMethod, locale?: Locale): PaymentMethod {
    if (!locale) return method;
    const labels = paymentMethodMessages[locale][method.id];
    if (!labels) return method;
    return { ...method, name: labels.name, description: labels.description };
}

export function getPaymentMethod(id: string, locale?: Locale): PaymentMethod | undefined {
    const method = paymentMethods.find(method => method.id === id);
    return method ? localizePaymentMethod(method, locale) : undefined;
}

export function getAllPaymentMethods(locale?: Locale): PaymentMethod[] {
    return paymentMethods.map(method => localizePaymentMethod(method, locale));
}
