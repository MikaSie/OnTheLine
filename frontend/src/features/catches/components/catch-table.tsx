import { Link } from "react-router-dom";
import { CalendarDays, MapPinned, Ruler, Waves } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { formatCoordinate, formatDateTime, formatLengthCm } from "../../../lib/formatters";
import type { Catch } from "../../../lib/types";

export function CatchTable({ catches }: { catches: Catch[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Species</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Logged</TableHead>
          <TableHead>Technique</TableHead>
          <TableHead>Length</TableHead>
          <TableHead className="text-right">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {catches.map((entry) => (
          <TableRow key={entry.catch_id}>
            <TableCell className="font-medium text-foreground">
              {entry.species || "Unspecified"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <span>
                  {formatCoordinate(entry.lat, "lat")} /{" "}
                  {formatCoordinate(entry.lon, "lon")}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{formatDateTime(entry.caught_at)}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-primary" />
                <span>{entry.technique_detail || "-"}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                <span>{formatLengthCm(entry.length_cm, "-")}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/catches/${entry.catch_id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
