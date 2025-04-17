
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { BookingDay } from "@/types/booking";

interface BookingDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  bookingInfo: BookingDay[];
  minGuests: number;
}

const BookingDatePicker = ({
  date,
  onSelect,
  bookingInfo,
  minGuests
}: BookingDatePickerProps) => {
  // Create a map of dates to their booking status for quick access
  const dateStatusMap = new Map<string, { isFullyBooked: boolean; availableCapacity: number }>();
  
  bookingInfo.forEach((day) => {
    dateStatusMap.set(day.date, {
      isFullyBooked: day.isFullyBooked,
      availableCapacity: day.availableCapacity
    });
  });
  
  // Custom modification to the day component that preserves clickability
  const renderDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const status = dateStatusMap.get(dateStr);
    
    // Skip rendering custom elements if we don't have booking info
    if (!status) return <div className="relative">{day.getDate()}</div>;
    
    // const isAvailable = !status.isFullyBooked && status.availableCapacity >= minGuests;
    const isAvailable = status.availableCapacity >= minGuests;
    
    return (
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full",
          status.isFullyBooked ? "bg-red-200" : 
            (status.availableCapacity < minGuests ? "bg-orange-200" : "bg-green-200"),
          "opacity-60 pointer-events-none" // Make this non-interactive
        )} />
        <div className="relative z-2">{day.getDate()}</div>
      </div>
    );
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
          components={{
            // Day: ({ date: dayDate, ...props }) => (
            //   <div {...props}>
            //     {renderDay(dayDate)}
            //   </div>
            // ),
          }}
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="border-t p-3 flex gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-200"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-orange-200"></div>
            <span className="text-xs">Limited capacity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-200"></div>
            <span className="text-xs">Fully booked</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BookingDatePicker;
