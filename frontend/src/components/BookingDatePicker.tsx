import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface BookingDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  bookings: { id: number, booking_date: string }[];
}

const BookingDatePicker = ({
  date,
  onSelect,
  bookings
}: BookingDatePickerProps) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const booked = bookings.map(booking => new Date(booking.booking_date));
      setBookedDates(booked);
    }
  }, [bookings]);
  
  // Function to check if a date is booked
  const isDateBooked = (day: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, day));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          disabled={isDateBooked}
          modifiersStyles={{
            disabled: { backgroundColor: "#fee2e2", color: "#991b1b" }
          }}
          className="p-3"
        />
        <div className="border-t p-3 flex gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-100"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-100"></div>
            <span className="text-xs">Fully booked</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BookingDatePicker;