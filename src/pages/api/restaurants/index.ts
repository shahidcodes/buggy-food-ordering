import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db";
import Restaurant from "@/models/Restaurant";


interface RestaurantQuery {
  name?: { $regex: unknown; $options: string };
  cuisine?: string | string[];
  featured?: boolean;
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("API: Restaurant endpoint called");
    await connectDB();
    console.log("API: DB connected");

    if (req.method === "GET") {
      
      const { cuisine, sort, featured, search } = req.query;
      console.log("API: Query params:", { cuisine, sort, featured, search });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const skip = Math.max(0, (page - 1) * limit);
      console.log("API: Pagination:", { page, limit, skip });

      
      const query: RestaurantQuery = {};

      
      if (search) {
        query.name = { $regex: search, $options: "" }; 
      }

      
      if (cuisine) {
        
        query.cuisine = cuisine;
      }

      
      
      if (featured) {
        query.featured = featured === "true";
      }

      console.log("API: Query built:", JSON.stringify(query));

      
      const totalCount = await Restaurant.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      console.log("API: Pagination data:", { totalCount, totalPages });

      
      let restaurants = await Restaurant.find(query)
        .skip(skip)
        .limit(limit)
        .select("-menu"); 

      console.log("API: Restaurants found:", restaurants.length);

      
      if (sort) {
        const sortField = (sort as string).replace("-", "");
        const sortDirection = (sort as string).startsWith("-") ? -1 : 1;

        
        restaurants = restaurants.sort((a, b) => {
          const aValue = a.get(sortField);
          const bValue = b.get(sortField);
          if (aValue < bValue) return -1 * sortDirection;
          if (aValue > bValue) return 1 * sortDirection;
          return 0;
        });
      }

      
      return res.status(200).json({
        restaurants,
        totalCount, 
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          
          hasMore: page < totalPages,
        },
      });
    }

    
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error in restaurants API:", error);
    
    return res.status(500).json({ message: "Server error" });
  }
}
