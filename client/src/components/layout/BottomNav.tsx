import { Link, useLocation } from "wouter";
import { Users, Building, Table, ClipboardList, Star, BarChart3 } from "lucide-react";

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
    id: "departments",
    label: "Departamentos",
    icon: Building,
    path: "/departments"
  },
  {
    id: "forms",
    label: "Formulários",
    icon: ClipboardList,
    path: "/forms"
  },
  {
    id: "evaluations",
    label: "Avaliações",
    icon: Star,
    path: "/evaluations"
  }
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-30 px-2">
      <div className="grid grid-cols-5 h-18">
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
      </div>
    </div>
  );
}