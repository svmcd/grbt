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

export function getPaymentMethod(id: string): PaymentMethod | undefined {
    return paymentMethods.find(method => method.id === id);
}

export function getAllPaymentMethods(): PaymentMethod[] {
    return paymentMethods;
}
