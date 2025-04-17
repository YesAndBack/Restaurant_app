import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import ImageUploader from "@/components/restaurant/ImageUploader";
import { CreateRestaurantData } from "@/services/restaurantService";

const RestaurantAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateRestaurantData>({
    name: "",
    description: "",
    location: "",
    category: "",
    capacity: 0,
    opening_hours: "",
    contact_phone: "",
    contact_email: "",
    average_price: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let parsedValue: any = value;
    if (name === "capacity" || name === "average_price") {
      parsedValue = value ? parseInt(value) : 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Проверяем обязательные поля
      const requiredFields = [
        "name",
        "description",
        "location",
        "category",
        "capacity",
        "contact_phone",
        "contact_email",
        "average_price",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof CreateRestaurantData]
      );

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please provide: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Добавляем image_urls в formData
      const dataToSend = {
        ...formData,
        image_urls: uploadedImages.join(","),
      };

      // Convert all values in dataToSend to strings
      const stringifiedData = Object.fromEntries(
        Object.entries(dataToSend).map(([key, value]) => [key, String(value)])
      );
      const token = localStorage.getItem("booking_access_token");

      // Отправляем данные на бэкенд для создания сессии оплаты
      const response = await fetch("http://localhost:8001/rest/restaurants/create-checkout-session/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(stringifiedData).toString(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      // Перенаправляем на страницу оплаты Stripe
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (newImages: string[]) => {
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6">Add New Restaurant</h1>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="average_price">Average Price Per Person ($) *</Label>
                  <Input
                    id="average_price"
                    name="average_price"
                    type="number"
                    value={formData.average_price || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Upload Restaurant Images</h3>
              <ImageUploader
                restaurantId={0} // Temporary ID for new restaurant
                onImagesUploaded={handleImageUploaded}
              />

              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-video bg-secondary rounded-md overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Restaurant preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin-dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Create Restaurant"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantAdd;