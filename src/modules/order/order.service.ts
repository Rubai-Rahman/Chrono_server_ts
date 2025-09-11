import { Order } from './order.model';
import { IOrder, OrderStatus, PaymentStatus } from './order.interface';
import { orderSchema } from './order.validation';
import { Address } from '@modules/adresses/address.model';
import { Product } from '@modules/product/product.model';
import { Types } from 'mongoose';

interface FrontendOrderData {
  orderInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    shippingMethod: string;
  };
  orderItems: Array<{
    productId: string;
    quantity: number;
  }>;
}
function generateOrderCode() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `ORD-${yyyy}${mm}${dd}-${random}`;
}

export const createOrderIntoDB = async (
  data: FrontendOrderData,
  userId: string,
): Promise<IOrder> => {
  const { orderItems, orderInfo } = data;

  const addressExists = await Address.findById(orderInfo.address);
  if (!addressExists) {
    throw new Error('Invalid address ID');
  }

  const productIds = orderItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== orderItems.length) {
    throw new Error('One or more products not found');
  }
  // ✅ Calculate subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    const product = products.find((p) => p._id.toString() === item.productId);

    if (!product) throw new Error(`Product ${item.productId} not found`);
    return sum + product.price * item.quantity;
  }, 0);

  // ✅ Calculate shipping & tax
  const shipping = orderInfo.shippingMethod === 'express' ? 15.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  // ✅ Set default statuses
  const paymentStatus: PaymentStatus =
    orderInfo.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending';

  const orderStatus: OrderStatus = 'pending';
  // ✅ Create order
  const newOrder = await Order.create({
    orderItems,
    orderInfo: {
      ...orderInfo,
      address: new Types.ObjectId(orderInfo.address),
    },
    user: new Types.ObjectId(userId),
    paymentMethod: orderInfo.paymentMethod,
    paymentStatus,
    status: orderStatus,
    subtotal,
    shipping,
    tax,
    total,
    orderCode: generateOrderCode(),
  });
  return newOrder;
};

export const OrderServices = {
  createOrderIntoDB,
};
