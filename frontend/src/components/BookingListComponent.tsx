import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BookingResponce, restaurantService } from "@/services/restaurantService";
import { bookingService } from "@/services/bookingService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Users, Tag, Mail, Phone, Info, User, Building } from "lucide-react";

interface RestaurantInfo {
  [key: number]: string;
}

const BookingListComponent = () => {
  const [bookings, setBookings] = useState<BookingResponce[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});
  const [selectedBooking, setSelectedBooking] = useState<BookingResponce | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [restaurantNames, setRestaurantNames] = useState<RestaurantInfo>({});
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Function to fetch restaurant names
  const fetchRestaurantNames = useCallback(async (bookings: BookingResponce[]) => {
    try {
      setLoadingRestaurants(true);
      const uniqueRestaurantIds = [...new Set(bookings.map(booking => booking.restaurant_id))];
      const restaurantData: RestaurantInfo = {};

      for (const id of uniqueRestaurantIds) {
        try {
          const restaurant = await restaurantService.getRestaurantById(id);
          if (restaurant) {
            restaurantData[id] = restaurant.name;
          } else {
            restaurantData[id] = `Restaurant #${id}`;
          }
        } catch (error) {
          console.error(`Error fetching restaurant #${id}:`, error);
          restaurantData[id] = `Restaurant #${id}`;
        }
      }
      
      setRestaurantNames(restaurantData);
    } catch (error) {
      console.error("Error fetching restaurant names:", error);
    } finally {
      setLoadingRestaurants(false);
    }
  }, []);

  // Create a reusable function to fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const bookingData = await restaurantService.getMyBooking();
      setBookings(bookingData);
      // After getting bookings, fetch restaurant names
      await fetchRestaurantNames(bookingData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurantNames]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handlers for booking actions with refresh
  const handleConfirmBooking = async (bookingId: string | number) => {
    try {
      setActionInProgress({...actionInProgress, [bookingId.toString()]: "confirming"});
      await bookingService.confirmBooking(bookingId);
      // Refresh the booking list after confirmation
      await fetchBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
    } finally {
      const newActionInProgress = {...actionInProgress};
      delete newActionInProgress[bookingId.toString()];
      setActionInProgress(newActionInProgress);
    }
  };

  const handleRejectBooking = async (bookingId: string | number) => {
    try {
      setActionInProgress({...actionInProgress, [bookingId.toString()]: "rejecting"});
      await bookingService.rejectBooking(bookingId);
      // Refresh the booking list after rejection
      await fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      const newActionInProgress = {...actionInProgress};
      delete newActionInProgress[bookingId.toString()];
      setActionInProgress(newActionInProgress);
    }
  };

  // Function to handle row click
  const handleRowClick = (booking: BookingResponce) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  // Function to render action buttons based on status
  const renderActionButtons = (booking: BookingResponce) => {
    const bookingId = booking.id.toString();
    const isProcessing = actionInProgress[bookingId];

    if (booking.status !== "pending") {
      return null;
    }

    return (
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all duration-300 px-4"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            handleConfirmBooking(booking.id);
          }}
          disabled={!!isProcessing}
        >
          {isProcessing === "confirming" ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirm
            </>
          )}
        </Button>
        <Button 
          className="bg-white border border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all duration-300 px-4"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            handleRejectBooking(booking.id);
          }}
          disabled={!!isProcessing}
        >
          {isProcessing === "rejecting" ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Rejecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Reject
            </>
          )}
        </Button>
      </div>
    );
  };

  // Booking Details Dialog Component
  const BookingDetailsDialog = () => {
    if (!selectedBooking) return null;

    return (
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Booking #{selectedBooking.id}</span>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </span>
            </DialogTitle>
            <DialogDescription>
              Complete booking details for {selectedBooking.booking_username}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Restaurant Information Section - New section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Restaurant Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Restaurant</p>
                      <p className="font-medium">
                        {restaurantNames[selectedBooking.restaurant_id] || `Loading...`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Customer Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedBooking.booking_username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedBooking.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium">{selectedBooking.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Booking Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Booking Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.booking_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Event Type</p>
                      <p className="font-medium capitalize">{selectedBooking.event_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Number of Guests</p>
                      <p className="font-medium">{selectedBooking.number_of_guests}</p>
                    </div>
                  </div>
                  
                  {selectedBooking.additional_information && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Additional Information</p>
                        <p className="font-medium whitespace-pre-wrap">{selectedBooking.additional_information}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* System Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">System Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Restaurant ID</p>
                      <p className="font-medium">#{selectedBooking.restaurant_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-medium">#{selectedBooking.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            {selectedBooking.status === "pending" && (
              <div className="flex gap-2 mr-auto">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleConfirmBooking(selectedBooking.id);
                    setShowDetailsDialog(false);
                  }}
                  disabled={!!actionInProgress[selectedBooking.id]}
                >
                  Confirm Booking
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleRejectBooking(selectedBooking.id);
                    setShowDetailsDialog(false);
                  }}
                  disabled={!!actionInProgress[selectedBooking.id]}
                >
                  Reject Booking
                </Button>
              </div>
            )}
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
      
      {loading ? (
        <p className="text-center py-4">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center py-4">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Guest</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Restaurant</th> {/* New column */}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Event Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Guests</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleRowClick(booking)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{booking.booking_username}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-primary-600">
                    {loadingRestaurants ? (
                      <span className="inline-block w-24 h-4 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      restaurantNames[booking.restaurant_id] || `Restaurant #${booking.restaurant_id}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">{booking.event_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(booking.booking_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.number_of_guests}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{booking.email}</div>
                    <div className="text-gray-600">{booking.phone_number}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {renderActionButtons(booking)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Dialog */}
      <BookingDetailsDialog />
    </div>
  );
};

export default BookingListComponent;