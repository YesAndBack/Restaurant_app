import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Check, 
  ChevronDown, 
  Edit, 
  MoreHorizontal, 
  Search, 
  Trash, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { restaurantService, RestaurantData, UpdateRestaurantData } from '@/services/restaurantService';
import { bookingService, BookingData, BookingFilters } from '@/services/bookingService';
import { reviewService, ReviewData } from '@/services/reviewService';
import ImageUploader from '@/components/restaurant/ImageUploader';

// Form schema for restaurant details
const restaurantFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  category: z.string().min(2, 'Category is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  opening_hours: z.string().min(2, 'Opening hours are required'),
  contact_phone: z.string().min(5, 'Contact phone is required'),
  contact_email: z.string().email('Please enter a valid email'),
  average_price: z.number().min(1, 'Average price per person must be at least 1'),
});

// Form schema for reply to review
const replyFormSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty'),
});

const RestaurantManagement = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const numericRestaurantId = restaurantId ? parseInt(restaurantId) : 0;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('details');
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [selectedBookingDates, setSelectedBookingDates] = useState<Date[]>([]);
  const [reviewToReply, setReviewToReply] = useState<number | null>(null);
  const [bookingFilters, setBookingFilters] = useState<BookingFilters>({
    status: undefined,
    from_date: undefined,
    to_date: undefined,
    search: "",
  });
  const [imageDeleteConfirmationId, setImageDeleteConfirmationId] = useState<string | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  // Form setup for restaurant details
  const form = useForm<z.infer<typeof restaurantFormSchema>>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      category: '',
      capacity: 1,
      opening_hours: '',
      contact_phone: '',
      contact_email: '',
      average_price: 1,
    },
  });

  // Form setup for replying to reviews
  const replyForm = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      reply: '',
    },
  });

  // Fetch restaurant data, bookings, and reviews
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!numericRestaurantId) return;
      
      setLoading(true);
      try {
        const restaurantData = await restaurantService.getRestaurantById(numericRestaurantId);
        if (restaurantData) {
          setRestaurant(restaurantData);
          setImages(restaurantData.images || [restaurantData.image]);
          
          // Set form values
          form.reset({
            name: restaurantData.name,
            description: restaurantData.description,
            location: restaurantData.location,
            category: restaurantData.category,
            capacity: restaurantData.capacity,
            opening_hours: restaurantData.opening_hours,
            contact_phone: restaurantData.contact_phone,
            contact_email: restaurantData.contact_email,
            average_price: restaurantData.average_price,
          });
          
          // Fetch bookings and reviews
          const bookingsData = await bookingService.getBookingsForRestaurant(numericRestaurantId);
          setBookings(bookingsData);
          
          const reviewsData = await reviewService.getReviewsForRestaurant(numericRestaurantId);
          setReviews(reviewsData);
        } else {
          toast({
            title: 'Error',
            description: 'Restaurant not found',
            variant: 'destructive',
          });
          navigate('/admin-dashboard');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load restaurant data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [numericRestaurantId, navigate, toast, form]);

  // Handle form submission for restaurant details
  const onSubmit = async (values: z.infer<typeof restaurantFormSchema>) => {
    if (!numericRestaurantId) return;
    
    try {
      const updateData: UpdateRestaurantData = values;
      const updated = await restaurantService.updateRestaurant(numericRestaurantId, updateData);
      
      if (updated) {
        setRestaurant(updated);
        toast({
          title: 'Success',
          description: 'Restaurant details updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant details',
        variant: 'destructive',
      });
    }
  };

  // Handle submission of available booking dates
  const handleSaveAvailableDates = async () => {
    if (!numericRestaurantId || selectedBookingDates.length === 0) return;
    
    const formattedDates = selectedBookingDates.map(date => format(date, 'yyyy-MM-dd'));
    try {
      await bookingService.setAvailableDates(numericRestaurantId, formattedDates);
      toast({
        title: 'Success',
        description: 'Available booking dates updated successfully',
      });
    } catch (error) {
      console.error('Error setting available dates:', error);
    }
  };

  // Handle image upload completion
  const handleImagesUploaded = (newImageUrls: string[]) => {
    setImages(prev => [...prev, ...newImageUrls]);
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl: string) => {
    if (!numericRestaurantId) return;
    
    try {
      const success = await restaurantService.deleteImage(numericRestaurantId, imageUrl);
      if (success) {
        setImages(images.filter(img => img !== imageUrl));
        setImageDeleteConfirmationId(null);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const updated = await bookingService.confirmBooking(bookingId);
      if (updated) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
        ));
        toast({
          title: 'Success',
          description: 'Booking has been confirmed',
        });
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking',
        variant: 'destructive',
      });
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async (bookingId: number) => {
    try {
      const updated = await bookingService.rejectBooking(bookingId);
      if (updated) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'rejected' } : booking
        ));
        toast({
          title: 'Success',
          description: 'Booking has been rejected',
        });
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject booking',
        variant: 'destructive',
      });
    }
  };

  // Handle reply to review submission
  const handleReplyToReview = async (data: z.infer<typeof replyFormSchema>) => {
    if (!reviewToReply) return;
    
    try {
      await reviewService.replyToReview(reviewToReply, { reply: data.reply });
      setReviews(await reviewService.getReviewsForRestaurant(numericRestaurantId));
      setReviewToReply(null);
      replyForm.reset();
      toast({
        title: 'Success',
        description: 'Reply to review has been posted',
      });
    } catch (error) {
      console.error('Error replying to review:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
    }
  };

  // Handle filtering bookings
  const applyBookingFilters = async () => {
    if (!numericRestaurantId) return;
    
    try {
      const filteredBookings = await bookingService.getBookingsForRestaurant(
        numericRestaurantId, 
        bookingFilters
      );
      setBookings(filteredBookings);
      
      toast({
        title: 'Filters Applied',
        description: `Showing ${filteredBookings.length} bookings matching your criteria.`,
      });
    } catch (error) {
      console.error('Error filtering bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply filters',
        variant: 'destructive',
      });
    }
  };

  // Reset booking filters
  const resetBookingFilters = async () => {
    setBookingFilters({
      status: undefined,
      from_date: undefined,
      to_date: undefined,
      search: "",
    });
    if (numericRestaurantId) {
      const allBookings = await bookingService.getBookingsForRestaurant(numericRestaurantId);
      setBookings(allBookings);
      toast({
        title: 'Filters Reset',
        description: 'Showing all bookings',
      });
    }
  };

  // Open booking details
  const handleViewBookingDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Restaurant Management</h1>
          <Button onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading restaurant data...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Restaurant Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Restaurant Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Restaurant Details</CardTitle>
                  <CardDescription>
                    Update your restaurant's information. All fields are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                          name="average_price"
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
                          name="opening_hours"
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
                          name="contact_phone"
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
                          name="contact_email"
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
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Available Booking Dates</CardTitle>
                  <CardDescription>
                    Set the dates when your restaurant is available for booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Calendar
                      mode="multiple"
                      selected={selectedBookingDates}
                      onSelect={setSelectedBookingDates}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedBookingDates.map((date, i) => (
                        <div key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center">
                          {format(date, 'PPP')}
                          <button 
                            onClick={() => setSelectedBookingDates(selectedBookingDates.filter((d, idx) => idx !== i))}
                            className="ml-1 text-primary/80 hover:text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <Button onClick={handleSaveAvailableDates} disabled={selectedBookingDates.length === 0}>
                      Save Available Dates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Images</CardTitle>
                  <CardDescription>
                    Manage your restaurant's photo gallery. You must have at least one image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Images */}
                    {images.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Current Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((image, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img 
                                src={image} 
                                alt={`Restaurant ${index + 1}`} 
                                className="w-full h-full object-cover rounded-md"
                              />
                              {images.length > 1 && (
                                <button
                                  onClick={() => setImageDeleteConfirmationId(image)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Uploader */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Upload New Images</h3>
                      <ImageUploader
                        restaurantId={numericRestaurantId}
                        onImagesUploaded={handleImagesUploaded}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Delete Confirmation Dialog */}
              <Dialog 
                open={!!imageDeleteConfirmationId} 
                onOpenChange={(open) => !open && setImageDeleteConfirmationId(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Image Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this image? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center my-4">
                    {imageDeleteConfirmationId && (
                      <img 
                        src={imageDeleteConfirmationId} 
                        alt="Image to delete" 
                        className="max-h-48 object-contain rounded-md"
                      />
                    )}
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setImageDeleteConfirmationId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => imageDeleteConfirmationId && handleDeleteImage(imageDeleteConfirmationId)}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Management</CardTitle>
                  <CardDescription>
                    View and manage all bookings for your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Booking Filters */}
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="space-y-2 w-full md:w-auto">
                        <p className="text-sm font-medium">Search</p>
                        <div className="flex items-center border rounded-md px-3 py-1 gap-2 bg-background">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <input 
                            type="text"
                            placeholder="Search guest name"
                            className="border-0 bg-transparent focus:outline-none flex-1 text-sm"
                            value={bookingFilters.search || ""}
                            onChange={(e) => setBookingFilters({...bookingFilters, search: e.target.value})}
                          />
                          {bookingFilters.search && (
                            <button 
                              onClick={() => setBookingFilters({...bookingFilters, search: ""})}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <Select
                          value={bookingFilters.status}
                          onValueChange={(value: string | undefined) => {
                            if (value === "all") {
                              setBookingFilters({...bookingFilters, status: undefined});
                            } else {
                              setBookingFilters({...bookingFilters, status: value as "pending" | "confirmed" | "rejected" | undefined});
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">From Date</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !bookingFilters.from_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bookingFilters.from_date ? (
                                format(new Date(bookingFilters.from_date), "PPP")
                              ) : (
                                <span>From date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={bookingFilters.from_date ? new Date(bookingFilters.from_date) : undefined}
                              onSelect={(date) => 
                                setBookingFilters({
                                  ...bookingFilters, 
                                  from_date: date ? format(date, 'yyyy-MM-dd') : undefined
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">To Date</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[200px] justify-start text-left font-normal",
                                !bookingFilters.to_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bookingFilters.to_date ? (
                                format(new Date(bookingFilters.to_date), "PPP")
                              ) : (
                                <span>To date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={bookingFilters.to_date ? new Date(bookingFilters.to_date) : undefined}
                              onSelect={(date) => 
                                setBookingFilters({
                                  ...bookingFilters, 
                                  to_date: date ? format(date, 'yyyy-MM-dd') : undefined
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={applyBookingFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={resetBookingFilters}>Reset</Button>
                      </div>
                    </div>

                    {/* Bookings Table */}
                    {bookings.length > 0 ? (
                      <Table>
                        <TableCaption>List of bookings</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow 
                              key={booking.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleViewBookingDetails(booking)}
                            >
                              <TableCell className="font-medium">{booking.booking_username}</TableCell>
                              <TableCell>{format(new Date(booking.booking_date), 'PPP')}</TableCell>
                              <TableCell>{booking.number_of_guests}</TableCell>
                              <TableCell className="capitalize">{booking.event_type}</TableCell>
                              <TableCell>
                                <div>{booking.email}</div>
                                <div className="text-muted-foreground">{booking.phone_number}</div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {booking.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleConfirmBooking(booking.id)}
                                    >
                                      <Check className="mr-1 h-4 w-4" />
                                      Confirm
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-red-600 text-red-600 hover:bg-red-50"
                                      onClick={() => handleRejectBooking(booking.id)}
                                    >
                                      <X className="mr-1 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No bookings found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details Dialog */}
              <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
                <DialogContent className="sm:max-w-[550px]">
                  {selectedBooking && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span>Booking #{selectedBooking.id}</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                          </span>
                        </DialogTitle>
                        <DialogDescription>
                          Booking details for {selectedBooking.booking_username}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-1 gap-4">
                          {/* Customer Information */}
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium col-span-2">{selectedBooking.booking_username}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <span className="text-sm col-span-2">{selectedBooking.email}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Phone:</span>
                                <span className="text-sm col-span-2">{selectedBooking.phone_number}</span>
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Booking Details</h3>
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Date:</span>
                                <span className="text-sm font-medium col-span-2">
                                  {format(new Date(selectedBooking.booking_date), 'PPP')}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Event Type:</span>
                                <span className="text-sm capitalize col-span-2">{selectedBooking.event_type}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm text-muted-foreground">Number of Guests:</span>
                                <span className="text-sm col-span-2">{selectedBooking.number_of_guests}</span>
                              </div>
                              {selectedBooking.additional_information && (
                                <div className="grid grid-cols-3 gap-1">
                                  <span className="text-sm text-muted-foreground">Additional Info:</span>
                                  <span className="text-sm whitespace-pre-wrap col-span-2">
                                    {selectedBooking.additional_information}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        {selectedBooking.status === 'pending' && (
                          <div className="flex gap-2 mr-auto">
                            <Button 
                              onClick={() => {
                                handleConfirmBooking(selectedBooking.id);
                                setBookingDetailsOpen(false);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Confirm
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                handleRejectBooking(selectedBooking.id);
                                setBookingDetailsOpen(false);
                              }}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                        <Button variant="secondary" onClick={() => setBookingDetailsOpen(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    View and respond to customer reviews for your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.username}</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {review.created_at && (
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(review.created_at), 'PPP')}
                                </p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setReviewToReply(review.id)}
                            >
                              Reply
                            </Button>
                          </div>
                          
                          <p className="text-sm">{review.comment}</p>
                          
                          {review.reply && (
                            <div className="bg-muted/30 p-3 rounded-md ml-4 mt-2">
                              <p className="text-sm font-medium">Your Response:</p>
                              <p className="text-sm mt-1">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reply to Review Dialog */}
              <Dialog 
                open={!!reviewToReply} 
                onOpenChange={(open) => !open && setReviewToReply(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reply to Review</DialogTitle>
                    <DialogDescription>
                      Your response will be visible to all customers.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {reviewToReply && (
                    <div className="py-2">
                      <div className="bg-muted/50 p-3 rounded-md mb-4">
                        <p className="font-medium">
                          {reviews.find(r => r.id === reviewToReply)?.username}
                        </p>
                        <div className="flex my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-lg ${i < (reviews.find(r => r.id === reviewToReply)?.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-sm">
                          {reviews.find(r => r.id === reviewToReply)?.comment}
                        </p>
                      </div>
                      
                      <Form {...replyForm}>
                        <form onSubmit={replyForm.handleSubmit(handleReplyToReview)} className="space-y-4">
                          <FormField
                            control={replyForm.control}
                            name="reply"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Reply</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Write your response here..." 
                                    className="min-h-[100px]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReviewToReply(null)}>
                              Cancel
                            </Button>
                            <Button type="submit">Post Reply</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default RestaurantManagement;