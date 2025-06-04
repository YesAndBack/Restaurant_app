
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Utensils,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ImagePlus,
  Upload,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, parse, parseISO } from "date-fns";
import { getBookingsForDateRange } from "@/data/bookings";
import BookingDatePicker from "@/components/BookingDatePicker";
import { api, RestaurantData } from "@/services/api";
import ImageUploader from "@/components/restaurant/ImageUploader";
import { bookingService, BookingData } from "@/services/bookingService";
import { reviewService } from "@/services/reviewService";
import BookingListComponent from "@/components/BookingListComponent";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapComponentsProvider,
  YMapDefaultMarker
} from "ymap3-components";
import { YMapLocation } from "@yandex/ymaps3-types/imperative/YMap";

const fallbackRestaurants = [
  {
    id: 1,
    name: "Elevation Grand Hall",
    description: "An elegant venue with panoramic city views, perfect for corporate galas and exclusive celebrations. The sophisticated atmosphere and impeccable service create unforgettable experiences.",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" },
      { id: 2, url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop" },
      { id: 3, url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop" },
      { id: 4, url: "https://images.unsplash.com/photo-1537639622086-67761bed4118?q=80&w=1955&auto=format&fit=crop" },
    ],
    location: "Downtown, New York",
    address: "123 Prestige Avenue, New York, NY 10001",
    category: "Fine Dining",
    capacity: 120,
    rating: 4.8,
    price_range: "$$$",
    average_price: 85,
    features: ["Private Rooms", "Outdoor Seating", "Wheelchair Accessible", "Valet Parking", "AV Equipment"],
    cuisines: ["Contemporary American", "French Fusion"],
    contact_phone: "+1 (212) 555-7890",
    contact_email: "events@elevationgrand.com",
    reviews: [
      {
        id: 1,
        username: "Emily Johnson",
        rating: 5,
        comment: "The venue is absolutely stunning. Our company anniversary was a huge success thanks to the amazing staff and beautiful setting.",
      },
      {
        id: 2,
        username: "Michael Chang",
        rating: 5,
        comment: "Perfect venue for our fundraising gala. The views of the city are breathtaking, especially at sunset.",
      },
      {
        id: 3,
        username: "Sarah Williams",
        rating: 4,
        comment: "Excellent service and beautiful space. The only drawback was limited parking for our guests.",
      }
    ],
    owner_id: 1
  },
  // ... other fallback restaurants
];

const formSchema = z.object({
  booking_username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number." }),
  event_type: z.string().min(1, { message: "Please select an event type." }),
  date: z.date(),
  // time: z.string().min(1, { message: "Please select a time." }),
  time: z.string(),
  guests: z.string().min(1, { message: "Please specify number of guests." }),
  message: z.string().optional(),
});

const RestaurantDetail = () => {
  const location: YMapLocation = { center: [71.432921, 51.128641], zoom: 17 };
  const { id } = useParams();
  const [restaurant, setRestaurant ]= useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  
  const [guestCount, setGuestCount] = useState("50");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [bookingInfo, setBookingInfo] = useState([]);
  const [bookingStatus, setBookingStatus] = useState<"available" | "limited" | "unavailable" | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem("booking_access_token");
      const role = localStorage.getItem("role");
      
      if (token && role === "admin") {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);
  
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setLoading(true);
      
      try {
        if (id) {
          const restaurantData = await api.getRestaurantById(id);
          
          if (restaurantData) {
            // Also fetch the reviews for this restaurant
            try {
              const reviews = await reviewService.getReviewsForRestaurant(Number(id));
              if (reviews && restaurantData) {
                restaurantData.reviews = reviews;
              }
            } catch (reviewError) {
              console.error("Error fetching reviews:", reviewError);
            }
            
            setRestaurant(restaurantData);
          } else {
            const localRestaurant = fallbackRestaurants.find(
              (r) => r.id === parseInt(id)
            );
            setRestaurant(localRestaurant as any);
            
            if (!localRestaurant) {
              toast({
                title: "Restaurant Not Found",
                description: "The requested restaurant could not be found.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        
        const localRestaurant = fallbackRestaurants.find(
          (r) => r.id === parseInt(id || "0")
        );
        setRestaurant(localRestaurant as any);
        
        toast({
          title: "Error",
          description: "Failed to load restaurant details. Using local data instead.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, toast]);

  // Fetch bookings for admin
  useEffect(() => {
    const fetchBookings = async () => {
      if (isAdmin && id) {
        try {
          const bookingsData = await bookingService.getBookingsForRestaurant(Number(id));
          setBookings(bookingsData);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      }
    };

    fetchBookings();
  }, [isAdmin, id]);

  useEffect(() => {
    if (restaurant) {
      const startDate = new Date();
      const endDate = addDays(startDate, 10);
      const bookings = getBookingsForDateRange(
        String(restaurant.id), 
        startDate, 
        endDate,
        restaurant.capacity
      );
      setBookingInfo(bookings);
    }
  }, [restaurant]);
  
  // error: TODO
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      booking_username: "",
      email: "",
      phone_number: "",
      event_type: "",
      time: "",
      guests: "50",
      message: "",
    },
  });

  useEffect(() => {
    const date = form.getValues("date");
    const guests = parseInt(form.getValues("guests") || "0");
    
    if (date && restaurant) {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayInfo = bookingInfo.find(day => day.date === dateStr);
      
      if (dayInfo) {
        if (dayInfo.isFullyBooked) {
          setBookingStatus("unavailable");
        } else if (dayInfo.availableCapacity < guests) {
          setBookingStatus("limited");
        } else {
          setBookingStatus("available");
        }
      } else {
        setBookingStatus("available");
      }
    } else {
      setBookingStatus(null);
    }
  }, [form.watch("date"), form.watch("guests"), bookingInfo, restaurant]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (bookingStatus === "unavailable") {
      toast({
        title: "Booking Failed",
        description: "This date is fully booked. Please select another date.",
        variant: "destructive",
      });
      return;
    }
    
    if (bookingStatus === "limited") {
      toast({
        title: "Booking Failed",
        description: `This date can only accommodate ${bookingInfo.find(
          day => day.date === format(values.date, "yyyy-MM-dd")
        )?.availableCapacity || 0} more guests. Please adjust your guest count or select another date.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!id) {
      toast({
        title: "Booking Failed",
        description: "Restaurant ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // error: TODO
      const bookingData = {
        restaurant_id: Number(id),
        booking_date: format(values.date, "yyyy-MM-dd"),
        // booking_time: values.time,
        number_of_guests: parseInt(values.guests),
        // special_requests: values.message || "",
        event_type: values.event_type,
        booking_username: values.booking_username,
        email: values.email,
        phone_number: values.phone_number,
        additional_information: values.message 
        // status: "pending" as "pending" | "confirmed" | "rejected"
      };

      const response = await bookingService.createBooking(bookingData);
      
      if (response) {
        toast({
          title: "Booking Request Submitted",
          description: "We'll contact you within 24 hours to confirm your reservation.",
        });
        form.reset();
        
        // Refresh bookings list for admins
        if (isAdmin) {
          const bookingsData = await bookingService.getBookingsForRestaurant(Number(id));
          setBookings(bookingsData);
        }
      } else {
        toast({
          title: "Booking Failed",
          description: "There was an error submitting your booking. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleImagesUploaded = async (uploadedImages: any[]) => {
    try {
      if (id) {
        const restaurantData = await api.getRestaurantById(id);
        if (restaurantData) {
          setRestaurant(restaurantData);
          toast({
            title: "Success",
            description: "Images uploaded successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing restaurant data:", error);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await bookingService.confirmBooking(bookingId);
      // Refresh bookings list
      if (id) {
        const bookingsData = await bookingService.getBookingsForRestaurant(Number(id));
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await bookingService.rejectBooking(bookingId);
      // Refresh bookings list
      if (id) {
        const bookingsData = await bookingService.getBookingsForRestaurant(Number(id));
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  const renderBookingStatus = () => {
    if (!bookingStatus) return null;
    
    switch (bookingStatus) {
      case "available":
        return (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              This date is available for booking with your party size.
            </AlertDescription>
          </Alert>
        );
      case "limited":
        const guests = parseInt(form.getValues("guests") || "0");
        const date = form.getValues("date");
        const dateStr = date ? format(date, "yyyy-MM-dd") : "";
        const availableCapacity = bookingInfo.find(day => day.date === dateStr)?.availableCapacity || 0;
        
        return (
          <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              Limited availability for this date. Maximum remaining capacity is {availableCapacity} guests, 
              but you've requested {guests} guests.
            </AlertDescription>
          </Alert>
        );
      case "unavailable":
        return (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              This date is fully booked. Please select another date.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Refresh restaurant data to include the new review
    if (id) {
      // First get the restaurant details
      api.getRestaurantById(id).then(data => {
        if (data) {
          // Then get the updated reviews
          reviewService.getReviewsForRestaurant(Number(id)).then(reviews => {
            if (reviews && data) {
              data.reviews = reviews;
              setRestaurant(data);
            }
          });
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
            <p className="mb-8">The restaurant you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/restaurants">Browse All Restaurants</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container px-4 mx-auto py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild className="group">
              <Link to="/restaurants">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Restaurants
              </Link>
            </Button>
          </div>

          {/* Restaurant Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Badge className="mr-2">{restaurant?.category}</Badge>
                <div className="flex items-center text-sm font-medium">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {restaurant?.rating?.toFixed(1) || "0.0"}
                </div>
              </div>
              <h1 className="mb-2">{restaurant?.name}</h1>
              <div className="flex items-center text-foreground/70 mb-4">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{restaurant?.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center text-sm bg-secondary px-3 py-1 rounded-full">
                  <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>Up to {restaurant?.capacity} guests</span>
                </div>
                {restaurant?.cuisines?.length > 0 && (
                  <div className="flex items-center text-sm bg-secondary px-3 py-1 rounded-full">
                    <Utensils className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>{restaurant?.cuisines.join(", ")}</span>
                  </div>
                )}
                <div className="flex items-center text-sm bg-secondary px-3 py-1 rounded-full">
                  <span> avarage {restaurant?.price_range}$/per person</span>
                </div>
                {restaurant?.average_price && (
                  <div className="flex items-center text-sm bg-secondary px-3 py-1 rounded-full">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>${restaurant?.average_price}/person</span>
                  </div>
                )}
              </div>
            </div>
            <Button size="lg" className="flex-shrink-0">
              Book This Venue
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="mb-10">
            <div className="aspect-[16/9] overflow-hidden rounded-xl mb-4">
              <img
                src={restaurant?.images && restaurant?.images.length > 0 
                  ? restaurant?.images[activeImageIndex]?.url 
                  : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"}
                alt={restaurant?.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {restaurant?.images && restaurant?.images.length > 0 ? (
                restaurant?.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-[4/3] overflow-hidden rounded-lg cursor-pointer ${
                      index === activeImageIndex
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${restaurant?.name} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center p-4 bg-muted rounded-lg">
                  <p>No images available</p>
                </div>
              )}
            </div>

            {/* Admin Image Upload */}
            {isAdmin && (
              <div className="mt-6 bg-secondary p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <ImagePlus className="h-5 w-5 mr-2" />
                  Upload Images (Admin Only)
                </h3>
                <ImageUploader 
                  restaurantId={Number(id)} 
                  onImagesUploaded={handleImagesUploaded} 
                />
              </div>
            )}
          </div>

          {/* Admin Bookings Management */}
          {isAdmin && (
            <Card className="mb-10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Booking Management (Admin Only)</CardTitle>
                    <CardDescription>Manage restaurant bookings</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowBookings(!showBookings)}
                    variant="outline"
                  >
                    {showBookings ? "Hide Bookings" : "Show Bookings"}
                  </Button>
                </div>
              </CardHeader>
              {showBookings && (
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-center py-6 text-foreground/70">No bookings found for this restaurant.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-left">Time</th>
                            <th className="py-3 px-4 text-left">Guests</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">{booking.id}</td>
                              <td className="py-3 px-4">{booking.contact_name}</td>
                              <td className="py-3 px-4">{booking.booking_date}</td>
                              <td className="py-3 px-4">{booking.booking_time}</td>
                              <td className="py-3 px-4">{booking.guest_count}</td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={
                                    booking.status === "confirmed"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : booking.status === "rejected"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  }
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {booking.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-green-600"
                                      onClick={() => handleConfirmBooking(booking.id)}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-red-600"
                                      onClick={() => handleRejectBooking(booking.id)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="mb-12">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>About This Venue</CardTitle>
                  <CardDescription>
                    Key features and information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-6 text-lg">
                    {restaurant?.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Location</h4>
                      <div className="aspect-video bg-secondary rounded-lg mb-2">
                        {/* <div className="w-full h-full flex items-center justify-center text-foreground/50">
                          Interactive Map
                        </div> */}
                            <YMapComponentsProvider apiKey="7a95812b-7995-4b92-86d8-947df7f52c78">
                              <YMap location={location}>
                                <YMapDefaultSchemeLayer />
                                <YMapDefaultFeaturesLayer />
                                <YMapDefaultMarker
                                  coordinates={location.center}
                                />
                              </YMap>
    </YMapComponentsProvider>

                      </div>
                      <p className="text-foreground/70">{restaurant?.address}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Capacity & Layout</h4>
                      <div className="bg-secondary p-4 rounded-lg mb-4">
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Seated Dinner</span>
                            <span className="font-medium">{restaurant?.capacity} guests</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Standing Reception</span>
                            <span className="font-medium">{Math.floor(restaurant?.capacity * 0.2)} guests</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Theater Style</span>
                            <span className="font-medium">{Math.floor(restaurant?.capacity * 0.4)} guests</span>
                          </li>
                        </ul>
                      </div>
                      <p className="text-foreground/70">
                        The venue offers flexible layouts to accommodate various event types.
                        Contact us for custom arrangements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="amenities" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                  <CardDescription>
                    What this venue offers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Venue Features</h4>
                      {restaurant?.features && restaurant?.features.length > 0 ? (
                        <ul className="space-y-2">
                          {restaurant?.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-foreground/70">No features listed</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Cuisine Options</h4>
                      {restaurant?.cuisines && restaurant?.cuisines.length > 0 ? (
                        <>
                          <p className="text-foreground/80 mb-3">
                            The venue specializes in the following cuisine types:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {restaurant?.cuisines.map((cuisine, index) => (
                              <Badge key={index} variant="outline">
                                {cuisine}
                              </Badge>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-foreground/70">No cuisine options listed</p>
                      )}
                      <p className="text-foreground/70 mt-4">
                        Custom menus are available upon request. Dietary restrictions can be accommodated with advance notice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Client Reviews</CardTitle>
                      <CardDescription>
                        What past event hosts have said
                      </CardDescription>
                    </div>
                    {!showReviewForm && (
                      <Button onClick={() => setShowReviewForm(true)}>
                        Write a Review
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showReviewForm && (
                    <ReviewForm 
                      restaurantId={String(restaurant?.id)} 
                      onReviewSubmitted={handleReviewSubmitted} 
                    />
                  )}
                  
                  <div className="space-y-6">
                    {restaurant?.reviews && restaurant?.reviews.length > 0 ? (
                      restaurant?.reviews.map((review, index) => (
                        <div key={index} className="border-b pb-6 last:border-0">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold">{review.username}</h4>
                            <span className="text-sm text-foreground/60">
                              {/* Display date if available */}
                            </span>
                          </div>
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-500" : "text-foreground/20"
                                }`}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="text-foreground/80">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-foreground/70">No reviews yet. Be the first to write one!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Ways to reach the venue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Contact Details</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center">
                          <Phone className="h-5 w-5 mr-3 text-foreground/70" />
                          <a href={`tel:${restaurant?.contact_phone}`} className="hover:underline">
                            {restaurant?.contact_phone}
                          </a>
                        </li>
                        <li className="flex items-center">
                          <Mail className="h-5 w-5 mr-3 text-foreground/70" />
                          <a href={`mailto:${restaurant?.contact_email}`} className="hover:underline">
                            {restaurant?.contact_email}
                          </a>
                        </li>
                        <li className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-foreground/70" />
                          <span>{restaurant?.location}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Business Hours</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Monday - Thursday</span>
                          <span className="font-medium">9:00 AM - 8:00 PM</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Friday - Saturday</span>
                          <span className="font-medium">9:00 AM - 10:00 PM</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Sunday</span>
                          <span className="font-medium">10:00 AM - 6:00 PM</span>
                        </li>
                      </ul>
                      <p className="text-foreground/70 mt-4">
                        Event hours may extend beyond business hours. Contact us for details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Booking Form */}
          <div className="bg-secondary/50 rounded-xl p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="mb-3">Book This Venue</h2>
                <p className="text-foreground/70 text-lg">
                  Fill out the form below to request a reservation
                </p>
              </div>
              
              {renderBookingStatus()}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="booking_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="event_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="corporate">Corporate Event</SelectItem>
                              <SelectItem value="wedding">Wedding Reception</SelectItem>
                              <SelectItem value="birthday">Birthday Celebration</SelectItem>
                              <SelectItem value="gala">Charity Gala</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
<BookingDatePicker
  date={field.value}
  onSelect={field.onChange}
  bookings={restaurant.bookings} // Pass the bookings array directly from your backend
/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Time</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-foreground/50" />
                              <Input type="time" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Guests</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-foreground/50" />
                              <Input 
                                type="number" 
                                placeholder="Enter guest count" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setGuestCount(e.target.value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            This venue can accommodate up to {restaurant?.capacity} guests.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us more about your event requirements..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button type="submit" size="lg" className="min-w-[200px]">
                      Submit Request
                    </Button>
                    
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantDetail;
