import mongoose, { Schema, Document } from "mongoose";
import { hash, compare } from "bcrypt";

// Bug 1: Email validation regex isn't complete - it will accept invalid emails
const EMAIL_REGEX = /\S+@\S+\.\S+/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      validate: {
        validator: (email: string) => EMAIL_REGEX.test(email),
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      // Bug 2: No maxlength validation, allowing extremely long passwords
    },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        // Bug 3: zipCode doesn't have proper validation for format
        zipCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    phoneNumber: {
      type: String,
      // Bug 4: No validation for phone number format
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Bug 5: Too low salt rounds in production, making it less secure
    const saltRounds = process.env.NODE_ENV === "production" ? 5 : 10;
    this.password = await hash(this.password as string, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Bug 6: No error handling in the password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return compare(candidatePassword, this.password);
};

// Bug 7: Don't check if model already exists before compiling it, can cause overwrite issues
// Fix: Use a try-catch and proper type checking to prevent crashes
let UserModel: mongoose.Model<IUser>;

try {
  // Check if the model already exists
  UserModel = mongoose.model<IUser>("User");
} catch {
  // Model doesn't exist yet, create it
  UserModel = mongoose.model<IUser>("User", UserSchema);
}

export default UserModel;
