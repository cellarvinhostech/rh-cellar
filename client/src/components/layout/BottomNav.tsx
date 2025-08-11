import { Link, useLocation } from "wouter";
import { Users, ClipboardList, BarChart3, Menu } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./MobileNav";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    path: "/"
  },
  {
    id: "employees",
    label: "Funcionários",
    icon: Users,
    path: "/employees"
  },
  {
    id: "forms",
    label: "Formulários",
    icon: ClipboardList,
    path: "/forms"
  }
];

export function BottomNav() {
  const [location] = useLocation();
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-30 px-2">
        <div className="grid grid-cols-4 h-18">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link 
                key={item.id} 
                href={item.path}
                className="flex flex-col items-center justify-center px-1 py-3"
                data-testid={`bottom-nav-${item.id}`}
              >
                <div className={`flex flex-col items-center justify-center space-y-1.5 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setShowMobileNav(true)}
            className="flex flex-col items-center justify-center px-1 py-3"
            data-testid="bottom-nav-menu"
          >
            <div className="flex flex-col items-center justify-center space-y-1.5 text-slate-400">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium text-center leading-tight">
                Menu
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileNav && (
        <div className="lg:hidden">
          <MobileNav onClose={() => setShowMobileNav(false)} />
        </div>
      )}
    </>
  );
}