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
// Response sent to frontend (populated)
export interface FrontendOrderResponse {
  orderItems: {
    productId: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
  }[];
  orderInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: string;
    shippingMethod: string;
    address: any; // populated Address document
  };
  orderCode: string;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
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
): Promise<FrontendOrderResponse> => {
  const { orderItems, orderInfo } = data;

  // ✅ Check if address exists
  const addressExists = await Address.findById(orderInfo.address);
  if (!addressExists) throw new Error('Invalid address ID');

  // ✅ Fetch products for validation
  const productIds = orderItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== orderItems.length)
    throw new Error('One or more products not found');

  // ✅ Calculate subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    return sum + product.price * item.quantity;
  }, 0);

  // ✅ Shipping & tax
  const shipping = orderInfo.shippingMethod === 'express' ? 15.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // ✅ Create order
  const newOrderDoc = await Order.create({
    orderItems: orderItems.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      quantity: item.quantity,
    })),
    orderInfo: {
      ...orderInfo,
      address: new Types.ObjectId(orderInfo.address),
    },
    orderCode: generateOrderCode(),
    user: new Types.ObjectId(userId),
    paymentMethod: orderInfo.paymentMethod,
    paymentStatus: 'pending',
    status: 'pending',
    subtotal,
    shipping,
    tax,
    total,
  });

  // ✅ Populate order with products and address
  const populatedOrderDoc = await Order.findById(newOrderDoc._id)
    .populate('orderInfo.address')
    .populate('orderItems.productId');

  if (!populatedOrderDoc) throw new Error('Order not found after creation');

  const populatedOrder = populatedOrderDoc.toObject();

  // ✅ Transform for frontend
  const frontendOrder: FrontendOrderResponse = {
    orderItems: populatedOrder.orderItems.map((item: any) => {
      const product = item.productId as any; // populated product
      if (!product) throw new Error(`Product ${item.productId} not found`);

      return {
        productId: product._id.toString(),
        name: product.name,
        price: Number(product.price),
        image: product.img,
        quantity: item.quantity,
      };
    }),
    orderInfo: {
      ...populatedOrder.orderInfo,
      address: populatedOrder.orderInfo.address,
    },
    orderCode: populatedOrder.orderCode,
    paymentMethod: populatedOrder.paymentMethod,
    status: populatedOrder.status,
    paymentStatus: populatedOrder.paymentStatus,
    subtotal: Number(populatedOrder.subtotal),
    shipping: Number(populatedOrder.shipping),
    tax: Number(populatedOrder.tax),
    total: Number(populatedOrder.total),
    createdAt: new Date(populatedOrder.createdAt as string | number | Date),
    updatedAt: new Date(populatedOrder.updatedAt as string | number | Date),
  };

  console.log('✅ Populated Order:', populatedOrder);
  console.log('✅ Transformed Order Items:', frontendOrder.orderItems);

  return frontendOrder;
};

export const getOrderFromDB = async (userId: string): Promise<IOrder[]> => {
  const orders = await Order.find({ user: userId })
    .populate('orderItems.productId')
    .populate('orderInfo.address');
  return orders;
};

export const OrderServices = {
  createOrderIntoDB,
  getOrderFromDB,
};
