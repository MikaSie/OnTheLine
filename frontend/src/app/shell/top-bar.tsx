import { Menu, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

import { BrandMark } from "../../components/brand/brand-mark";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../components/ui/dialog";

export function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <BrandMark className="[&>div:last-child>p:last-child]:hidden [&>div:last-child>p:first-child]:text-sm" />
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <NavLink to="/catches/new">
              <PlusCircle className="h-4 w-4" />
              Log
            </NavLink>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <div className="space-y-6">
                <BrandMark />
                <nav className="grid gap-3">
                  <NavLink
                    to="/"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium"
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/catches"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium"
                  >
                    Catch Log
                  </NavLink>
                  <NavLink
                    to="/catches/new"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 font-medium text-primary"
                  >
                    Log Catch
                  </NavLink>
                </nav>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
