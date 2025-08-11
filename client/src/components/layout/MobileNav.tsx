import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, Building, Table, ClipboardList, Star, BarChart3, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

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

export function MobileNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        data-testid="mobile-menu-button"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            data-testid="mobile-menu-overlay"
          />
          
          {/* Mobile Menu */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3 className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="font-semibold text-slate-900">RH Performance</h1>
                      <p className="text-xs text-slate-500">Sistema de Avaliação</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                    data-testid="close-mobile-menu"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                {/* User Info */}
                {authState.user && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {authState.user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {authState.user.role}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link 
                      key={item.id} 
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                    >
                      <div 
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        data-testid={`mobile-nav-${item.id}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                  data-testid="mobile-logout-button"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}