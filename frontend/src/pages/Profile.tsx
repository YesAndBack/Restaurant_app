import React from 'react';
import { Bell, Phone, Mail, User, Calendar, X, MessageCircle, Pencil } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

const Profile = () => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [rejectBookingId, setRejectBookingId] = React.useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState<string>("");
  
  const [profile, setProfile] = React.useState({
    nickname: "Yessenbek Abyur",
    phone: "87478014087",
    email: "yessen@example.com",
    notificationsEnabled: true
  });

  const [chats, setChats] = React.useState([
    { id: 1, restaurant: "Grand Hall", lastMessage: "Your table is ready!", unread: true },
    { id: 2, restaurant: "Sushi Master", lastMessage: "Thank you for your reservation", unread: false },
  ]);

  const [bookings, setBookings] = React.useState([
    { id: 1, date: "2025-04-15", time: "19:00", restaurant: "Grand Hall" },
    { id: 2, date: "2025-04-20", time: "20:30", restaurant: "Tomiris" },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: profile.nickname,
      phone: profile.phone,
      email: profile.email,
    },
  });

  const handleNotificationToggle = (checked: boolean) => {
    setProfile(prev => ({ ...prev, notificationsEnabled: checked }));
  };

  const handleRejectBooking = (bookingId: number) => {
    setRejectBookingId(bookingId);
  };

  const handleConfirmReject = () => {
    if (rejectBookingId && rejectionReason) {
      setBookings(prev => prev.filter(booking => booking.id !== rejectBookingId));
      toast({
        title: "Booking Rejected",
        description: `Booking has been rejected. Reason: ${rejectionReason}`,
      });
      setRejectBookingId(null);
      setRejectionReason("");
    }
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setProfile(prev => ({
      ...prev,
      ...values
    }));
    setIsEditDialogOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#1A1F2C]">My Profile</h1>
        
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="text-[#9b87f5]" />
              <div>
                <p className="text-sm text-gray-500">Nickname</p>
                <p className="font-medium">{profile.nickname}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Phone className="text-[#9b87f5]" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Mail className="text-[#9b87f5]" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="text-[#9b87f5]" />
              <div>
                <h2 className="text-xl font-semibold">Restaurant Chats</h2>
                <p className="text-sm text-gray-500">Messages from restaurant owners</p>
              </div>
            </div>
            <Switch 
              checked={profile.notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-4">
                  {chat.unread && (
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full"/>
                  )}
                  <div>
                    <h3 className="font-medium">{chat.restaurant}</h3>
                    <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Calendar className="text-[#9b87f5]" />
            <h2 className="text-xl font-semibold">My Restaurant Bookings</h2>
          </div>
          
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h3 className="font-medium">{booking.restaurant}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {booking.time}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectBooking(booking.id)}
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No current bookings</p>
            )}
          </div>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your nickname" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={rejectBookingId !== null} onOpenChange={(open) => !open && setRejectBookingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Please select a reason for rejecting this booking. This will be shared with the restaurant.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schedule_conflict">Schedule Conflict</SelectItem>
                  <SelectItem value="changed_plans">Changed Plans</SelectItem>
                  <SelectItem value="wrong_datetime">Wrong Date/Time Selected</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setRejectBookingId(null);
                setRejectionReason("");
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmReject}
                disabled={!rejectionReason}
              >
                Confirm Rejection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Profile;
