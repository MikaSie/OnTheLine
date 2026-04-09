import { BarChart3, Fish, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

import { BrandMark } from "../../components/brand/brand-mark";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/catches", label: "Catch Log", icon: Fish },
];

export function SidebarNav() {
  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-white/10 bg-black/20 px-6 py-8 lg:flex lg:flex-col">
      <BrandMark />
      <div className="mt-10 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-white/10 hover:bg-white/[0.03] hover:text-foreground",
                isActive && "border-primary/25 bg-primary/10 text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto">
        <Button asChild size="lg" className="w-full justify-center">
          <NavLink to="/catches/new">
            <PlusCircle className="h-4 w-4" />
            Log Catch
          </NavLink>
        </Button>
      </div>
    </aside>
  );
}
