import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentType, SearchFilters } from '@/types';
import { useMediaQuery } from '@/hooks/use-mobile';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const searchRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search page with the query
      navigate(`/all-content?q=${encodeURIComponent(query)}`);
    }
  };

  const handleAdvancedSearch = () => {
    // Navigate to all-content page with advanced search UI
    navigate('/all-content?advanced=true');
  };

  return (
    <div ref={searchRef} className="relative ml-4">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="جستجو..."
          className={`w-64 md:w-80 pl-10 bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground`}
          value={query}
          onChange={handleInputChange}
        />
        
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Search className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
        )}
        
        {/* Advanced Search Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`${isMobile ? 'hidden' : 'block'} absolute -left-9 top-1.5 text-muted-foreground hover:text-primary transition duration-200 h-7 w-7 p-0`}
          onClick={handleAdvancedSearch}
          title="جستجوی پیشرفته"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
