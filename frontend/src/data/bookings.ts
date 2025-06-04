
import { Booking, BookingDay } from "@/types/booking";
import { addDays, format, eachDayOfInterval } from "date-fns";

// Generate some sample bookings for the next 30 days
const today = new Date();
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  
  // Create bookings for restaurant 1
  // Fully booked days: today + 2, today + 5, today + 10
  const fullyBookedDays = [2, 5, 10];
  
  fullyBookedDays.forEach(dayOffset => {
    const bookingDate = addDays(today, dayOffset);
    const dateStr = format(bookingDate, "yyyy-MM-dd");
    
    // Add multiple bookings to make the day fully booked
    bookings.push({
      id: `booking-${dateStr}-1`,
      restaurantId: "1",
      date: dateStr,
      startTime: "18:00",
      endTime: "22:00",
      guestCount: 100,
      name: "Corporate Event",
      email: "corporate@example.com",
      status: "confirmed"
    });
    
    bookings.push({
      id: `booking-${dateStr}-2`,
      restaurantId: "1",
      date: dateStr,
      startTime: "12:00",
      endTime: "16:00",
      guestCount: 80,
      name: "Wedding Reception",
      email: "wedding@example.com",
      status: "confirmed"
    });
  });
  
  // Create partial bookings for restaurant 1
  // Partially booked days: today + 3, today + 7, today + 14
  const partiallyBookedDays = [3, 7, 14];
  
  partiallyBookedDays.forEach(dayOffset => {
    const bookingDate = addDays(today, dayOffset);
    const dateStr = format(bookingDate, "yyyy-MM-dd");
    
    bookings.push({
      id: `booking-${dateStr}`,
      restaurantId: "1",
      date: dateStr,
      startTime: "19:00",
      endTime: "22:00",
      guestCount: 50,
      name: "Birthday Party",
      email: "birthday@example.com",
      status: "confirmed"
    });
  });
  
  // Create bookings for restaurant 2
  // Fully booked days: today + 1, today + 6, today + 12
  const restaurant2FullyBookedDays = [1, 6, 12];
  
  restaurant2FullyBookedDays.forEach(dayOffset => {
    const bookingDate = addDays(today, dayOffset);
    const dateStr = format(bookingDate, "yyyy-MM-dd");
    
    bookings.push({
      id: `booking-r2-${dateStr}`,
      restaurantId: "2",
      date: dateStr,
      startTime: "18:00",
      endTime: "22:00",
      guestCount: 80,
      name: "Corporate Event",
      email: "corporate@example.com",
      status: "confirmed"
    });
  });
  
  return bookings;
};

export const mockBookings = generateMockBookings();

// Helper function to check if a day is booked
export const getBookingDayInfo = (restaurantId: string, date: Date, restaurantCapacity: number): BookingDay => {
  const dateStr = format(date, "yyyy-MM-dd");
  
  const dayBookings = mockBookings.filter(
    booking => booking.restaurantId === restaurantId && 
               booking.date === dateStr &&
               booking.status === "confirmed"
  );
  
  const totalGuestCount = dayBookings.reduce((sum, booking) => sum + booking.guestCount, 0);
  const availableCapacity = restaurantCapacity - totalGuestCount;
  const isFullyBooked = availableCapacity <= 0;
  
  return {
    date: dateStr,
    isFullyBooked,
    bookings: dayBookings,
    availableCapacity: Math.max(0, availableCapacity)
  };
};

// Helper function to get booking info for a date range
export const getBookingsForDateRange = (restaurantId, startDate, endDate, capacity) => {
  // Normally we would fetch this data from an API
  // For now, we'll use the restaurant data that's already loaded
  
  // Find the restaurant in our data (this will be replaced by your actual data fetching logic)
  let bookedDates = [];
  
  // Try to get the restaurant from localStorage (this is a workaround)
  try {
    const restaurantData = JSON.parse(localStorage.getItem('currentRestaurant'));
    if (restaurantData && restaurantData.bookings) {
      bookedDates = restaurantData.bookings.map(booking => booking.booking_date);
    }
  } catch (error) {
    console.error("Error accessing restaurant data:", error);
  }
  
  // Generate array of all dates in the range
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Map each date to its booking status
  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isBooked = bookedDates.includes(dateStr);
    
    return {
      date: dateStr,
      isFullyBooked: isBooked,
      availableCapacity: isBooked ? 0 : capacity, // If booked, no capacity, otherwise full capacity
    };
  });
};