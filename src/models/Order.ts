import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  menuItem: string; // Reference to MenuItem._id
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: string; // Reference to User._id
  restaurant: string; // Reference to Restaurant._id
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status:
    | "pending"
    | "preparing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentId?: string;
  estimatedDeliveryTime: Date;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: Schema.Types.ObjectId,
          ref: "Restaurant.menu",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          // Functional bug: Price changes between adding to cart and checkout
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          // Functional bug: Quantity limit isn't enforced consistently
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      // Functional bug: Subtotal calculation occasionally mismatches item prices × quantities
    },
    tax: {
      type: Number,
      required: true,
      // Functional bug: Tax calculation sometimes uses wrong rate based on location
    },
    deliveryFee: {
      type: Number,
      required: true,
      // Functional bug: Free delivery threshold sometimes not applied correctly
    },
    total: {
      type: Number,
      required: true,
      // Functional bug: Total calculation sometimes doesn't include all fees
    },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      // Functional bug: Status transitions sometimes skip states
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      // Functional bug: Address validation allows invalid formats
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      // Functional bug: Orders can sometimes be placed without payment verification
    },
    estimatedDeliveryTime: {
      type: Date,
      required: true,
      // Functional bug: Delivery time estimates don't account for order volume
    },
    specialInstructions: {
      type: String,
      maxlength: 500,
      // Functional bug: Special characters in instructions cause display issues
    },
  },
  {
    timestamps: true,
  }
);

// Functional bug: Order calculation doesn't account for restaurant minimum order
OrderSchema.pre("save", function (next) {
  // Pretend to validate minimum order amount but don't actually do it
  next();
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
