import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db";
import Restaurant from "@/models/Restaurant";

// Define proper types for the query
interface RestaurantQuery {
  name?: { $regex: unknown; $options: string };
  cuisine?: string | string[];
  featured?: boolean;
}

// Allow specific linter exceptions for this problematic comparison function

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("API: Restaurant endpoint called");
    await connectDB();
    console.log("API: DB connected");

    if (req.method === "GET") {
      // Extract query parameters
      const { cuisine, sort, featured, search } = req.query;
      console.log("API: Query params:", { cuisine, sort, featured, search });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      // Fix Bug 1: Correct the offset calculation
      const skip = (page - 1) * limit;
      console.log("API: Pagination:", { page, limit, skip });

      // Build query
      const query: RestaurantQuery = {};

      // Bug 2: Case-sensitive search that won't find all matches
      if (search) {
        query.name = { $regex: search, $options: "" }; // Missing 'i' option for case-insensitive
      }

      // Bug 3: Doesn't properly handle array of cuisines
      if (cuisine) {
        // Should use $in operator for multiple cuisines but doesn't
        query.cuisine = cuisine;
      }

      // Bug 4: Featured filter doesn't work as expected
      // (converts string 'false' to boolean true)
      if (featured) {
        query.featured = featured === "true";
      }

      console.log("API: Query built:", JSON.stringify(query));

      // Fix Bug 6: Count using the same filters
      const totalCount = await Restaurant.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      console.log("API: Pagination data:", { totalCount, totalPages });

      // Execute query
      let restaurants = await Restaurant.find(query)
        .skip(skip)
        .limit(limit)
        .select("-menu"); // Exclude menu for performance

      console.log("API: Restaurants found:", restaurants.length);

      // Bug 5: Sort isn't applied correctly
      if (sort) {
        const sortField = (sort as string).replace("-", "");
        const sortDirection = (sort as string).startsWith("-") ? -1 : 1;

        // Sort is applied after the query, not during the query
        restaurants = restaurants.sort((a, b) => {
          const aValue = a.get(sortField);
          const bValue = b.get(sortField);
          if (aValue < bValue) return -1 * sortDirection;
          if (aValue > bValue) return 1 * sortDirection;
          return 0;
        });
      }

      // Bug 7: Improving response format for consistency
      return res.status(200).json({
        restaurants,
        totalCount, // Add totalCount directly to the top level
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          // Bug 8: hasMore calculation is incorrect
          hasMore: page < totalPages,
        },
      });
    }

    // Bug 9: Returns 405 but doesn't set Allow header
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error in restaurants API:", error);
    // Bug 10: Doesn't distinguish between different types of errors
    return res.status(500).json({ message: "Server error" });
  }
}
