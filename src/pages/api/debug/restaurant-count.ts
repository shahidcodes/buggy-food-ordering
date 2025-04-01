import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db";
import Restaurant from "@/models/Restaurant";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("Debug: Checking restaurant count");
    await connectDB();

    const count = await Restaurant.countDocuments();
    console.log(`Debug: Found ${count} restaurants in database`);

    
    let sample = null;
    if (count > 0) {
      sample = await Restaurant.findOne().select("name cuisine rating").lean();
      console.log("Debug: Sample restaurant:", sample);
    }

    return res.status(200).json({
      status: "success",
      message: "Restaurant count checked",
      data: {
        count,
        sample,
      },
    });
  } catch (error) {
    console.error("Debug: Restaurant count error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error checking restaurant count",
      error: String(error),
    });
  }
}
