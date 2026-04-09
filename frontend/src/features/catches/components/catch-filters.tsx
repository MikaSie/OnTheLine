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
}

export function CatchFilters({
  search,
  onSearchChange,
  technique,
  onTechniqueChange,
  techniques,
}: CatchFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1.8fr_1fr]">
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
          <SelectTrigger>
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
    </div>
  );
}
