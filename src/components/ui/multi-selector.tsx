import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";

interface Option {
  _id: string;
  name: string;
  description?: string;
}

interface MultiSelectorProps {
  options: Option[];
  selectedOptions: Option[];
  onSelectionChange: (selected: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
}

export function MultiSelector({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder = "Search and select options...",
  disabled = false,
  className,
  searchValue = "",
  onSearchChange,
  loading = false,
}: MultiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = searchValue || internalSearch;
  const handleSearchChange = onSearchChange || setInternalSearch;

  // Filter options that aren't already selected with memoization for performance
  const availableOptions = useMemo(() => {
    return options.filter(
      (option) =>
        !selectedOptions.some((selected) => selected._id === option._id) &&
        option.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, selectedOptions, search]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionSelect = (option: Option) => {
    onSelectionChange([...selectedOptions, option]);
    handleSearchChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOptionRemove = (optionId: string) => {
    onSelectionChange(
      selectedOptions.filter((option) => option._id !== optionId),
    );
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected Options Display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option._id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{option.name}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 cursor-pointer hover:bg-transparent"
                  onClick={() => handleOptionRemove(option._id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : availableOptions.length > 0 ? (
            availableOptions.map((option) => (
              <button
                key={option._id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                onClick={() => handleOptionSelect(option)}
              >
                <div className="font-medium">{option.name}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {search ? "No options found" : "No more options available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
