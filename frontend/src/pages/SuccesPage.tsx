import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantCreated, setRestaurantCreated] = useState(false);
  const requestSent = useRef(false);

  useEffect(() => {
    const createRestaurant = async () => {
      // Check if request was already sent to prevent duplicate submissions
      if (requestSent.current) {
        return;
      }
      
      requestSent.current = true;
      
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
      const restaurantData = {
        session_id: sessionId,
        name: params.get("name"),
        description: params.get("description"),
        location: params.get("location"),
        category: params.get("category"),
        capacity: parseInt(params.get("capacity") || "0"),
        opening_hours: params.get("opening_hours"),
        contact_phone: params.get("contact_phone"),
        contact_email: params.get("contact_email"),
        average_price: parseInt(params.get("average_price") || "0"),
        image_urls: params.get("image_urls") || "",
        user_id: parseInt(params.get("user_id") || "0"),
      };

      try {
        const response = await fetch("http://localhost:8001/rest/restaurants/create-after-payment/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restaurantData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail);

        setRestaurantCreated(true);
        toast({
          title: "Success",
          description: "Restaurant created successfully!",
        });

        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create restaurant");
        toast({
          title: "Error",
          description: "Failed to create restaurant after payment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createRestaurant();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        {loading ? (
          <p className="text-gray-700">Creating restaurant...</p>
        ) : restaurantCreated ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Restaurant Created!</h2>
            <p className="text-gray-700">Payment successful. Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p className="text-gray-700">{error}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;