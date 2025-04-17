
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  toggleFilter,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50 h-4 w-4" />
        <Input
          placeholder="Search venues..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        onClick={toggleFilter}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
};

export default SearchBar;
