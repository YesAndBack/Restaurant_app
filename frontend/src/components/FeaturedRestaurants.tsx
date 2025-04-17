
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "./RestaurantCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api, RestaurantData } from "@/services/api";

// Static featured restaurants as fallback
const staticFeaturedRestaurants = [
  {
    id: "1",
    name: "Elevation Grand Hall",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    location: "Downtown, New York",
    category: "Fine Dining",
    capacity: 120,
    rating: 4.8,
    averagePrice: 85,
  },
  {
    id: "2",
    name: "Azure Rooftop Lounge",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
    location: "Marina, San Francisco",
    category: "Rooftop",
    capacity: 80,
    rating: 4.7,
    averagePrice: 95,
  },
  {
    id: "3",
    name: "The Golden Pavilion",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    location: "Beverly Hills, Los Angeles",
    category: "Luxury",
    capacity: 150,
    rating: 4.9,
    averagePrice: 120,
  },
];

const FeaturedRestaurants = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurants = await api.getRestaurants();
        // Take only first 3 restaurants for featured section
        if (restaurants && restaurants.length > 0) {
          setFeaturedRestaurants(restaurants.slice(0, 3));
        } else {
          setFeaturedRestaurants(staticFeaturedRestaurants);
        }
      } catch (error) {
        console.error("Error fetching featured restaurants:", error);
        setFeaturedRestaurants(staticFeaturedRestaurants);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-2xl">
            <h2 className="mb-3">Featured Venues</h2>
            <p className="text-foreground/70 text-lg">
              Explore our selection of premium restaurants for your next event
            </p>
          </div>
          <Link to="/restaurants">
            <Button variant="ghost" className="group">
              View all 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[350px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id.toString()}
                name={restaurant.name}
                image={getRestaurantImage(restaurant)}
                location={restaurant.location}
                category={restaurant.category}
                capacity={restaurant.capacity}
                rating={restaurant.rating}
                averagePrice={restaurant.average_price || restaurant.averagePrice}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Helper function to get the right image URL from a restaurant object
const getRestaurantImage = (restaurant: any): string => {
  // Backend format: check for images array with url property
  if (restaurant.images && restaurant.images.length > 0 && restaurant.images[0].url) {
    return restaurant.images[0].url;
  }
  
  // Static format: direct image property
  if (restaurant.image) {
    return restaurant.image;
  }
  
  // Fallback image if none found
  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
};

export default FeaturedRestaurants;
