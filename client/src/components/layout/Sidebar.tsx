import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, Building, Table, ClipboardList, Star, BarChart3, Settings, Menu, ChevronLeft } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside 
      className={`${isExpanded ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out`} 
      data-testid="sidebar"
    >
      {/* Header */}
      <div className={`${isExpanded ? 'p-6' : 'py-4 px-3'} border-b border-slate-200 transition-all duration-300`}>
        {isExpanded ? (
          <div className="flex items-center justify-between">
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
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              data-testid="collapse-sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <Tooltip content="Expandir menu">
              <button
                onClick={() => setIsExpanded(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-purple-50 hover:text-primary transition-colors text-slate-400"
                data-testid="expand-sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 ${isExpanded ? 'p-4' : 'px-3 py-4'} transition-all duration-300`} data-testid="navigation">
        <ul className={`${isExpanded ? 'space-y-2' : 'space-y-4'}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.id}>
                <Link href={item.path}>
                  {isExpanded ? (
                    <span 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-white shadow-md' 
                          : 'text-slate-500 hover:bg-purple-50 hover:text-primary'
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </span>
                  ) : (
                    <Tooltip content={item.label} disabled={isExpanded}>
                      <span 
                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-slate-400 hover:bg-purple-50 hover:text-primary'
                        }`}
                        data-testid={`nav-${item.id}`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                    </Tooltip>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={`${isExpanded ? 'p-4' : 'px-3 pb-4'} border-t border-slate-200 transition-all duration-300`}>
        {isExpanded ? (
          <div className="flex items-center space-x-3">
            <img 
              src="https://pixabay.com/get/gadfaeda8f45dac1f50485b9f6697d3ce0712f46d6e1d863b67553e7660784f8c9f44e982174e664fa7ca6fc89ff1104b2ebff8e1df9df0aeb75e7993ce97e90b_1280.jpg" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
              data-testid="user-avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900" data-testid="user-name">Ana Silva</p>
              <p className="text-xs text-slate-500" data-testid="user-role">Gerente RH</p>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              data-testid="settings-button"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content="Ana Silva - Gerente RH">
              <img 
                src="https://pixabay.com/get/gadfaeda8f45dac1f50485b9f6697d3ce0712f46d6e1d863b67553e7660784f8c9f44e982174e664fa7ca6fc89ff1104b2ebff8e1df9df0aeb75e7993ce97e90b_1280.jpg" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100 cursor-pointer"
                data-testid="user-avatar"
              />
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}
