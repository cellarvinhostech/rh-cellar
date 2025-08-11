import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
  salary?: number;
}

export const exportToPDF = (data: ExportData[], title: string = 'Relatório de Funcionários') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Table
  const tableColumn = ['Nome', 'Email', 'Departamento', 'Cargo', 'Status', 'Data Contratação'];
  const tableRows: string[][] = [];

  data.forEach(employee => {
    const employeeData = [
      employee.name,
      employee.email,
      employee.department,
      employee.position,
      employee.status === 'active' ? 'Ativo' : 'Inativo',
      new Date(employee.hireDate).toLocaleDateString('pt-BR')
    ];
    tableRows.push(employeeData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [139, 92, 246], // Primary color
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportToExcel = (data: ExportData[], title: string = 'Relatório de Funcionários') => {
  // Prepare data for Excel
  const excelData = data.map(employee => ({
    'Nome': employee.name,
    'Email': employee.email,
    'Departamento': employee.department,
    'Cargo': employee.position,
    'Status': employee.status === 'active' ? 'Ativo' : 'Inativo',
    'Data de Contratação': new Date(employee.hireDate).toLocaleDateString('pt-BR'),
    'Salário': employee.salary ? `R$ ${employee.salary.toLocaleString('pt-BR')}` : 'Não informado'
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Nome
    { wch: 25 }, // Email
    { wch: 15 }, // Departamento
    { wch: 15 }, // Cargo
    { wch: 10 }, // Status
    { wch: 15 }, // Data de Contratação
    { wch: 12 }, // Salário
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportDashboardToPDF = (stats: any, activities: any[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Dashboard - Analytics de RH', 20, 20);
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Statistics section
  doc.setFontSize(14);
  doc.text('Estatísticas Gerais:', 20, 50);
  
  doc.setFontSize(12);
  doc.text(`• Total de Funcionários: ${stats.totalEmployees}`, 25, 60);
  doc.text(`• Avaliações Pendentes: ${stats.pendingEvaluations}`, 25, 70);
  doc.text(`• Avaliações Concluídas: ${stats.completedEvaluations}`, 25, 80);
  doc.text(`• Departamentos: ${stats.departments}`, 25, 90);
  
  // Recent activities
  if (activities && activities.length > 0) {
    doc.setFontSize(14);
    doc.text('Atividades Recentes:', 20, 110);
    
    let yPos = 120;
    activities.slice(0, 10).forEach((activity, index) => {
      doc.setFontSize(10);
      const activityText = `${index + 1}. ${activity.description}`;
      doc.text(activityText, 25, yPos);
      yPos += 10;
    });
  }
  
  // Save the PDF
  doc.save(`dashboard-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
};