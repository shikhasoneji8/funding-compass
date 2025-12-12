import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSuggestion {
  display_name: string;
  place_id: number;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

const getCountryFlag = (countryCode?: string): string => {
  if (!countryCode) return "";
  const code = countryCode.toUpperCase();
  const offset = 127397;
  return String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + offset));
};

const formatLocationDisplay = (suggestion: LocationSuggestion): string => {
  const addr = suggestion.address;
  if (!addr) return suggestion.display_name;
  
  const city = addr.city || addr.town || addr.village || addr.municipality;
  const state = addr.state;
  const country = addr.country;
  
  if (city && state && country) {
    return `${city}, ${state}, ${country}`;
  } else if (city && country) {
    return `${city}, ${country}`;
  } else if (state && country) {
    return `${state}, ${country}`;
  }
  
  return suggestion.display_name;
};

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  id?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search location...",
  error,
  id,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use featuretype=city to prioritize cities and add more results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1&featuretype=city`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      let data: LocationSuggestion[] = await response.json();
      
      // If no city results, fallback to general search
      if (data.length === 0) {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        data = await fallbackResponse.json();
      }
      
      // Filter and sort to prioritize cities/towns over counties/regions
      const prioritized = data.sort((a, b) => {
        const aIsCity = a.address?.city || a.address?.town || a.address?.village;
        const bIsCity = b.address?.city || b.address?.town || b.address?.village;
        if (aIsCity && !bIsCity) return -1;
        if (!aIsCity && bIsCity) return 1;
        return 0;
      });
      
      // Remove duplicates based on formatted display
      const seen = new Set<string>();
      const unique = prioritized.filter(item => {
        const display = formatLocationDisplay(item);
        if (seen.has(display)) return false;
        seen.add(display);
        return true;
      }).slice(0, 6);
      
      setSuggestions(unique);
      setIsOpen(unique.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSelect = (suggestion: LocationSuggestion) => {
    const formattedLocation = formatLocationDisplay(suggestion);
    setQuery(formattedLocation);
    onChange(formattedLocation);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          error={error}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ul className="py-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-colors flex items-center gap-2",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-lg shrink-0">
                  {getCountryFlag(suggestion.address?.country_code) || "🌍"}
                </span>
                <span className="line-clamp-1">{formatLocationDisplay(suggestion)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
