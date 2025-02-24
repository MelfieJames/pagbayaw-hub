
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 mr-4">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search by product name or category..." 
        value={searchQuery} 
        onChange={e => onSearchChange(e.target.value)} 
        className="pl-10" 
      />
    </div>
  );
}
