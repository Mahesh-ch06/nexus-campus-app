
import React from "react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (catId: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => (
  <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
    <Button
      variant={selectedCategory === "" ? "default" : "outline"}
      size="sm"
      onClick={() => onSelect("")}
      className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition-all duration-200 ${
        selectedCategory === "" 
          ? "bg-primary text-primary-foreground shadow-lg scale-105" 
          : "bg-card/50 text-foreground border-border hover:border-primary/50 backdrop-blur-sm"
      }`}
    >
      🛍️ All
    </Button>
    {categories.map((c) => (
      <Button
        key={c.id}
        variant={selectedCategory === c.id ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(c.id)}
        className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition-all duration-200 ${
          selectedCategory === c.id 
            ? "bg-primary text-primary-foreground shadow-lg scale-105" 
            : "bg-card/50 text-foreground border-border hover:border-primary/50 backdrop-blur-sm"
        }`}
      >
        <span className="mr-2">{c.icon}</span>
        {c.name}
      </Button>
    ))}
  </div>
);
