import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToExcel, ExportData } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  data: ExportData[];
  filename?: string;
  disabled?: boolean;
  className?: string;
}

export function ExportButtons({ data, filename = "Relatório", disabled = false, className = "" }: ExportButtonsProps) {
  const { toast } = useToast();

  const handleExportPDF = () => {
    try {
      exportToPDF(data, filename);
      toast({
        title: "Exportação concluída",
        description: "Arquivo PDF baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(data, filename);
      toast({
        title: "Exportação concluída",
        description: "Arquivo Excel baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        onClick={handleExportPDF}
        disabled={disabled || data.length === 0}
        className="btn-secondary text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="export-pdf-button"
      >
        <FileDown className="w-4 h-4" />
        <span>PDF</span>
      </button>
      
      <button
        onClick={handleExportExcel}
        disabled={disabled || data.length === 0}
        className="btn-secondary text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="export-excel-button"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Excel</span>
      </button>
    </div>
  );
}