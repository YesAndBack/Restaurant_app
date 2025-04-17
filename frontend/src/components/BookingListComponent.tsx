import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BookingResponce, restaurantService } from "@/services/restaurantService";
import { bookingService } from "@/services/bookingService";

const BookingListComponent = () => {
  const [bookings, setBookings] = useState<BookingResponce[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});

  // Create a reusable function to fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const bookingData = await restaurantService.getMyBooking();
      setBookings(bookingData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
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
          onClick={() => handleConfirmBooking(booking.id)}
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
          onClick={() => handleRejectBooking(booking.id)}
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
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{booking.booking_username}</td>
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
    </div>
  );
};

export default BookingListComponent;