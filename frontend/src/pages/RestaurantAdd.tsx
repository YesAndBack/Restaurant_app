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
import { X, Plus } from "lucide-react";

const RestaurantAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [cuisines, setCuisines] = useState<string[]>([""]);
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
    features: [],
    cuisines: [],
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

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
    
    setFormData((prev) => ({
      ...prev,
      features: updatedFeatures.filter(feature => feature.trim() !== ""),
    }));
  };

  const handleCuisineChange = (index: number, value: string) => {
    const updatedCuisines = [...cuisines];
    updatedCuisines[index] = value;
    setCuisines(updatedCuisines);
    
    setFormData((prev) => ({
      ...prev,
      cuisines: updatedCuisines.filter(cuisine => cuisine.trim() !== ""),
    }));
  };

  const addFeatureField = () => {
    setFeatures([...features, ""]);
  };

  const removeFeatureField = (index: number) => {
    if (features.length > 1) {
      const updatedFeatures = features.filter((_, i) => i !== index);
      setFeatures(updatedFeatures);
      
      setFormData((prev) => ({
        ...prev,
        features: updatedFeatures.filter(feature => feature.trim() !== ""),
      }));
    }
  };

  const addCuisineField = () => {
    setCuisines([...cuisines, ""]);
  };

  const removeCuisineField = (index: number) => {
    if (cuisines.length > 1) {
      const updatedCuisines = cuisines.filter((_, i) => i !== index);
      setCuisines(updatedCuisines);
      
      setFormData((prev) => ({
        ...prev,
        cuisines: updatedCuisines.filter(cuisine => cuisine.trim() !== ""),
      }));
    }
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
        "features",
        "cuisines",
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

      // Фильтруем пустые значения из массивов features и cuisines
      const filteredFeatures = features.filter(feature => feature.trim() !== "");
      const filteredCuisines = cuisines.filter(cuisine => cuisine.trim() !== "");
      
      // Проверяем, что есть хотя бы одна фича и одна кухня
      if (filteredFeatures.length === 0) {
        toast({
          title: "Missing Features",
          description: "Please add at least one feature",
          variant: "destructive",
        });
        return;
      }
      
      if (filteredCuisines.length === 0) {
        toast({
          title: "Missing Cuisines",
          description: "Please add at least one cuisine type",
          variant: "destructive",
        });
        return;
      }

      // Добавляем image_urls, features и cuisines в formData
      const dataToSend = {
        ...formData,
        image_urls: uploadedImages.join(","),
        features: filteredFeatures,
        cuisines: filteredCuisines,
      };

      const token = localStorage.getItem("booking_access_token");
      
      // Create URLSearchParams object
      const formDataParams = new URLSearchParams();
      
      // Add basic fields
      Object.entries(dataToSend).forEach(([key, value]) => {
        if (key !== "features" && key !== "cuisines") {
          formDataParams.append(key, String(value));
        }
      });
      
      // Add features and cuisines as JSON strings
      formDataParams.append("features", JSON.stringify(filteredFeatures));
      formDataParams.append("cuisines", JSON.stringify(filteredCuisines));

      console.log("Sending data:", Object.fromEntries(formDataParams.entries()));

      // Отправляем данные на бэкенд для создания сессии оплаты
      const response = await fetch("http://localhost:8001/rest/restaurants/create-checkout-session/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataParams.toString(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      // Store features and cuisines in localStorage before redirecting
      localStorage.setItem("restaurant_features", JSON.stringify(filteredFeatures));
      localStorage.setItem("restaurant_cuisines", JSON.stringify(filteredCuisines));
      localStorage.setItem("restaurant_form_data", JSON.stringify({
        name: formData.name,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        capacity: formData.capacity,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        average_price: formData.average_price,
        image_urls: uploadedImages.join(","),
        opening_hours: formData.opening_hours || "",
      }));
      
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

  // Обновленный обработчик для получения URL изображений
  const handleImageUploaded = (newImageUrls: string[]) => {
    setUploadedImages((prev) => [...prev, ...newImageUrls]);
  };

  // Функция для удаления изображения из списка
  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
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
            
            {/* Dynamic Features Section */}
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Restaurant Features *</h3>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={`feature-${index}`} className="flex items-center gap-2">
                    <Input
                      placeholder={`Feature ${index + 1} (e.g., Outdoor Seating, Live Music)`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeatureField(index)}
                      disabled={features.length === 1}
                      className="h-10 w-10 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeatureField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </div>
            </div>
            
            {/* Dynamic Cuisines Section */}
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Cuisine Types *</h3>
              <div className="space-y-3">
                {cuisines.map((cuisine, index) => (
                  <div key={`cuisine-${index}`} className="flex items-center gap-2">
                    <Input
                      placeholder={`Cuisine ${index + 1} (e.g., Italian, Mexican)`}
                      value={cuisine}
                      onChange={(e) => handleCuisineChange(index, e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCuisineField(index)}
                      disabled={cuisines.length === 1}
                      className="h-10 w-10 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCuisineField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Cuisine
                </Button>
              </div>
            </div>

            {/* Секция загрузки изображений */}
            <div className="p-6 bg-secondary rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Upload Restaurant Images</h3>
              <ImageUploader
                mode="temporary" // Используем временный режим
                onImagesUploaded={handleImageUploaded}
              />
              
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Uploaded Images ({uploadedImages.length}):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-video bg-secondary rounded-md overflow-hidden group">
                        <img
                          src={imageUrl}
                          alt={`Restaurant preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
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