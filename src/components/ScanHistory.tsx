import React, { useState, useEffect } from 'react';
import { ScanRecord, MealType, ScanStatus } from '../types';
import { 
  Search, ClipboardList, AlertTriangle, AlertCircle, CheckCircle2, 
  Download, FileSpreadsheet, Trash2, Calendar, Filter, X, ShieldAlert, ArrowUpRight,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';

interface ScanHistoryProps {
  records: ScanRecord[];
  onClearRecords: () => void;
  onResetToDefault: () => void;
}

export default function ScanHistory({ records, onClearRecords, onResetToDefault }: ScanHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [autoPrintOnOpen, setAutoPrintOnOpen] = useState(false);

  useEffect(() => {
    if (showReportModal && autoPrintOnOpen) {
      const timer = setTimeout(() => {
        window.print();
        setAutoPrintOnOpen(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showReportModal, autoPrintOnOpen]);

  // Filter records
  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      record.names.toLowerCase().includes(searchLower) ||
      record.lastNames.toLowerCase().includes(searchLower) ||
      record.dni.includes(searchTerm) ||
      record.service.toLowerCase().includes(searchLower) ||
      record.role.toLowerCase().includes(searchLower);

    const matchesMeal = selectedMealFilter === 'ALL' || record.mealType === selectedMealFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || record.status === selectedStatusFilter;

    return matchesSearch && matchesMeal && matchesStatus;
  });

  const getStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case 'VALID_COMPLETED':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#00A089]/8 text-[#00A089] border border-[#00A089]/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#00A089] rounded-full"></span>
            Registrado
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#B51A82]/8 text-[#B51A82] border border-[#B51A82]/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#B51A82] rounded-full animate-ping"></span>
            Duplicado Bloqueado
          </span>
        );
      case 'OUT_OF_SCHEDULE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#F9B719]/10 text-[#342D86] border border-[#F9B719]/25 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#F9B719] rounded-full"></span>
            Fuera de Horario
          </span>
        );
      case 'INVALID_CODE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#B51A82]/8 text-[#B51A82] border border-[#B51A82]/15 inline-flex items-center gap-1">
            No Registrado
          </span>
        );
      case 'SUSPENDED_WORKER':
        return (
          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#582A85]/8 text-[#582A85] border border-[#582A85]/15 inline-flex items-center gap-1">
            No Autorizado
          </span>
        );
    }
  };

  // Stats calculation for reporting
  const validScans = records.filter(r => r.status === 'VALID_COMPLETED' || (r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin));
  const duplicateAttempts = records.filter(r => r.status === 'DUPLICATE').length;
  const outOfScheduleCount = records.filter(r => r.status === 'OUT_OF_SCHEDULE').length;
  const totalCaloriesServed = validScans.reduce((total, r) => total + r.calories, 0);

  // Group scans by service
  const serviceCounts: Record<string, number> = {};
  validScans.forEach(r => {
    serviceCounts[r.service] = (serviceCounts[r.service] || 0) + 1;
  });

  const generateAndDownloadJSONReport = () => {
    // Generate a beautiful JSON report representing clinical consumption logs
    const reportData = {
      hospitalName: 'Instituto Nacional de Salud del Niño',
      reportDate: new Date().toISOString().split('T')[0],
      shiftInfo: 'Turno Rotativo Diario de Alimentación',
      summary: {
        totalProcessedTickets: records.length,
        peopleSatiated: validScans.length,
        caloriesDistributed: totalCaloriesServed,
        duplicatesPrevented: duplicateAttempts,
        outOfScheduleAutorizados: records.filter(r => r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin).length
      },
      consumedWorkers: validScans.map(s => ({
        dni: s.dni,
        nombre: `${s.lastNames}, ${s.names}`,
        servicio: s.service,
        cargo: s.role,
        ingesta: s.mealType,
        horaEscaneo: s.scanTime,
        calorias: s.calories,
        metodo: s.authByAdmin ? 'Autorización Administrador especial' : 'Lector de barra estándar'
      })),
      failuresEncountered: records.filter(r => r.status !== 'VALID_COMPLETED' && !r.authByAdmin).map(s => ({
        dni: s.dni,
        nombre: `${s.lastNames}, ${s.names}`,
        error: s.status,
        mensaje: s.statusMessage,
        hora: s.scanTime
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Reporte_Alimentacion_${reportData.reportDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadCSV = () => {
    const headers = ['DNI', 'Trabajador', 'Servicio', 'Rol', 'Horario', 'Hora de Escaneo', 'Estado', 'Nutrición (Calorías)'];
    const rows = records.map(r => [
      r.dni,
      `"${r.lastNames}, ${r.names}"`,
      `"${r.service}"`,
      `"${r.role}"`,
      r.mealType,
      r.scanTime,
      r.status,
      r.calories
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Registro_Diario_Consumo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [15, 23, 42]; // deep slate
      const accentColor = [13, 148, 136]; // teal-600
      const lightRowColor = [248, 250, 252]; // slate-50

      // Set title font
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('INSTITUTO NACIONAL DE SALUD DEL NIÑO', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('DEPARTAMENTO DE NUTRICIÓN Y ASISTENCIA DE PERSONAL', 14, 25);
      doc.text('Dirección: Av. Brasil 600, Breña, Lima | Central: (01) 330-0066', 14, 29);

      // Date
      const todayStr = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Reporte: ${todayStr}`, 145, 29);

      // Draw horizontal separator line
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.5);
      doc.line(14, 33, 196, 33);

      // Section title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('REPORTE CONSOLIDADO DIARIO DE ALIMENTACIÓN', 14, 40);

      // Quick Stats Cards - Draw rectangles + labels
      // Card 1: Raciones Válidas
      doc.setFillColor(240, 253, 250); // teal-50
      doc.setDrawColor(13, 148, 136); // teal-600
      doc.rect(14, 45, 40, 20, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(13, 148, 136);
      doc.text('RACIONES ENTREGADAS', 16, 50);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${validScans.length}`, 16, 59);

      // Card 2: Duplicados Denegados
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(185, 28, 28); // red-700
      doc.rect(59, 45, 40, 20, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text('DUPLICADOS BLOQUEADOS', 61, 50);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${duplicateAttempts}`, 61, 59);

      // Card 3: Fuera de Horario
      doc.setFillColor(255, 251, 235); // amber-50
      doc.setDrawColor(217, 119, 6); // amber-600
      doc.rect(104, 45, 40, 20, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(217, 119, 6);
      doc.text('FUERA DE HORARIO', 106, 50);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${outOfScheduleCount}`, 106, 59);

      // Card 4: Calorías Totales
      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(7, 89, 133); // sky-700
      doc.rect(149, 45, 47, 20, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(7, 89, 133);
      doc.text('CALORÍAS ENTREGADAS', 151, 50);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${totalCaloriesServed} kcal`, 151, 59);

      // Table Header
      let currentY = 74;
      doc.setFillColor(15, 23, 42); // dark background for table header
      doc.rect(14, currentY, 182, 7, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('DNI', 16, currentY + 5);
      doc.text('Trabajador', 36, currentY + 5);
      doc.text('Servicio Clínico', 86, currentY + 5);
      doc.text('Ración / Turno', 136, currentY + 5);
      doc.text('Hora', 163, currentY + 5);
      doc.text('Resultado', 176, currentY + 5);

      // Table Rows
      doc.setFont('Helvetica', 'normal');
      currentY += 7;

      const printableRecords = records.length === 0 ? [] : records;
      printableRecords.slice(0, 32).forEach((r, idx) => {
        // Physical page boundary
        if (currentY > 262) {
          doc.addPage();
          currentY = 20;

          // Draw header again on new page
          doc.setFillColor(15, 23, 42);
          doc.rect(14, currentY, 182, 7, 'F');
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('DNI', 16, currentY + 5);
          doc.text('Trabajador', 36, currentY + 5);
          doc.text('Servicio Clínico', 86, currentY + 5);
          doc.text('Ración / Turno', 136, currentY + 5);
          doc.text('Hora', 163, currentY + 5);
          doc.text('Resultado', 176, currentY + 5);
          
          doc.setFont('Helvetica', 'normal');
          currentY += 7;
        }

        // Zebra striping
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY, 182, 5.8, 'F');
        }

        // Border bottom for rows
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.15);
        doc.line(14, currentY + 5.8, 196, currentY + 5.8);

        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.text(r.dni, 16, currentY + 4);
        
        const fullName = `${r.lastNames}, ${r.names}`;
        const truncatedName = fullName.length > 25 ? fullName.substring(0, 25) + '...' : fullName;
        doc.text(truncatedName, 36, currentY + 4);
        
        const truncatedService = r.service.length > 25 ? r.service.substring(0, 25) + '...' : r.service;
        doc.text(truncatedService, 86, currentY + 4);
        
        doc.text(r.mealType, 136, currentY + 4);
        doc.text(r.scanTime, 163, currentY + 4);

        // Color status labels
        if (r.status === 'VALID_COMPLETED') {
          doc.setTextColor(13, 148, 136); // Teal
          doc.setFont('Helvetica', 'bold');
          doc.text('Acreditado', 176, currentY + 4);
        } else if (r.status === 'DUPLICATE') {
          doc.setTextColor(185, 28, 28); // Red
          doc.setFont('Helvetica', 'bold');
          doc.text('Duplicado', 176, currentY + 4);
        } else if (r.status === 'OUT_OF_SCHEDULE') {
          doc.setTextColor(217, 119, 6); // Amber
          doc.setFont('Helvetica', 'bold');
          doc.text('Fuera Hor.', 176, currentY + 4);
        } else {
          doc.setTextColor(100, 116, 139); // Slate
          doc.setFont('Helvetica', 'bold');
          doc.text('Denegado', 176, currentY + 4);
        }
        doc.setFont('Helvetica', 'normal');
        currentY += 5.8;
      });

      if (records.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('No se encontraron registros de ración de alimentación cargados para hoy.', 20, currentY + 10);
        currentY += 15;
      }

      // Safe signature section positioning
      if (currentY > 235) {
        doc.addPage();
        currentY = 20;
      }

      // Bottom Signature Lines
      currentY += 12;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(30, currentY + 12, 80, currentY + 12);
      doc.line(130, currentY + 12, 180, currentY + 12);

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setFont('Helvetica', 'bold');
      doc.text('SUPERVISOR DE NUTRICIÓN INSN', 31, currentY + 16);
      doc.text('VALIDEZ DE RACIONES DIARIAS', 31, currentY + 20);

      doc.text('ADMINISTRACIÓN DE PERSONAL INSN', 131, currentY + 16);
      doc.text('CONTROL BIOMÉTRICO / TICKET DE CONSUMO', 131, currentY + 20);

      const fileDate = new Date().toISOString().split('T')[0];
      doc.save(`Reporte_Alimentacion_INSN_${fileDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar el archivo PDF consolidado');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6" id="scan-history">
      
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#342D86]/10 text-[#342D86]">
            <ClipboardList className="w-5 h-5" id="history-header-icon" />
          </div>
          <div>
            <h3 className="font-sans font-black text-[#342D86] text-lg uppercase tracking-wide">Historial y Control Diario</h3>
            <p className="text-xs text-slate-500">Registro en tiempo real de alimentos suministrados hoy</p>
          </div>
        </div>

        {/* Reporting and wipe actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="bg-[#582A85] hover:bg-[#582A85]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            id="btn-gen-report"
          >
            <Calendar className="w-4 h-4" />
            Generar Reporte Turno
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            className="bg-[#342D86] hover:bg-[#342D86]/90 text-white border border-[#342D86]/10 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Exportar archivo CSV para Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            className="bg-[#00A089] hover:bg-[#00A089]/90 text-white border border-[#00A089]/10 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Descargar archivo PDF oficial al instante"
            id="btn-export-pdf"
          >
            <FileText className="w-4 h-4 text-white animate-pulse" />
            Exportar PDF
          </button>

          <button
            type="button"
            onClick={onClearRecords}
            className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-[#B51A82] text-slate-400 border border-slate-200 hover:border-[#B51A82]/30 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Limpiar todos los registros"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Database control details status line */}
      <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span className="font-mono bg-[#00A089]/10 text-[#00A089] px-2 py-0.5 rounded text-[11px] font-bold">
            {records.length}
          </span>
          <span>Transacciones procesadas en este turno corporativo.</span>
        </div>
        
        {records.length === 0 ? (
          <button
            type="button"
            onClick={onResetToDefault}
            className="text-[11px] text-[#00A089] hover:text-[#00A089]/90 font-bold underline transition-all cursor-pointer text-left"
          >
            Cargar datos de prueba de hoy
          </button>
        ) : (
          <div className="text-slate-500 flex items-center gap-1.5 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A089]"></span>
            Prevención de doble ración activa
          </div>
        )}
      </div>

      {/* Filter and Search Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        
        {/* Search Input bar */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#342D86] transition-colors font-semibold"
            placeholder="Buscar por DNI, Nombre, Rol o Servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Meal range dropdown */}
        <div className="md:col-span-3 flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            className="bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs text-slate-700 focus:outline-none cursor-pointer flex-1 font-bold"
            value={selectedMealFilter}
            onChange={(e) => setSelectedMealFilter(e.target.value)}
          >
            <option value="ALL">Todos los horarios de comida</option>
            <option value="DESAYUNO">Desayuno</option>
            <option value="ALMUERZO">Almuerzo</option>
            <option value="CENA">Cena</option>
          </select>
        </div>

        {/* Status code dropdown */}
        <div className="md:col-span-4 flex items-center gap-1.5 text-xs">
          <select
            className="bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs text-slate-700 focus:outline-none cursor-pointer flex-1 font-bold"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los estados de lectura</option>
            <option value="VALID_COMPLETED">Registrados con Éxito</option>
            <option value="DUPLICATE">Duplicados Bloqueados</option>
            <option value="OUT_OF_SCHEDULE">Fuera de Horario</option>
            <option value="SUSPENDED_WORKER">Excluidos (Vacaciones)</option>
          </select>
        </div>

      </div>

      {/* Table Records Body */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-wider select-none">
                <th className="py-3 px-4 text-[#342D86]">Trabajador Hospitalario</th>
                <th className="py-3 px-4 text-[#342D86]">DNI</th>
                <th className="py-3 px-2 text-[#342D86]">Servicio / Rol</th>
                <th className="py-3 px-2 text-center text-[#342D86]">Horario</th>
                <th className="py-3 px-2 text-[#342D86]">Hora Escaneo</th>
                <th className="py-3 px-4 text-center text-[#342D86]">Estado Validación</th>
                <th className="py-3 px-4 text-right text-[#342D86]">Aporte Kcal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-bold font-sans">
                    Ninguna lectura coincide con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isSuccess = record.status === 'VALID_COMPLETED' || (record.status === 'OUT_OF_SCHEDULE' && record.authByAdmin);
                  return (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        record.status === 'DUPLICATE' ? 'bg-[#B51A82]/5' : ''
                      }`}
                    >
                      {/* Worker info */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-extrabold text-[#342D86] text-sm">
                          {record.lastNames}, {record.names}
                        </div>
                        {record.authByAdmin && (
                          <div className="text-[9px] text-[#F9B719] font-black mt-0.5 inline-flex items-center gap-0.5">
                            ⚙️ Excepción autorizada por admin
                          </div>
                        )}
                      </td>
                      
                      {/* DNI */}
                      <td className="py-3 px-4 font-mono text-slate-600 font-bold">
                        {record.dni}
                      </td>

                      {/* Service / Job */}
                      <td className="py-3 px-2">
                        <div className="font-black text-[11px] text-[#00A089] select-all">{record.service}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{record.role}</div>
                      </td>

                      {/* Meal Schedule Range */}
                      <td className="py-3 px-2 text-center select-none font-bold">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          record.mealType === 'DESAYUNO' ? 'bg-[#F9B719]/12 text-[#342D86] border border-[#F9B719]/20' :
                          record.mealType === 'ALMUERZO' ? 'bg-[#00A089]/12 text-[#00A089] border border-[#00A089]/20' :
                          'bg-[#582A85]/12 text-[#582A85] border border-[#582A85]/20'
                        }`}>
                          {record.mealType}
                        </span>
                      </td>

                      {/* Scan trigger timestamp */}
                      <td className="py-3 px-2 font-mono text-slate-700 font-semibold">
                        {record.scanTime}
                        <div className="text-[9px] text-slate-400 font-sans">{record.scanDate}</div>
                      </td>

                      {/* Status Check badge */}
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(record.status)}
                      </td>

                      {/* Calorie value */}
                      <td className={`py-3 px-4 text-right font-mono font-black ${isSuccess ? 'text-[#00A089]' : 'text-slate-400'}`}>
                        {isSuccess ? `+${record.calories} Kcal` : '0 Kcal'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DIARIO GENERADO REPORT MODAL / INTERACTIVE PREVIEW */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-slate-900 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between shadow-2xl relative border-4 border-slate-950"
            id="report-print-dialog"
          >
            {/* Close */}
            <button 
              type="button"
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Document wrapper */}
            <div className="space-y-6 text-left" id="report-print-sheet">
              {/* Report Header block */}
              <div className="border-b-4 border-slate-950 pb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">INSTITUTO NACIONAL DE SALUD DEL NIÑO</h2>
                    <p className="text-[10px] text-slate-600 tracking-wider font-bold font-sans">DEPARTAMENTO DE NUTRICIÓN Y ASISTENCIA DE PERSONAL</p>
                    <p className="text-xs text-slate-500 mt-1 font-sans">Dirección: Av. Brasil 600, Breña, Lima | Central: (01) 330-0066</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono bg-slate-950 text-white px-2.5 py-1 rounded">
                      REPORTE DIARIO
                    </span>
                    <div className="text-[11px] text-slate-600 font-mono mt-1.5 font-semibold">
                      ID: HN-{new Date().toISOString().split('T')[0].replace(/-/g, '')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid indices */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide">Ff. Informe:</span>
                  <span className="font-bold font-mono block mt-0.5">{records[0]?.scanDate || '2026-05-25'}</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide font-sans">Raciones Servidas:</span>
                  <span className="font-bold text-slate-950 block text-lg font-mono mt-0.5">{validScans.length}</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide">Duplicados Detenidos:</span>
                  <span className="font-bold text-red-650 block text-lg font-mono mt-0.5">{duplicateAttempts}</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide">Energía Distribuida:</span>
                  <span className="font-bold text-emerald-800 block text-lg font-mono mt-0.5">{totalCaloriesServed} Kcal</span>
                </div>
              </div>

              {/* Service list overview summary counts */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">Distribución de Consumo por ÁREAS/SERVICIOS:</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(serviceCounts).map(([serv, count]) => (
                    <div key={serv} className="border border-slate-200 px-3 py-1.5 rounded text-[11px] flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">{serv}</span>
                      <span className="bg-slate-900 text-white min-w-5 h-5 flex items-center justify-center font-mono text-[9px] rounded font-bold ml-1 px-1.5">
                        {count} raciones
                      </span>
                    </div>
                  ))}
                  {Object.entries(serviceCounts).length === 0 && (
                    <div className="col-span-full text-slate-500 text-xs italic">Aún no se registran consumos válidos.</div>
                  )}
                </div>
              </div>

              {/* Detail section */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">Lista Nominal de Trabajadores Registrados:</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold select-none border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3">DNI</th>
                        <th className="py-1.5 px-3">Nombres y Apellidos</th>
                        <th className="py-1.5 px-3">Servicio</th>
                        <th className="py-1.5 px-3">Servido</th>
                        <th className="py-1.5 px-3">Hora de Escaneo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {validScans.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-1 px-3 text-slate-600">{s.dni}</td>
                          <td className="py-1 px-3 font-sans font-semibold text-slate-900">{s.lastNames}, {s.names}</td>
                          <td className="py-1 px-3 font-sans text-slate-700">{s.service}</td>
                          <td className="py-1 px-3 select-none text-center">
                            <span className="bg-slate-200 text-slate-800 px-1 rounded text-[8px] uppercase font-bold">{s.mealType}</span>
                          </td>
                          <td className="py-1 px-3 text-slate-500 text-right">{s.scanTime}</td>
                        </tr>
                      ))}
                      {validScans.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">No hay registros de raciones válidas todavía hoy.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footnotes regulatory */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-normal no-print">
                💡 <strong className="font-bold">Para guardar como PDF:</strong> Al hacer clic en el botón de abajo, selecciona <strong className="font-semibold">"Guardar como PDF"</strong> en el destino de impresión de tu navegador para descargarlo directamente.
              </div>

              <div className="text-[10px] text-slate-500 italic mt-4 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between leading-relaxed">
                <span>* Este reporte ha sido consolidado de manera electrónica mediante la lectura automática de la pistola de tickets de alimentos.</span>
                <span className="font-bold select-all">Generado por: {navigator.userAgent && 'Consola Central'}</span>
              </div>
            </div>

            {/* Print trigger actions */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-850 text-white font-sans text-xs font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                id="btn-trigger-print"
              >
                <span>Imprimir Reporte</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={generateAndDownloadJSONReport}
                className="bg-teal-600 hover:bg-teal-700 text-white font-sans text-xs font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                id="btn-download-json-report"
              >
                <Download className="w-3.5 h-3.5" />
                Guardar Reporte JSON
              </button>

              <button
                type="button"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans text-xs font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer"
                onClick={() => setShowReportModal(false)}
              >
                Cerrar vista
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
