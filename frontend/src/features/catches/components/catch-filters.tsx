import { Search } from "lucide-react";

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

interface CatchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  technique: string;
  onTechniqueChange: (value: string) => void;
  techniques: string[];
  area: string;
  onAreaChange: (value: string) => void;
  areas: Array<{ key: string; label: string; count: number }>;
  sort: string;
  onSortChange: (value: string) => void;
}

export function CatchFilters({
  search,
  onSearchChange,
  technique,
  onTechniqueChange,
  techniques,
  area,
  onAreaChange,
  areas,
  sort,
  onSortChange,
}: CatchFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:grid-cols-[1.7fr_1fr_1fr_1fr]">
      <div className="space-y-2">
        <Label htmlFor="search">Search species or notes</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            className="pl-10"
            placeholder="Sea trout, rocks, morning tide..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Technique filter</Label>
        <Select value={technique} onValueChange={onTechniqueChange}>
          <SelectTrigger aria-label="Technique filter">
            <SelectValue placeholder="All techniques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All techniques</SelectItem>
            {techniques.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {entry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Area filter</Label>
        <Select value={area} onValueChange={onAreaChange}>
          <SelectTrigger aria-label="Area filter">
            <SelectValue placeholder="All areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {areas.map((entry) => (
              <SelectItem key={entry.key} value={entry.key}>
                {entry.label} ({entry.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger aria-label="Sort catches">
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="species">Species A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
