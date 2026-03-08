import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (value: string) => void;
  mediumFilter: string;
  onMediumFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  years: string[];
}

export const CatalogFilters = ({
  search,
  onSearchChange,
  yearFilter,
  onYearFilterChange,
  sizeFilter,
  onSizeFilterChange,
  mediumFilter,
  onMediumFilterChange,
  statusFilter,
  onStatusFilterChange,
  years,
}: CatalogFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Select value={yearFilter} onValueChange={onYearFilterChange}>
        <SelectTrigger className="w-[100px] h-9 text-xs">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sizeFilter} onValueChange={onSizeFilterChange}>
        <SelectTrigger className="w-[90px] h-9 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sizes</SelectItem>
          <SelectItem value="S">S</SelectItem>
          <SelectItem value="M">M</SelectItem>
          <SelectItem value="L">L</SelectItem>
        </SelectContent>
      </Select>

      <Select value={mediumFilter} onValueChange={onMediumFilterChange}>
        <SelectTrigger className="w-[110px] h-9 text-xs">
          <SelectValue placeholder="Medium" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Mediums</SelectItem>
          <SelectItem value="PHOTO">Photo</SelectItem>
          <SelectItem value="POW">POW</SelectItem>
          <SelectItem value="PAINTING">Painting</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[110px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="reserved">Reserved</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
