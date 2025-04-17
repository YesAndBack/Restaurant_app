
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign } from "lucide-react";

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  category: string;
  capacity: number;
  rating: number;
  averagePrice?: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  location,
  category,
  capacity,
  rating,
  averagePrice,
}) => {
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10"></div>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Fallback image if the provided one fails to load
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
            }}
          />
          <Badge className="absolute top-3 right-3 z-20">{category}</Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm font-medium bg-secondary px-2 py-0.5 rounded">
              ★ {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
            </div>
          </div>
          <div className="flex items-center text-sm text-foreground/70 mb-2">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-foreground/70">
              <Users className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">Up to {capacity} guests</span>
            </div>
            {averagePrice && (
              <div className="flex items-center text-sm text-foreground/70">
                <DollarSign className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="font-medium">${averagePrice}/person</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RestaurantCard;
