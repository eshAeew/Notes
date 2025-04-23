import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FilterIcon,
  CalendarIcon,
  Tag,
  SortAsc,
  SortDesc,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SortOption = 'title-asc' | 'title-desc' | 'date-asc' | 'date-desc';
export type DateFilter = 'any' | 'today' | 'yesterday' | 'last-week' | 'last-month' | 'custom';

export interface FilterOptionsProps {
  onFilterChange: (filters: {
    sortBy: SortOption;
    dateFilter: DateFilter;
    tags: string[];
    customStartDate?: Date;
    customEndDate?: Date;
  }) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [dateFilter, setDateFilter] = useState<DateFilter>('any');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState(0);

  const handleApplyFilters = () => {
    onFilterChange({
      sortBy,
      dateFilter,
      tags,
      customStartDate,
      customEndDate,
    });
    
    // Count active filters for badge
    let count = 0;
    if (sortBy !== 'date-desc') count++;
    if (dateFilter !== 'any') count++;
    if (tags.length > 0) count++;
    
    setAppliedFilters(count);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setSortBy('date-desc');
    setDateFilter('any');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setTags([]);
    
    onFilterChange({
      sortBy: 'date-desc',
      dateFilter: 'any',
      tags: [],
    });
    
    setAppliedFilters(0);
    setIsOpen(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 text-muted-foreground hover:text-foreground flex items-center gap-1 relative"
          >
            <FilterIcon size={16} />
            <span>Filter</span>
            {appliedFilters > 0 && (
              <Badge 
                variant="secondary" 
                className="h-5 min-w-5 p-0 flex items-center justify-center text-xs font-semibold"
              >
                {appliedFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Filter & Sort Options</h3>
            
            {/* Sort by */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort by</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc" className="flex items-center gap-2">
                    <SortDesc size={14} /> Date (Newest)
                  </SelectItem>
                  <SelectItem value="date-asc" className="flex items-center gap-2">
                    <SortAsc size={14} /> Date (Oldest)
                  </SelectItem>
                  <SelectItem value="title-asc" className="flex items-center gap-2">
                    <SortAsc size={14} /> Title (A-Z)
                  </SelectItem>
                  <SelectItem value="title-desc" className="flex items-center gap-2">
                    <SortDesc size={14} /> Title (Z-A)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date filter */}
            <div className="space-y-2">
              <Label htmlFor="date-filter">Date filter</Label>
              <Select
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value as DateFilter)}
              >
                <SelectTrigger id="date-filter">
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-week">Last week</SelectItem>
                  <SelectItem value="last-month">Last month</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              
              {dateFilter === 'custom' && (
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-date" className="text-xs">Start date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left font-normal mt-1"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customStartDate ? (
                              customStartDate.toLocaleDateString()
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={setCustomStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-xs">End date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left font-normal mt-1"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customEndDate ? (
                              customEndDate.toLocaleDateString()
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={setCustomEndDate}
                            initialFocus
                            disabled={(date) => 
                              customStartDate ? date < customStartDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tags filter */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input 
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 shrink-0"
                  onClick={addTag}
                >
                  <Tag size={16} />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1 pl-2 pr-1"
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        <X size={10} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
              <Button 
                size="sm"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}