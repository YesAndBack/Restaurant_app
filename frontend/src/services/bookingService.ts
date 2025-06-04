
import { toast } from "@/hooks/use-toast";

// Base URL for API
const API_BASE_URL = "http://localhost:8001";

// Booking types
export interface BookingData {
  id: number;
  restaurant_id: number;
  user_id: number;
  booking_date: string;
  booking_time: string;
  guest_count: number;
  special_requests?: string;
  event_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: "pending" | "confirmed" | "rejected";
  created_at?: string;
}

export interface CreateBookingData {
  restaurant_id: number;
  booking_date: string;
  booking_time?: string;
  number_of_guests: number;
  special_requests?: string;
  event_type: string;
  booking_username: string;
  email: string;
  phone_number: string;
  status?: "pending" | "confirmed" | "rejected";
}

export interface BookingFilters {
  search: string;
  status?: "pending" | "confirmed" | "rejected";
  from_date?: string;
  to_date?: string;
}

export const bookingService = {
  // Create a new booking
  async createBooking(data: CreateBookingData): Promise<BookingData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/bookings/`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create booking");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Your booking request has been submitted successfully",
      });
      return result;
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit booking",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Get all bookings for a restaurant (admin only)
  async getBookingsForRestaurant(restaurantId: number, filters?: BookingFilters): Promise<BookingData[]> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = `${API_BASE_URL}/bookings/restaurant/${restaurantId}`;
      
      // Add query parameters for filtering
      if (filters) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching bookings: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch bookings for restaurant ${restaurantId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load bookings",
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Confirm a booking (admin only)
  async confirmBooking(bookingId: number): Promise<BookingData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to confirm booking");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Booking confirmed successfully",
      });
      return result;
    } catch (error) {
      console.error(`Failed to confirm booking ${bookingId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm booking",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Reject a booking (admin only)
  async rejectBooking(bookingId: number): Promise<BookingData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reject booking");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Booking rejected successfully",
      });
      return result;
    } catch (error) {
      console.error(`Failed to reject booking ${bookingId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject booking",
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Get reserved restaurants for a specific date
  async getReservedRestaurants(date: string): Promise<number[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/reserved/${date}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching reserved restaurants: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch reserved restaurants for date ${date}:`, error);
      return [];
    }
  },

  // Set available booking dates for a restaurant (admin only)
  async setAvailableDates(restaurantId: number, dates: string[]): Promise<boolean> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/available-dates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dates })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to set available dates");
      }
      
      toast({
        title: "Success",
        description: "Available booking dates updated successfully",
      });
      return true;
    } catch (error) {
      console.error(`Failed to set available dates for restaurant ${restaurantId}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update available dates",
        variant: "destructive",
      });
      return false;
    }
  }
};
