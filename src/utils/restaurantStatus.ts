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
  
  if (restaurant.manuallyClosed) {
    return false;
  }

  
  if (!restaurant.hours && !restaurant.openingHours) {
    return false;
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60; 

  
  if (restaurant.openingHours) {
    const { open, close, daysOpen } = restaurant.openingHours;

    
    if (
      !daysOpen ||
      !Array.isArray(daysOpen) ||
      !daysOpen.includes(dayOfWeek)
    ) {
      return false;
    }

    
    const openHour = parseInt(open.split(":")[0]);
    const closeHour = parseInt(close.split(":")[0]);

    
    if (restaurant.isNightRestaurant || openHour > closeHour) {
      
      return currentTime >= openHour || currentTime <= closeHour;
    }

    
    return currentTime >= openHour && currentTime <= closeHour;
  }

  
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

    
    if (openTime > closeTime) {
      return currentTimeValue >= openTime || currentTimeValue <= closeTime;
    }

    return currentTimeValue >= openTime && currentTimeValue <= closeTime;
  }

  return false;
};
