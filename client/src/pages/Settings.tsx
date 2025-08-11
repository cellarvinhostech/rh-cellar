import { useState } from "react";
import { Settings as SettingsIcon, Building, Users, Briefcase, UserCheck, Shield, FileText, Mail, Database, Clock, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

type SettingsCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  items: SettingsItem[];
};

type SettingsItem = {
  id: string;
  name: string;
  description: string;
  status: "active" | "development" | "planned";
  route?: string;
};

export default function Settings() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const settingsCategories: SettingsCategory[] = [
    {
      id: "general",
      name: "Configurações Gerais",
      description: "Configurações básicas do sistema",
      icon: <SettingsIcon className="w-5 h-5" />,
      items: [
        {
          id: "company-info",
          name: "Informações da Empresa",
          description: "Dados básicos da organização",
          status: "development"
        },
        {
          id: "email-config",
          name: "Configurações de Email",
          description: "Configuração de envio de emails",
          status: "development"
        },
        {
          id: "security",
          name: "Segurança",
          description: "Configurações de segurança do sistema",
          status: "development"
        },
        {
          id: "backup",
          name: "Backup e Restauração",
          description: "Configurações de backup dos dados",
          status: "development"
        }
      ]
    },
    {
      id: "workflow",
      name: "Fluxo de Trabalho",
      description: "Configurações relacionadas aos processos",
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          id: "departments",
          name: "Departamentos",
          description: "Gerencie departamentos da empresa",
          status: "active",
          route: "/departments"
        },
        {
          id: "positions",
          name: "Cargos",
          description: "Configure cargos e funções",
          status: "active",
          route: "/positions"
        },
        {
          id: "hierarchy",
          name: "Níveis Hierárquicos",
          description: "Defina a estrutura hierárquica",
          status: "active",
          route: "/hierarchy-levels"
        },
        {
          id: "request-types",
          name: "Tipos de Solicitações",
          description: "Configure tipos de solicitações",
          status: "development"
        },
        {
          id: "sla-levels",
          name: "Níveis de Resposta (SLA)",
          description: "Configure níveis de resposta (sla)",
          status: "development"
        },
        {
          id: "status",
          name: "Status dos Processos",
          description: "Configure status dos processos",
          status: "development"
        },
        {
          id: "priorities",
          name: "Prioridades",
          description: "Configure prioridades dos processos",
          status: "development"
        },
        {
          id: "workdays",
          name: "Jornadas de Trabalho",
          description: "Configure jornadas de trabalho",
          status: "development"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "development":
        return "bg-yellow-100 text-yellow-800";
      case "planned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "development":
        return "Em desenvolvimento";
      case "planned":
        return "Planejado";
      default:
        return status;
    }
  };

  const handleItemClick = (item: SettingsItem) => {
    if (item.route && item.status === "active") {
      setLocation(item.route);
    }
  };

  const filteredCategories = settingsCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const selectedCategoryData = settingsCategories.find(cat => cat.id === selectedCategory);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configurações</h1>
          <p className="text-slate-600">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Buscar configurações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-settings"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categorias</h3>
              {settingsCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  data-testid={`category-${category.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={selectedCategory === category.id ? "text-blue-600" : "text-gray-400"}>
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{category.name}</p>
                      <p className="text-xs text-gray-500 truncate">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Header */}
            {selectedCategoryData && (
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-blue-600">
                    {selectedCategoryData.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedCategoryData.name}
                  </h2>
                </div>
                <p className="text-gray-600">{selectedCategoryData.description}</p>
              </div>
            )}

            {/* System Info (only for general category) */}
            {selectedCategory === "general" && (
              <div className="mb-6">
                <Card className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-blue-600" />
                    Informações do Sistema
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Versão</div>
                      <div className="text-lg font-semibold text-blue-600">2.0.0</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="text-lg font-semibold text-green-600">Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Ambiente</div>
                      <div className="text-lg font-semibold text-purple-600">Desenvolvimento</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Banco</div>
                      <div className="text-lg font-semibold text-orange-600">Local</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      Última Atualização: 08 de Agosto de 2025 - 14:30
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Settings Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 lg:pb-6">
              {(searchTerm ? filteredCategories.flatMap(cat => cat.items) : selectedCategoryData?.items || []).map((item) => (
                <Card 
                  key={item.id} 
                  className={`p-4 transition-all ${
                    item.status === "active" 
                      ? "hover:shadow-md cursor-pointer hover:border-blue-200" 
                      : "opacity-75"
                  }`}
                  onClick={() => handleItemClick(item)}
                  data-testid={`setting-item-${item.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                      {item.status === "development" && (
                        <p className="text-xs text-yellow-600 mt-2">
                          Clique para configurar tipos de solicitações
                        </p>
                      )}
                      {item.status === "active" && item.route && (
                        <p className="text-xs text-blue-600 mt-2">
                          Clique para acessar
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {searchTerm && filteredCategories.flatMap(cat => cat.items).length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma configuração encontrada
                </h3>
                <p className="text-gray-600">
                  Tente buscar por outros termos ou navegue pelas categorias
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}