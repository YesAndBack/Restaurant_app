
export interface Booking {
  id: string;
  restaurantId: string;
  date: string; // ISO format date string
  startTime: string;
  endTime: string;
  guestCount: number;
  name: string;
  email: string;
  status: "pending" | "confirmed" | "cancelled";
}

export type BookingDay = {
  date: string; // ISO format date string
  isFullyBooked: boolean;
  bookings: Booking[];
  availableCapacity: number;
};
