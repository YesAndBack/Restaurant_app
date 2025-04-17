
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Edit, Trash, Mail, ExternalLink, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { restaurantService, RestaurantData } from "@/services/restaurantService";
import BookingListComponent from "@/components/BookingListComponent";

type Restaurant = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  image: string;
  openingHours: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  owned: boolean;
  averagePrice: number;
};

const restaurantFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  category: z.string().min(2, "Category is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  image: z.string().url("Please enter a valid image URL"),
  openingHours: z.string().min(2, "Opening hours are required"),
  contactPhone: z.string().min(5, "Contact phone is required"),
  contactEmail: z.string().email("Please enter a valid email"),
  averagePrice: z.number().min(1, "Average price per person must be at least 1"),
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("restaurants");
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<number | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      setIsLoading(true);
      try {
        const myRestaurants = await restaurantService.getMyRestaurants();
        if (myRestaurants.length > 0) {
          const formattedRestaurants = myRestaurants.map(restaurant => {
            // Determine the image URL based on the various formats possible
            let imageUrl = "";
            if (Array.isArray(restaurant.images) && restaurant.images.length > 0) {
              // Check if images array contains objects with url property
              if (typeof restaurant.images[0] === 'object' && 'url' in restaurant.images[0]) {
                imageUrl = (restaurant.images[0] as { id: number, url: string }).url;
              } else {
                // Images array contains string URLs
                imageUrl = restaurant.images[0] as string;
              }
            } else if (restaurant.image) {
              // Direct image property
              imageUrl = restaurant.image;
            } else {
              // Fallback image
              imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop";
            }

            return {
              id: restaurant.id,
              name: restaurant.name,
              description: restaurant.description,
              location: restaurant.location,
              category: restaurant.category,
              capacity: restaurant.capacity,
              image: imageUrl,
              openingHours: restaurant.opening_hours || "",
              contactPhone: restaurant.contact_phone,
              contactEmail: restaurant.contact_email,
              status: restaurant.status || "approved",
              owned: true,
              averagePrice: restaurant.average_price
            };
          });
          setRestaurants(formattedRestaurants);
        } else {
          toast({
            title: "No restaurants found",
            description: "You don't have any restaurants yet. Create one to get started.",
          });
          setRestaurants([]);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
        toast({
          title: "Error loading restaurants",
          description: "There was a problem fetching your restaurants.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRestaurants();
  }, [toast]);

  

  const form = useForm<z.infer<typeof restaurantFormSchema>>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      category: "",
      capacity: 50,
      image: "",
      openingHours: "",
      contactPhone: "",
      contactEmail: "",
      averagePrice: 50,
    },
  });

  function onSubmit(values: z.infer<typeof restaurantFormSchema>) {
    const createRestaurant = async () => {
      try {
        const restaurantData = {
          name: values.name,
          description: values.description,
          location: values.location,
          category: values.category,
          capacity: values.capacity,
          opening_hours: values.openingHours,
          contact_phone: values.contactPhone,
          contact_email: values.contactEmail,
          average_price: values.averagePrice
        };
        
        const newRestaurant = await restaurantService.createRestaurant(restaurantData);
        
        if (newRestaurant) {
          // Add the new restaurant to the state
          const formattedRestaurant: Restaurant = {
            id: newRestaurant.id,
            name: newRestaurant.name,
            description: newRestaurant.description,
            location: newRestaurant.location,
            category: newRestaurant.category,
            capacity: newRestaurant.capacity,
            image: values.image, // Use the image URL from the form since we don't upload it in this step
            openingHours: newRestaurant.opening_hours || "",
            contactPhone: newRestaurant.contact_phone,
            contactEmail: newRestaurant.contact_email,
            status: newRestaurant.status || "pending",
            owned: true,
            averagePrice: newRestaurant.average_price
          };
          
          setRestaurants([...restaurants, formattedRestaurant]);
          
          toast({
            title: "Restaurant created",
            description: "Your restaurant has been created successfully"
          });
        }
      } catch (error) {
        console.error("Error creating restaurant:", error);
        toast({
          title: "Failed to create restaurant",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      }
    };
    
    createRestaurant();
    setShowAddRestaurantForm(false);
    form.reset();
  }

  const handleCopyRestaurant = (restaurantId: number) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      const restaurantString = JSON.stringify(restaurant, null, 2);
      navigator.clipboard.writeText(restaurantString);
      toast({
        title: "Restaurant details copied!",
        description: "Restaurant details have been copied to your clipboard.",
      });
    }
  };

  const handleManageRestaurant = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}/manage`);
  };

  const handleViewAsUser = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}/view-edit`);
  };

  const handleEditRestaurant = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}/edit`);
  };

  const handleDeleteRestaurant = (restaurantId: number) => {
    setRestaurantToDelete(restaurantId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteRestaurant = async () => {
    if (restaurantToDelete) {
      try {
        // Call API to delete restaurant (would be implemented in restaurantService)
        // await restaurantService.deleteRestaurant(restaurantToDelete);
        
        setRestaurants(restaurants.filter((r) => r.id !== restaurantToDelete));
        toast({
          title: "Restaurant deleted!",
          description: "The restaurant has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Failed to delete restaurant",
          description: "There was a problem deleting the restaurant.",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirmation(false);
        setRestaurantToDelete(null);
      }
    }
  };

  const handleContactRestaurant = (restaurantId: number) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      setContactDetails({
        name: restaurant.name,
        email: restaurant.contactEmail,
        message: "",
      });
      setShowContactDialog(true);
    }
  };

  const handleContactSubmit = () => {
    console.log("Contact details:", contactDetails);
    toast({
      title: "Message sent!",
      description: "Your message has been sent to the restaurant.",
    });
    setShowContactDialog(false);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="bg-background rounded-lg shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b bg-background px-4 pt-2">
              <TabsTrigger value="restaurants" className="data-[state=active]:bg-background">Restaurants</TabsTrigger>
              <TabsTrigger value="reservations" className="data-[state=active]:bg-background">Reservations</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurants" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Restaurant Management</h2>
                <Button onClick={() => navigate('/restaurant/add')}>Add Restaurant</Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : restaurants.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">You don't have any restaurants yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => navigate('/restaurant/add')}
                  >
                    Create Your First Restaurant
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of your restaurants.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">{restaurant.name}</TableCell>
                        <TableCell>{restaurant.location}</TableCell>
                        <TableCell>{restaurant.category}</TableCell>
                        <TableCell>{restaurant.capacity}</TableCell>
                        <TableCell>{restaurant.status}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewAsUser(restaurant.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View & Edit as User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageRestaurant(restaurant.id)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Manage Restaurant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyRestaurant(restaurant.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRestaurant(restaurant.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit restaurant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactRestaurant(restaurant.id)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact restaurant
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteRestaurant(restaurant.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete restaurant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="reservations" className="p-6">
              <div className="flex">
              <h2 className="text-2xl font-semibold mb-4">Reservations Management</h2>
              {/* <Button variant="outline" className="ml-4" onClick={() => restaurantService.getMyBooking()}>
                Refresh
              </Button> */}
              </div>
              
              <p>To manage bookings, please go to the specific restaurant management page.</p>
              <BookingListComponent />
            </TabsContent>
          </Tabs>
        </div>
        
        <Dialog open={showAddRestaurantForm} onOpenChange={setShowAddRestaurantForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Fill out the form below to submit your restaurant for approval.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter restaurant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Italian, Fine Dining, Bistro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="Maximum number of guests" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="averagePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Price per Person ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="Average price per person" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 9 AM - 10 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="URL to restaurant image" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your restaurant" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowAddRestaurantForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Restaurant</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this restaurant? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input id="name" value={restaurants.find((r) => r.id === restaurantToDelete)?.name || ""} className="col-span-3" disabled />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRestaurant}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Contact Restaurant</DialogTitle>
              <DialogDescription>
                Send a message to the restaurant.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input id="name" value={contactDetails.name} className="col-span-3" disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input id="email" type="email" value={contactDetails.email} className="col-span-3" disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="message" className="text-right">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Enter your message"
                  className="col-span-3"
                  value={contactDetails.message}
                  onChange={(e) => setContactDetails({ ...contactDetails, message: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowContactDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleContactSubmit}>Send Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
