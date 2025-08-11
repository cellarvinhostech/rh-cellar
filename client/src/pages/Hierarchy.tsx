import { Download, Edit, Building } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { OrganizationChart } from "@/components/hierarchy/OrganizationChart";
import { useHRData } from "@/hooks/use-hr-data";
import { useToast } from "@/hooks/use-toast";

export default function Hierarchy() {
  const { getEmployeesWithDetails } = useHRData();
  const { toast } = useToast();
  
  const employees = getEmployeesWithDetails();

  const handleExportHierarchy = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação da hierarquia será implementada em breve.",
    });
  };

  const handleEditHierarchy = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição da estrutura hierárquica será implementada em breve.",
    });
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900" data-testid="hierarchy-title">
                Hierarquia Organizacional
              </h2>
              <p className="text-slate-600">Visualize e gerencie a estrutura da empresa</p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="btn-secondary"
                onClick={handleExportHierarchy}
                data-testid="export-hierarchy-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button 
                className="btn-primary"
                onClick={handleEditHierarchy}
                data-testid="edit-hierarchy-button"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Estrutura
              </button>
            </div>
          </div>
        </header>

        {/* Hierarchy Content */}
        <div className="flex-1 overflow-auto p-6">
          {employees.length === 0 ? (
            <div className="text-center py-12" data-testid="no-hierarchy-message">
              <Building className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma estrutura encontrada</h3>
              <p className="text-slate-600">Adicione funcionários para visualizar a hierarquia organizacional.</p>
            </div>
          ) : (
            <OrganizationChart employees={employees} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
