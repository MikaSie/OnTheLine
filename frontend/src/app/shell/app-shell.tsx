import { Outlet } from "react-router-dom";

import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

export function AppShell() {
  return (
    <div className="min-h-screen lg:flex">
      <SidebarNav />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-7xl animate-fade-up space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
