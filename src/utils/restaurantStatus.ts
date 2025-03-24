interface RestaurantHours {
  open: string;
  close: string;
  daysOpen: number[];
}

interface Restaurant {
  manuallyClosed?: boolean;
  hours?: Record<string, { open: string; close: string }>;
  openingHours?: RestaurantHours;
  isNightRestaurant?: boolean;
}

/**
 * Checks if a restaurant is currently open based on its hours and closed status
 * @param restaurant The restaurant object containing hours and status information
 * @returns boolean indicating if the restaurant is currently open
 */
export const isRestaurantOpen = (restaurant: Restaurant): boolean => {
  // If restaurant is manually closed, it's not open
  if (restaurant.manuallyClosed) {
    return false;
  }

  // Check if hours data exists in either format
  if (!restaurant.hours && !restaurant.openingHours) {
    return false;
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0-6, Sunday to Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60; // e.g., 14.5 for 2:30 PM

  // Handle hours data format from the DB (openingHours object)
  if (restaurant.openingHours) {
    const { open, close, daysOpen } = restaurant.openingHours;

    // Check if restaurant is open today
    if (
      !daysOpen ||
      !Array.isArray(daysOpen) ||
      !daysOpen.includes(dayOfWeek)
    ) {
      return false;
    }

    // Parse hours (format: "09:00")
    const openHour = parseInt(open.split(":")[0]);
    const closeHour = parseInt(close.split(":")[0]);

    // Handle night restaurants (e.g., open at 20:00, close at 04:00)
    if (restaurant.isNightRestaurant || openHour > closeHour) {
      // If current time is after opening or before closing on the next day
      return currentTime >= openHour || currentTime <= closeHour;
    }

    // Regular hours (e.g., open at 09:00, close at 21:00)
    return currentTime >= openHour && currentTime <= closeHour;
  }

  // Handle legacy hours format (hours object with day names)
  if (restaurant.hours) {
    const dayName = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const currentHours = restaurant.hours[dayName];
    if (!currentHours) {
      return false;
    }

    const currentTimeValue = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(currentHours.open.replace(":", ""));
    const closeTime = parseInt(currentHours.close.replace(":", ""));

    // Handle night restaurants (e.g., open at 2000, close at 400)
    if (openTime > closeTime) {
      return currentTimeValue >= openTime || currentTimeValue <= closeTime;
    }

    return currentTimeValue >= openTime && currentTimeValue <= closeTime;
  }

  return false;
};
