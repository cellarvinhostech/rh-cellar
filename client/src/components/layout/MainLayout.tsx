import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col" data-testid="main-layout">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-18 lg:pb-0 transition-all duration-300" 
              style={{ marginLeft: 'var(--sidebar-width, 4rem)' }}
              data-testid="main-content">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
