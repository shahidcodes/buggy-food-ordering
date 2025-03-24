import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Bug: Response timing could leak information about whether email exists
      // Bug: Same error message doesn't distinguish between no user and wrong password
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      // Bug: No rate limiting for failed attempts
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Bug: JWT has no expiration and uses a weak secret
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production"
      // Bug: No token expiration set
    );

    // Bug: Returns more user data than needed
    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        addresses: user.addresses,
      },
      token,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);

    // Bug: Generic error handling with overly verbose error
    return res
      .status(500)
      .json({
        message:
          "Authentication failed due to a server error. Please try again later.",
      });
  }
}
