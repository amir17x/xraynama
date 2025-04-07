import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative ml-4">
      <div className="flex items-center relative">
        <div className="relative w-full max-w-[200px]">
          <Input
            type="text"
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-12 h-10 text-sm bg-muted/50 border-muted"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <Button 
          type="submit" 
          variant="ghost" 
          size="sm"
          className="absolute left-0 text-primary"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}