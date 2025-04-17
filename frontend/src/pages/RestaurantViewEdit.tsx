import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { restaurantService } from '@/services/restaurantService';
import ImageUploader from '@/components/restaurant/ImageUploader';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Edit, Save, ArrowLeft, Plus } from 'lucide-react';

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

const RestaurantAdminDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [images, setImages] = useState([]);
  const [imageDeleteConfirmationId, setImageDeleteConfirmationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddImageDialog, setShowAddImageDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm({
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

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const restaurantId = parseInt(id);
        const restaurantData = await restaurantService.getRestaurantById(restaurantId);
        
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
  }, [id, navigate, toast, form]);

  // Handle form submission for updating restaurant
  const onSubmit = async (values) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const restaurantId = parseInt(id);
      const updated = await restaurantService.updateRestaurant(restaurantId, values);
      
      if (updated) {
        setRestaurant(updated);
        toast({
          title: 'Success',
          description: 'Restaurant details updated successfully',
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update restaurant details',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload completion
  const handleImagesUploaded = (newImageUrls) => {
    setImages(prev => [...prev, ...newImageUrls]);
    setShowAddImageDialog(false);
    toast({
      title: 'Success',
      description: 'Images uploaded successfully',
    });
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl) => {
    if (!id) return;
    
    try {
      const restaurantId = parseInt(id);
      const success = await restaurantService.deleteImage(restaurantId, imageUrl);
      if (success) {
        setImages(images.filter(img => img !== imageUrl));
        setImageDeleteConfirmationId(null);
        toast({
          title: 'Success',
          description: 'Image deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  // Navigate back to admin dashboard
  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-center items-center h-64">
            <p>Loading restaurant data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel Editing
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">Restaurant Details</TabsTrigger>
            <TabsTrigger value="images">Restaurant Images</TabsTrigger>
          </TabsList>

          {/* View/Edit Restaurant Tab */}
          <TabsContent value="view">
            <Card>
              <CardContent className="pt-6">
                {isEditing ? (
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
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    {/* Restaurant preview display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Restaurant Name</h3>
                        <p className="text-xl font-bold">{restaurant?.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Category</h3>
                        <p>{restaurant?.category}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Location</h3>
                        <p>{restaurant?.location}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Capacity</h3>
                        <p>{restaurant?.capacity} guests</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Average Price</h3>
                        <p>${restaurant?.average_price} per person</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Opening Hours</h3>
                        <p>{restaurant?.opening_hours}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Contact Phone</h3>
                        <p>{restaurant?.contact_phone}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Contact Email</h3>
                        <p>{restaurant?.contact_email}</p>
                      </div>
                      
                      <div className="space-y-1 md:col-span-2">
                        <h3 className="font-semibold text-lg">Description</h3>
                        <p className="text-muted-foreground">{restaurant?.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Restaurant Images</h3>
                    <Button onClick={() => setShowAddImageDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Images
                    </Button>
                  </div>
                  
                  {/* Current Images */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img 
                            src={image} 
                            alt={`Restaurant ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md"
                          />
                          {images.length > 1 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setImageDeleteConfirmationId(image)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-md">
                      <p className="text-muted-foreground">No images available</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowAddImageDialog(true)}
                      >
                        Add Images
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Image Upload Dialog */}
        <Dialog open={showAddImageDialog} onOpenChange={setShowAddImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
              <DialogDescription>
                Add new images to your restaurant. Customers will see these on your restaurant page.
              </DialogDescription>
            </DialogHeader>
            {id && (
              <ImageUploader
                restaurantId={parseInt(id)}
                onImagesUploaded={handleImagesUploaded}
              />
            )}
            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddImageDialog(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;