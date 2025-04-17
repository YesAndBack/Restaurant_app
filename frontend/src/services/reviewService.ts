
import { toast } from "@/hooks/use-toast";

// Base URL for API
const API_BASE_URL = "http://localhost:8001";

// Review types
export interface ReviewData {
  id: number;
  username: string;
  rating: number;
  comment: string;
  restaurant_id: number;
  created_at?: string;
}

export interface CreateReviewData {
  author: string;
  comment: string;
  rating: number;
}

export interface ReplyToReviewData {
  reply: string;
}

export const reviewService = {
  // Get reviews for a restaurant
  async getReviewsForRestaurant(restaurantId: number): Promise<ReviewData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/restaurants/${restaurantId}/reviews/`);
      
      if (!response.ok) {
        throw new Error(`Error fetching reviews: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch reviews for restaurant ${restaurantId}:`, error);
      return [];
    }
  },
  
  // Create a new review
  async createReview(restaurantId: string, data: CreateReviewData): Promise<ReviewData | null> {
    try {
      // Build the URL with query parameters instead of using FormData
      const url = new URL(`${API_BASE_URL}/reviews/restaurants/${restaurantId}/reviews/`);
      url.searchParams.append("username", data.author);
      url.searchParams.append("rating", data.rating.toString());
      url.searchParams.append("comment", data.comment);
      
      const response = await fetch(url.toString(), {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail && typeof errorData.detail === 'object' 
            ? JSON.stringify(errorData.detail) 
            : errorData.detail || "Failed to create review"
        );
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Your review has been submitted successfully",
      });
      return result;
    } catch (error) {
      console.error("Failed to create review:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
      return null;
    }
  },

  // Reply to a review (Admin/Owner only)
  async replyToReview(reviewId: number, data: ReplyToReviewData): Promise<ReviewData | null> {
    try {
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reply to review");
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: "Your reply has been submitted",
      });
      return result;
    } catch (error) {
      console.error("Failed to reply to review:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit reply",
        variant: "destructive",
      });
      return null;
    }
  }
};
