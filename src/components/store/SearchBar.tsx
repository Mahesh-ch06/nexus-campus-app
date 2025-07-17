
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative mb-6">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
    <Input
      placeholder="Search for products, snacks, beverages..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="pl-12 pr-4 py-4 text-base border-2 border-border bg-card/50 backdrop-blur-sm rounded-xl focus:border-primary focus:ring-0 shadow-sm placeholder:text-muted-foreground"
    />
  </div>
);
