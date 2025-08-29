import { Schema, model } from 'mongoose';
import { IOrder, IOrderItem, IOrderModel } from './order.interface';

// Create the order item schema
const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    required: [true, 'Product ID is required'],
    ref: 'Product',
  },
  name: { 
    type: String, 
    required: [true, 'Product name is required'] 
  },
  image: { 
    type: String, 
    required: [true, 'Product image is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
});

// Create the order schema
const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    orderItems: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function(v: IOrderItem[]) {
          return v && v.length > 0;
        },
        message: 'At least one order item is required'
      }
    },
    shippingAddress: {
      address: { 
        type: String, 
        required: [true, 'Address is required'] 
      },
      city: { 
        type: String, 
        required: [true, 'City is required'] 
      },
      postalCode: { 
        type: String, 
        required: [true, 'Postal code is required'] 
      },
      country: { 
        type: String, 
        required: [true, 'Country is required'] 
      },
      phone: { 
        type: String, 
        required: [true, 'Phone number is required'] 
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['credit_card', 'paypal', 'cash_on_delivery'],
        message: 'Payment method is either: credit_card, paypal, or cash_on_delivery'
      },
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { 
      type: Number, 
      required: [true, 'Items price is required'],
      min: [0, 'Items price must be a positive number']
    },
    taxPrice: { 
      type: Number, 
      required: [true, 'Tax price is required'],
      min: [0, 'Tax price must be a positive number']
    },
    shippingPrice: { 
      type: Number, 
      required: [true, 'Shipping price is required'],
      min: [0, 'Shipping price must be a positive number']
    },
    totalPrice: { 
      type: Number, 
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be a positive number']
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    paidAt: { type: Date },
    isDelivered: { 
      type: Boolean, 
      default: false 
    },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Status is either: pending, processing, shipped, delivered, or cancelled'
      },
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Payment status is either: pending, completed, failed, or refunded'
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Create and export the model
export const Order = model<IOrder, IOrderModel>('Order', orderSchema);
