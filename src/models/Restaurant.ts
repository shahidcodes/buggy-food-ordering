import mongoose, { Schema, Document } from "mongoose";

export interface MenuItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  popular: boolean;
  available: boolean;
  allergens?: string[];
}

export interface IRestaurant extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cuisine: string[];
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  minOrderAmount: number;
  menu: MenuItem[];
  openingHours: {
    open: string;
    close: string;
    daysOpen: number[];
  };
  image?: string;
  featured: boolean;
  manuallyClosed: boolean;
}

const RestaurantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a restaurant name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    cuisine: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      // Functional bug: When calculating average rating, it doesn't round properly
    },
    deliveryTime: {
      type: Number,
      required: true,
      // Functional bug: Delivery time calculation doesn't account for peak hours
    },
    deliveryFee: {
      type: Number,
      required: true,
      // Functional bug: Free delivery logic has edge cases that don't work
    },
    minOrderAmount: {
      type: Number,
      required: true,
    },
    menu: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        category: { type: String, required: true },
        popular: { type: Boolean, default: false },
        available: { type: Boolean, default: true },
        allergens: { type: [String] },
        // Functional bug: When items are marked unavailable, they still appear in search and can be added to cart
      },
    ],
    openingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      daysOpen: { type: [Number], required: true }, // 0 = Sunday, 6 = Saturday
      // Functional bug: Restaurant appears as open even when closed for certain hours
    },
    image: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
      // Functional bug: Featured restaurants sometimes don't appear at the top
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
