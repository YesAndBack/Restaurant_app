
import React from "react";
import { MapPin, Users } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import BookingDatePicker from "@/components/BookingDatePicker";
import { BookingDay } from "@/types/booking";

interface FilterPanelProps {
  location: string;
  setLocation: (location: string) => void;
  category: string;
  setCategory: (category: string) => void;
  capacity: number[];
  setCapacity: (capacity: number[]) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  hideBooked: boolean;
  setHideBooked: (hide: boolean) => void;
  bookingInfo: BookingDay[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  location,
  setLocation,
  category,
  setCategory,
  capacity,
  setCapacity,
  selectedDate,
  setSelectedDate,
  hideBooked,
  setHideBooked,
  bookingInfo,
}) => {
  return (
    <div className="bg-background border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Location</label>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-foreground/50" />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Any location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any location</SelectItem>
              <SelectItem value="Astana">Astana</SelectItem>
              <SelectItem value="Almaty">Almaty</SelectItem>
              <SelectItem value="Shymkent">Shymkent</SelectItem>
              <SelectItem value="Karagandy">Karagandy</SelectItem>
              <SelectItem value="Pavlodar">Pavlodar</SelectItem>
              <SelectItem value="Aktau">Aktau</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Fine Dining">Wedding</SelectItem>
            <SelectItem value="Rooftop">Birthday</SelectItem>
            <SelectItem value="Luxury">Party</SelectItem>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Classic">Classic</SelectItem>
            <SelectItem value="Seafood">Celebration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Capacity: {capacity[0]}+ guests
        </label>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-foreground/50" />
          <div className="w-full px-2">
            <Slider
              value={capacity}
              onValueChange={setCapacity}
              max={200}
              min={10}
              step={10}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Date</label>
        <BookingDatePicker
          date={selectedDate}
          onSelect={setSelectedDate}
          bookingInfo={bookingInfo}
          minGuests={capacity[0] || 1}
        />
        {selectedDate && (
          <div className="mt-2 flex items-center">
            <label className="text-sm flex items-center">
              <input 
                type="checkbox" 
                checked={hideBooked} 
                onChange={(e) => setHideBooked(e.target.checked)}
                className="mr-2"
              />
              Hide fully booked venues
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
