
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'name' | 'target' | 'equipment';
  setSearchType: (type: 'name' | 'target' | 'equipment') => void;
}

const SearchBar = ({ searchTerm, setSearchTerm, searchType, setSearchType }: SearchBarProps) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search exercises..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Tabs 
        defaultValue={searchType} 
        className="w-full" 
        onValueChange={(value) => setSearchType(value as 'name' | 'target' | 'equipment')}
      >
        <TabsList className="w-full">
          <TabsTrigger value="name" className="flex-1">Name</TabsTrigger>
          <TabsTrigger value="target" className="flex-1">Muscle</TabsTrigger>
          <TabsTrigger value="equipment" className="flex-1">Equipment</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SearchBar;
