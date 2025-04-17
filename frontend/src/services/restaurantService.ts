
import { toast } from "@/hooks/use-toast";

// Base URL for API
const API_BASE_URL = "http://localhost:8001";

// Restaurant types
export interface RestaurantData {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  image: string;
  images?: string[] | { id: number, url: string }[];
  opening_hours?: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  owner_id?: number;
  average_price: number;
  created_at?: string;
  updated_at?: string;
  address?: string;
  price_range?: string;
  features?: string[];
  cuisines?: string[];
  rating?: number;
  reviews?: any[];
}

export interface CreateRestaurantData {
  name: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  opening_hours: string;
  contact_phone: string;
  contact_email: string;
  average_price: number;
}

export interface UpdateRestaurantData {
  name?: string;
  description?: string;
  location?: string;
  category?: string;
  capacity?: number;
  // opening_hours?: string;
  contact_phone?: string;
  contact_email?: string;
  average_price?: number;
}


export interface BookingResponce {
  id: number;
  booking_username: string;
  email: string;
  phone_number: string;
  event_type: string;
  number_of_guests: number;
  additional_information: string;
  user_id: number;
  restaurant_id: number;
  booking_date: string;
  status: string;

}

export const restaurantService = {
  // Get restaurant by ID
  async getRestaurantById(id: number): Promise<RestaurantData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/rest/restaurants/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching restaurant: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch restaurant ${id}:`, error);
      return null;
    }
  },
  
  // Get restaurants owned by the current user (admin only)
  async getMyRestaurants(): Promise<RestaurantData[]> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // First try to get restaurants from the REST API
      try {
        const response = await fetch(`${API_BASE_URL}/rest/restaurants/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching restaurants: ${response.statusText}`);
        }
        
        const allRestaurants = await response.json();
        
        // Parse the JWT token to get the user ID
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }
        
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentUserId = payload.sub; // 'sub' is typically where the user ID is stored
        
        // Filter restaurants owned by the current user
        const myRestaurants = allRestaurants.filter((restaurant: any) => 
          restaurant.owner_id === parseInt(currentUserId)
        );
        
        return myRestaurants;
      } catch (error) {
        console.error("Failed to fetch from REST API:", error);
        throw error; // Rethrow to be caught by the outer try-catch
      }
    } catch (error) {
      console.error("Failed to fetch owned restaurants:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your restaurants",
        variant: "destructive",
      });
      return [];
    }
  },
  async getMyBooking(): Promise<BookingResponce[]> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // First try to get restaurants from the REST API
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/restaurant/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching restaurants: ${response.statusText}`);
        }
        
        const allBooking = await response.json();
        
        console.log(allBooking)
        return allBooking;
      } catch (error) {
        console.error("Failed to fetch from REST API:", error);
        throw error; // Rethrow to be caught by the outer try-catch
      }
    } catch (error) {
      console.error("Failed to fetch owned restaurants:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your restaurants",
        variant: "destructive",
      });
      return [];
    }
  },

  
  // Create a new restaurant (admin only)
  async createRestaurant(data: CreateRestaurantData): Promise<RestaurantData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Try to create restaurant using the REST API
      try {
        // Convert data to FormData for the REST API
        const formData = new FormData();
        
        // Add all fields to FormData
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("location", data.location);
        formData.append("address", data.location); // Use location as address for now
        formData.append("category", data.category);
        formData.append("capacity", data.capacity.toString());
        formData.append("rating", "0"); // Default rating
        formData.append("price_range", data.average_price.toString());
        formData.append("contact_phone", data.contact_phone);
        formData.append("contact_email", data.contact_email);
        formData.append("opening_hours", data.opening_hours);
        
        const response = await fetch(`${API_BASE_URL}/rest/restaurants/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to create restaurant");
        }
        
        const result = await response.json();
        toast({
          title: "Success",
          description: "Restaurant created successfully",
        });
        return result;
      } catch (error) {
        console.error("Failed to create restaurant with REST API:", error);
        throw error; // Rethrow to be caught by the outer try-catch
      }
    } catch (error) {
      console.error("Failed to create restaurant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create restaurant",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Update restaurant details (admin only)
  async updateRestaurant(id: number, data: UpdateRestaurantData): Promise<RestaurantData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/rest/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update restaurant");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Restaurant updated successfully",
      });
      return result;
    } catch (error) {
      console.error(`Failed to update restaurant ${id}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update restaurant",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Upload images for a restaurant (admin only)
  async uploadImages(restaurantId: number, files: File[]): Promise<string[]> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`image${index}`, file);
      });
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/images`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload images");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: `Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`,
      });
      return result.image_urls;
    } catch (error) {
      console.error(`Failed to upload images for restaurant ${restaurantId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Delete an image from a restaurant (admin only)
  async deleteImage(restaurantId: number, imageUrl: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/images`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_url: imageUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete image");
      }
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete image from restaurant ${restaurantId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive",
      });
      return false;
    }
  }
};
