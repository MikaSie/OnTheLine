import { Link } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { formatCoordinate, formatDateTime } from "../../../lib/formatters";
import type { Catch } from "../../../lib/types";

export function CatchTable({ catches }: { catches: Catch[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Species</TableHead>
          <TableHead>Technique</TableHead>
          <TableHead>Coordinates</TableHead>
          <TableHead>Logged</TableHead>
          <TableHead className="text-right">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {catches.map((entry) => (
          <TableRow key={entry.catch_id}>
            <TableCell className="font-medium text-foreground">
              {entry.species || "Unspecified"}
            </TableCell>
            <TableCell>{entry.technique || "Unspecified"}</TableCell>
            <TableCell>
              {formatCoordinate(entry.lat, "lat")} /{" "}
              {formatCoordinate(entry.lon, "lon")}
            </TableCell>
            <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
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
