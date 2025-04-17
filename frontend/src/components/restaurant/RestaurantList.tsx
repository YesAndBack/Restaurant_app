
import React from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Restaurant {
  id: string;
  name: string;
  image?: string;
  images?: Array<{id: number, url: string}>;
  location: string;
  category: string;
  capacity: number;
  rating: number;
  averagePrice?: number;
  average_price?: number;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
  loading: boolean;
  restaurantAvailability: Record<string, boolean>;
  selectedDate?: Date;
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  loading,
  restaurantAvailability,
  selectedDate,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-[350px] bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <h3 className="text-lg font-medium mb-2">No venues found</h3>
        <p className="text-foreground/70">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  // Helper function to get the restaurant image
  const getRestaurantImage = (restaurant: Restaurant): string => {
    // Backend format with images array
    if (restaurant.images && restaurant.images.length > 0) {
      return restaurant.images[0].url;
    }
    
    // Direct image property
    if (restaurant.image) {
      return restaurant.image;
    }
    
    // Fallback
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
  };

  // Helper to get the price (handle both formats)
  const getAveragePrice = (restaurant: Restaurant): number | undefined => {
    return restaurant.averagePrice || restaurant.average_price;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="relative">
          {selectedDate && restaurantAvailability[restaurant.id] === false && (
            <Badge className="absolute top-2 right-2 z-10 bg-red-500">Fully Booked</Badge>
          )}
          {selectedDate && restaurantAvailability[restaurant.id] === true && (
            <Badge className="absolute top-2 right-2 z-10 bg-green-500">Available</Badge>
          )}
          <RestaurantCard
            id={restaurant.id}
            name={restaurant.name}
            image={getRestaurantImage(restaurant)}
            location={restaurant.location}
            category={restaurant.category}
            capacity={restaurant.capacity}
            rating={restaurant.rating}
            averagePrice={getAveragePrice(restaurant)}
          />
        </div>
      ))}
    </div>
  );
};

export default RestaurantList;
