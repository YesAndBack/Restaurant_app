
import { toast } from "@/hooks/use-toast";

// Base URL for API
const API_BASE_URL = "http://localhost:8001/rest";

// Restaurant types
export interface RestaurantImageData {
  id: number;
  url: string;
}

export interface BookingOutData {
  id: number;
  booking_date: string;
}


export interface RestaurantData {
  id: number;
  name: string;
  description: string;
  location: string;
  address: string;
  category: string;
  capacity: number;
  rating: number;
  price_range: string;
  features: string[];
  cuisines: string[];
  contact_phone: string;
  contact_email: string;
  owner_id: number;
  images: RestaurantImageData[];
  reviews: any[]; // We'll update this when you provide the review backend
  average_price: number;
  bookings: BookingOutData[];
}

export interface RestaurantCreateData {
  name: string;
  description: string;
  location: string;
  address: string;
  category: string;
  capacity: number;
  rating: number;
  price_range: string;
  features: string[];
  cuisines: string[];
  contact_phone: string;
  contact_email: string;
  image_urls?: string[];
}

// API Functions
export const api = {
  // Fetch all restaurants
  async getRestaurants(): Promise<RestaurantData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/`);
      
      if (!response.ok) {
        throw new Error(`Error fetching restaurants: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurants. Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Fetch a single restaurant by ID
  async getRestaurantById(id: string | number): Promise<RestaurantData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching restaurant: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch restaurant ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to load restaurant details. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Create a new restaurant (admin only)
  async createRestaurant(data: RestaurantCreateData): Promise<RestaurantData | null> {
    try {
      // Check if we have a token (admin only function)
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Create FormData for the request
      const formData = new FormData();
      
      // Add all regular fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "features" || key === "cuisines") {
          // Join arrays into comma-separated strings
          formData.append(key, (value as string[]).join(","));
        } else if (key !== "image_urls") {
          // Add regular fields
          formData.append(key, String(value));
        }
      });
      
      // Add image URLs as a comma-separated string if they exist
      if (data.image_urls && data.image_urls.length > 0) {
        formData.append("image_urls", data.image_urls.join(","));
      }
      
      const response = await fetch(`${API_BASE_URL}/restaurants/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
      console.error("Failed to create restaurant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create restaurant",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Update a restaurant (admin only)
  async updateRestaurant(id: number, data: Partial<RestaurantCreateData>): Promise<RestaurantData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
  
  // Delete a restaurant (admin only)
  async deleteRestaurant(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete restaurant");
      }
      
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete restaurant ${id}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete restaurant",
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Upload images to a restaurant (admin only)
  async uploadRestaurantImages(restaurantId: number, files: File[]): Promise<RestaurantImageData[]> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/upload-image/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload images");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to upload images for restaurant ${restaurantId}:`, error);
      throw error;
    }
  }
};
