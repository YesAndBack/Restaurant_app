import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBookingDayInfo } from "@/data/bookings";
import { BookingDay } from "@/types/booking";
import { api } from "@/services/api";
import { format } from "date-fns";


import PageHeader from "@/components/restaurant/PageHeader";
import SearchBar from "@/components/restaurant/SearchBar";
import FilterPanel from "@/components/restaurant/FilterPanel";
import RestaurantList from "@/components/restaurant/RestaurantList";

const allStaticRestaurants = [
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
  {
    id: "4",
    name: "Sapphire Garden",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    location: "Midtown, Chicago",
    category: "Modern",
    capacity: 100,
    rating: 4.6,
    averagePrice: 75,
  },
  {
    id: "5",
    name: "The Velvet Room",
    image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070&auto=format&fit=crop",
    location: "French Quarter, New Orleans",
    category: "Classic",
    capacity: 90,
    rating: 4.5,
    averagePrice: 65,
  },
  {
    id: "6",
    name: "Ocean Terrace",
    image: "https://images.unsplash.com/photo-1537639622086-67761bed4118?q=80&w=1955&auto=format&fit=crop",
    location: "South Beach, Miami",
    category: "Seafood",
    capacity: 110,
    rating: 4.7,
    averagePrice: 90,
  },
];

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [capacity, setCapacity] = useState([50]);
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [hideBooked, setHideBooked] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [restaurantAvailability, setRestaurantAvailability] = useState<Record<string, boolean>>({});
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeRestaurantData = (restaurant: any) => {
    if (restaurant.images) {
      return {
        id: restaurant.id.toString(),
        name: restaurant.name,
        images: restaurant.images,
        location: restaurant.location,
        category: restaurant.category || "Venue",
        capacity: restaurant.capacity || 50,
        rating: restaurant.rating,
        price_range: restaurant.price_range || 75,
        bookings: restaurant.bookings || [],
      };
    }
    
    return restaurant;
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurants = await api.getRestaurants();
        
        if (restaurants && restaurants.length > 0) {
          const normalizedRestaurants = restaurants.map(normalizeRestaurantData);
          setAllRestaurants(normalizedRestaurants);
        } else {
          setAllRestaurants(allStaticRestaurants);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setAllRestaurants(allStaticRestaurants);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const availability: Record<string, boolean> = {};
      
      allRestaurants.forEach(restaurant => {
        const bookingInfo = getBookingDayInfo(restaurant.id, selectedDate, restaurant.capacity);
        availability[restaurant.id] = !bookingInfo.isFullyBooked;
      });
      
      setRestaurantAvailability(availability);
    } else {
      setRestaurantAvailability({});
    }
  }, [selectedDate, allRestaurants]);

const filteredRestaurants = allRestaurants.filter((restaurant) => {
  const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = category === "all" || restaurant.category === category;
  const matchesLocation = location === "all" || restaurant.location.includes(location);
  const matchesCapacity = restaurant.capacity >= capacity[0];
  
  let formattedDate = "";
  if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
    formattedDate = format(selectedDate, 'yyyy-MM-dd');
  }
  
  // Check if restaurant does NOT have a booking on the selected date
  let hasNoBookingOnDate = true;
  if (selectedDate && restaurant.bookings && Array.isArray(restaurant.bookings)) {
    const hasBooking = restaurant.bookings.some(booking => booking.booking_date === formattedDate);
    hasNoBookingOnDate = !hasBooking;
  }
  
  // Check if restaurant is available (not fully booked) on the selected date
  const isAvailableOnDate = !selectedDate || 
    (!hideBooked || (restaurantAvailability[restaurant.id] !== false));
  
  return matchesSearch && 
         matchesCategory && 
         matchesLocation && 
         matchesCapacity && 
         hasNoBookingOnDate && 
         isAvailableOnDate;
});

  const getBookingInfoForRestaurants = () => {
    const bookingInfo: BookingDay[] = [];
    
    if (selectedDate) {
      allRestaurants.forEach(restaurant => {
        const dayInfo = getBookingDayInfo(restaurant.id, selectedDate, restaurant.capacity);
        bookingInfo.push(dayInfo);
      });
    }
    
    return bookingInfo;
  };

  function toggleFilter() {
    setIsFilterOpen(!isFilterOpen);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container px-4 mx-auto py-8">
          <PageHeader />

          <div className="max-w-4xl mx-auto mb-12">
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              toggleFilter={toggleFilter}
            />

            {isFilterOpen && (
              <FilterPanel
                location={location}
                setLocation={setLocation}
                category={category}
                setCategory={setCategory}
                capacity={capacity}
                setCapacity={setCapacity}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                hideBooked={hideBooked}
                setHideBooked={setHideBooked}
                bookingInfo={getBookingInfoForRestaurants()}
              />
            )}
          </div>

          <RestaurantList 
            restaurants={filteredRestaurants}
            loading={loading}
            restaurantAvailability={restaurantAvailability}
            selectedDate={selectedDate}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Restaurants;