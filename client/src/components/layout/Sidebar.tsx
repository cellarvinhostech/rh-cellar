import { Link, useLocation } from "wouter";
import { Users, Building, Table, ClipboardList, Star, BarChart3, Settings } from "lucide-react";

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
    id: "hierarchy",
    label: "Hierarquia",
    icon: Table,
    path: "/hierarchy"
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

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4" data-testid="sidebar">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
          <BarChart3 className="text-white w-6 h-6" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1" data-testid="navigation">
        <ul className="space-y-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.id}>
                <Link href={item.path}>
                  <span 
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-slate-400 hover:bg-purple-50 hover:text-primary'
                    }`}
                    data-testid={`nav-${item.id}`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="mt-4">
        <img 
          src="https://pixabay.com/get/gadfaeda8f45dac1f50485b9f6697d3ce0712f46d6e1d863b67553e7660784f8c9f44e982174e664fa7ca6fc89ff1104b2ebff8e1df9df0aeb75e7993ce97e90b_1280.jpg" 
          alt="Profile" 
          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
          data-testid="user-avatar"
        />
      </div>
    </aside>
  );
}
