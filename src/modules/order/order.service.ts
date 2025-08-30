import { Order } from './order.model';
import { IOrder } from './order.interface';
import { orderSchema } from './order.validation';

interface FrontendOrderData {
  orderInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    paymentMethod: string;
    shippingMethod: string;
  };
  orderItems: Array<{
    productId: string;
    quantity: number;
    price: string | number;
  }>;
  orderSummary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export const createOrderIntoDB = async (data: FrontendOrderData): Promise<IOrder> => {
  try {
    // Normalize payment method to match expected format
    const normalizePaymentMethod = (method: string): string => {
      const methodMap: Record<string, string> = {
        'cashondelivery': 'cash_on_delivery',
        'cashOnDelivery': 'cash_on_delivery',
        'creditcard': 'credit_card',
        'creditCard': 'credit_card',
        'paypal': 'paypal'
      };
      
      const normalized = method.toLowerCase().replace(/[ -]/g, '');
      return methodMap[normalized] || method;
    };

    const normalizedPaymentMethod = normalizePaymentMethod(data.orderInfo.paymentMethod);

    // Transform the data to match the expected format
    const orderData = {
      orderItems: data.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price)
      })),
      shippingAddress: {
        firstName: data.orderInfo.firstName,
        lastName: data.orderInfo.lastName,
        email: data.orderInfo.email,
        phone: data.orderInfo.phone,
        address: data.orderInfo.address,
        city: data.orderInfo.city,
        postalCode: data.orderInfo.postalCode,
        country: data.orderInfo.country,
        paymentMethod: normalizedPaymentMethod,
        shippingMethod: data.orderInfo.shippingMethod
      },
      orderSummary: {
        subtotal: data.orderSummary.subtotal,
        shipping: data.orderSummary.shipping,
        tax: data.orderSummary.tax,
        total: data.orderSummary.total
      },
      paymentMethod: normalizedPaymentMethod,
      status: 'pending',
      paymentStatus: normalizedPaymentMethod === 'cash_on_delivery' ? 'pending' : 'completed'
    };

    // Validate the transformed data against the schema
    const validatedData = orderSchema.parse(orderData);
    
    // Create the order
    const order = await Order.create(validatedData);
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create order');
  }
};

export const OrderServices = {
  createOrderIntoDB,
};
