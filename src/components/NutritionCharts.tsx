import React, { useState, useEffect } from 'react';
import { ScanRecord, MealType, MealSchedule } from '../types';
import { 
  Dna, Flame, Wheat, Activity, Award, TrendingUp, Info
} from 'lucide-react';

interface NutritionChartsProps {
  records: ScanRecord[];
  activeMeal?: MealSchedule | null;
}

const LIMITS: Record<MealType, number> = {
  DESAYUNO: 30, // Max Desayunos raciones allowed
  ALMUERZO: 40,  // Max Almuerzos raciones allowed
  CENA: 30      // Max Cenas raciones allowed
};

export default function NutritionCharts({ records, activeMeal }: NutritionChartsProps) {
  // Get valid records that actually consumed meal today
  const validScans = records.filter(
    (r) => r.status === 'VALID_COMPLETED' || (r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin)
  );

  const servedCount = validScans.length;
  const maxDailyRations = LIMITS.DESAYUNO + LIMITS.ALMUERZO + LIMITS.CENA; // 100 raciones
  const dailyRationsPercentage = Math.min(Math.round((servedCount / maxDailyRations) * 100), 100);

  // Delivered and remaining count per meal type (Conteo General del Día)
  const desayunosEntregados = validScans.filter((s) => s.mealType === 'DESAYUNO').length;
  const desayunosFaltan = Math.max(0, LIMITS.DESAYUNO - desayunosEntregados);

  const almuerzosEntregados = validScans.filter((s) => s.mealType === 'ALMUERZO').length;
  const almuerzosFaltan = Math.max(0, LIMITS.ALMUERZO - almuerzosEntregados);

  const cenasEntregados = validScans.filter((s) => s.mealType === 'CENA').length;
  const cenasFaltan = Math.max(0, LIMITS.CENA - cenasEntregados);

  // Curve coordinates calculation based on limit 40
  const dY0 = 85 - (desayunosEntregados / 40) * 65;
  const dY1 = 85 - (almuerzosEntregados / 40) * 65;
  const dY2 = 85 - (cenasEntregados / 40) * 65;

  const rY0 = 85 - (desayunosFaltan / 40) * 65;
  const rY1 = 85 - (almuerzosFaltan / 40) * 65;
  const rY2 = 85 - (cenasFaltan / 40) * 65;

  // Turn control selection state
  const [selectedTurn, setSelectedTurn] = useState<MealType>('ALMUERZO');

  // Automatically sync selectedTurn when an activeMeal is detected in the workspace
  useEffect(() => {
    if (activeMeal) {
      setSelectedTurn(activeMeal.type);
    }
  }, [activeMeal]);

  // Turn-specific metrics
  const turnScans = validScans.filter((s) => s.mealType === selectedTurn);
  const turnEntregados = turnScans.length;
  const turnLimit = LIMITS[selectedTurn];
  const turnFaltan = Math.max(0, turnLimit - turnEntregados);
  const turnPercentage = Math.min(Math.round((turnEntregados / turnLimit) * 100), 100);

  // Group service counts Specifically according to the active selection (Turno)
  const serviceStats: Record<string, number> = {};
  turnScans.forEach((r) => {
    serviceStats[r.service] = (serviceStats[r.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceStats)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7); // Top 7 services

  const maxServiceCount = sortedServices.length > 0 ? Math.max(...sortedServices.map(s => s.count)) : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative overflow-hidden" id="nutrition-charts-panel">
      {/* Absolute design background blur element */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#00A089]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="p-2 bg-[#00A089]/10 text-[#00A089] rounded-xl font-sans">
          <Activity className="w-5 h-5 animate-pulse" id="nutrition-chart-icon" />
        </div>
        <div>
          <h3 className="font-sans font-black text-[#342D86] text-lg uppercase tracking-wide">Métricas de Raciones</h3>
          <p className="text-xs text-slate-500">Monitoreo de porciones distribuidas y control de límites del hospital</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column wrapper to hold multiple cards stacked vertically to fill blank space */}
        <div className="space-y-4">
          
          {/* Card 1: Suministro de Consumo diario - General */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#342D86] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F9B719]" />
                Suministro de Consumo diario - General
              </span>
              <span className="text-slate-500 font-semibold font-sans">
                Límite de Raciones: <span className="font-bold text-[#342D86]">{maxDailyRations} porciones</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
              
              {/* Circular Gauge based on Total Daily Delivered Portions */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90 select-none">
                  {/* Radial trail background */}
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    strokeWidth="8"
                    stroke="rgba(241, 245, 249, 1)"
                    fill="transparent"
                    className="stroke-slate-100"
                  />
                  {/* Active circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    strokeWidth="8"
                    stroke="url(#rationGradient)"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - dailyRationsPercentage / 100)}`}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="rationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#342D86" />
                      <stop offset="60%" stopColor="#00A089" />
                      <stop offset="100%" stopColor="#F9B719" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Inner numerical value showing served total */}
                <div className="absolute text-center">
                  <span className="text-lg font-black text-[#342D86] font-mono block tracking-tight">
                    {servedCount}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-sans font-black">
                    Raciones
                  </span>
                </div>
              </div>

              {/* Micro details with custom requested labels */}
              <div className="space-y-1.5 flex-grow text-xs w-full">
                <div className="text-slate-600 font-bold flex items-center justify-between">
                  <span>Desayunos entregados:</span>
                  <span className="font-mono text-[#342D86] font-black">{desayunosEntregados} <span className="text-slate-400 font-semibold text-[10px] ml-1">(Faltan: {desayunosFaltan})</span></span>
                </div>
                <div className="text-slate-600 font-bold flex items-center justify-between">
                  <span>Almuerzos entregados:</span>
                  <span className="font-mono text-[#2A65A4] font-black">{almuerzosEntregados} <span className="text-slate-400 font-semibold text-[10px] ml-1">(Faltan: {almuerzosFaltan})</span></span>
                </div>
                <div className="text-slate-600 font-bold flex items-center justify-between">
                  <span>Cenas entregadas:</span>
                  <span className="font-mono text-[#00A089] font-black">{cenasEntregados} <span className="text-slate-400 font-semibold text-[10px] ml-1">(Faltan: {cenasFaltan})</span></span>
                </div>
                
                {/* Progress visual bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 select-none">
                  <div 
                    className="h-full bg-gradient-to-r from-[#342D86] to-[#00A089] rounded-full transition-all duration-700" 
                    style={{ width: `${dailyRationsPercentage}%` }}
                  />
                </div>
              </div>

            </div>

            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium leading-relaxed">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#342D86] flex-shrink-0" />
                <span>Estado del Servicio: <span className="font-bold text-[#00A089]">Activo y Controlado</span></span>
              </span>
              <span className="font-mono text-[9px] bg-[#342D86]/6 text-[#342D86] border border-[#342D86]/10 px-2 py-0.5 rounded-full font-black select-none uppercase">
                Quedan: {Math.max(0, maxDailyRations - servedCount)} porciones
              </span>
            </div>
          </div>

          {/* Card 2: Curve Comparison Chart (Delivered vs Remaining) */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#342D86] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00A089]" />
                Curva de Demanda y Disponibilidad
              </span>
              <span className="text-slate-500 font-semibold text-[10px] uppercase font-sans">
                Raciones vs Faltas
              </span>
            </div>

            <p className="text-[10px] text-slate-505 font-medium leading-snug">
              Desempeño acumulado de raciones servidas versus la demanda/raciones restantes estimadas según el turno del día.
            </p>

            {/* SVG Curve Chart */}
            <div className="pt-1.5">
              <svg viewBox="0 0 320 125" className="w-full h-auto overflow-visible select-none">
                {/* Horizontal reference grid lines */}
                <line x1="40" y1="20" x2="280" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="52" x2="280" y2="52" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="40" y1="85" x2="280" y2="85" stroke="#CBD5E1" strokeWidth="1" />

                {/* Vertical helper lines for shifts */}
                <line x1="60" y1="15" x2="60" y2="90" stroke="#F1F5F9" strokeWidth="1.5" />
                <line x1="160" y1="15" x2="160" y2="90" stroke="#F1F5F9" strokeWidth="1.5" />
                <line x1="260" y1="15" x2="260" y2="90" stroke="#F1F5F9" strokeWidth="1.5" />

                {/* Y Axis mini-labels */}
                <text x="32" y="23" className="fill-slate-400 font-mono text-[8px] font-bold text-right" textAnchor="end">40</text>
                <text x="32" y="55" className="fill-slate-400 font-mono text-[8px] font-bold text-right" textAnchor="end">20</text>
                <text x="32" y="88" className="fill-slate-400 font-mono text-[8px] font-bold text-right" textAnchor="end">0</text>

                {/* Draw smooth area fits for dynamic curves */}
                {/* Delivered wash */}
                <path
                  d={`M 60,85 L 60,${dY0} C 110,${dY0} 110,${dY1} 160,${dY1} S 210,${dY2} 260,${dY2} L 260,85 Z`}
                  fill="rgba(0, 160, 137, 0.05)"
                  className="transition-all duration-700"
                />
                {/* Remaining wash */}
                <path
                  d={`M 60,85 L 60,${rY0} C 110,${rY0} 110,${rY1} 160,${rY1} S 210,${rY2} 260,${rY2} L 260,85 Z`}
                  fill="rgba(52, 45, 134, 0.03)"
                  className="transition-all duration-700"
                />

                {/* Curve lines: Delivered (Teal) */}
                <path
                  d={`M 60,${dY0} C 110,${dY0} 110,${dY1} 160,${dY1} S 210,${dY2} 260,${dY2}`}
                  fill="none"
                  stroke="#00A089"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />

                {/* Curve lines: Remaining (Purple) */}
                <path
                  d={`M 60,${rY0} C 110,${rY0} 110,${rY1} 160,${rY1} S 210,${rY2} 260,${rY2}`}
                  fill="none"
                  stroke="#342D86"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                  className="transition-all duration-700"
                />

                {/* Data points markers: Delivered */}
                <circle cx="60" cy={dY0} r="4" fill="#00A089" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />
                <circle cx="160" cy={dY1} r="4" fill="#00A089" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />
                <circle cx="260" cy={dY2} r="4" fill="#00A089" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />

                {/* Data points markers: Remaining */}
                <circle cx="60" cy={rY0} r="3.5" fill="#342D86" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />
                <circle cx="160" cy={rY1} r="3.5" fill="#342D86" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />
                <circle cx="260" cy={rY2} r="3.5" fill="#342D86" stroke="#FFF" strokeWidth="1.5" className="shadow-sm transition-all duration-700" />

                {/* Shift X-Axis labels */}
                <text x="60" y="105" className="fill-slate-600 font-sans text-[8px] font-black text-center" textAnchor="middle">DESAYUNO</text>
                <text x="160" y="105" className="fill-slate-600 font-sans text-[8px] font-black text-center" textAnchor="middle">ALMUERZO</text>
                <text x="260" y="105" className="fill-slate-600 font-sans text-[8px] font-black text-center" textAnchor="middle">CENA</text>

                {/* Individual numerical value popups */}
                <text x="60" y={dY0 - 8} className="fill-[#00A089] font-mono text-[8px] font-black text-center" textAnchor="middle">{desayunosEntregados}</text>
                <text x="160" y={dY1 - 8} className="fill-[#00A089] font-mono text-[8px] font-black text-center" textAnchor="middle">{almuerzosEntregados}</text>
                <text x="260" y={dY2 - 8} className="fill-[#00A089] font-mono text-[8px] font-black text-center" textAnchor="middle">{cenasEntregados}</text>

                <text x="60" y={rY0 + 13} className="fill-[#342D86] font-mono text-[8px] font-black text-center" textAnchor="middle">{desayunosFaltan}</text>
                <text x="160" y={rY1 + 13} className="fill-[#342D86] font-mono text-[8px] font-black text-center" textAnchor="middle">{almuerzosFaltan}</text>
                <text x="260" y={rY2 + 13} className="fill-[#342D86] font-mono text-[8px] font-black text-center" textAnchor="middle">{cenasFaltan}</text>
              </svg>
            </div>

            {/* Legend for curves */}
            <div className="flex gap-4 items-center justify-center pt-2.5 border-t border-slate-200/50 text-[9px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00A089]" />
                <span className="text-slate-500 font-bold">Raciones Entregadas: <span className="font-mono font-black text-[#00A089]">{desayunosEntregados + almuerzosEntregados + cenasEntregados}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#342D86]" />
                <span className="text-slate-500 font-bold">Raciones Pendientes: <span className="font-mono font-black text-[#342D86]">{desayunosFaltan + almuerzosFaltan + cenasFaltan}</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* Metric 2: CONTROL DE CONSUMO Activo (Variando por turno) */}
        <div className="space-y-4">
          
          {/* Active shift details card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] text-[#342D86] uppercase tracking-wider font-extrabold font-sans block">
                CONTROL DE CONSUMO
              </span>
              
              {/* Turn interactive togglers */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-[9px] font-black select-none">
                {(['DESAYUNO', 'ALMUERZO', 'CENA'] as const).map((type) => {
                  const isCurrentActive = activeMeal?.type === type;
                  const isSelected = selectedTurn === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedTurn(type)}
                      className={`px-2 py-1 rounded transition-all duration-200 cursor-pointer uppercase font-black text-[9px] ${
                        isSelected 
                          ? 'bg-[#342D86] text-white shadow-xs font-black' 
                          : 'text-slate-600 hover:text-[#342D86] font-semibold'
                      } flex items-center gap-1.5 relative`}
                    >
                      <span>{type}</span>
                      {isCurrentActive && (
                        <span className="w-1.5 h-1.5 bg-[#00A089] rounded-full animate-ping absolute -top-0.5 -right-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Turn stats summary card */}
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
              <div className="text-center border-r border-slate-100">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Entregados del Turno</span>
                <div className="text-2xl font-mono font-black text-[#342D86] mt-1 select-none">
                  {turnEntregados} <span className="text-xs font-sans text-slate-400 font-semibold">/ {turnLimit}</span>
                </div>
                <div className="text-[8.5px] text-[#00A089] font-bold mt-1">
                  ({turnPercentage}% completado)
                </div>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Faltan por Entregar</span>
                <div className="text-2xl font-mono font-black text-rose-600 mt-1 select-none">
                  {turnFaltan}
                </div>
                <div className="text-[8.5px] text-slate-400 font-semibold mt-1">
                  raciones de {selectedTurn.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Turn limits visual slider */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    selectedTurn === 'DESAYUNO' ? 'bg-[#342D86]' : selectedTurn === 'ALMUERZO' ? 'bg-[#2A65A4]' : 'bg-[#00A089]'
                  }`}
                  style={{ width: `${turnPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active services list filtered live by current active selected turn */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-black font-sans block">
              servicios con mayor frecuencia de consumo ({selectedTurn.toLowerCase()})
            </span>
            
            <div className="space-y-2 mt-2">
              {sortedServices.map(({ service, count }) => {
                const percentage = Math.round((count / maxServiceCount) * 100);
                return (
                  <div key={service} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-700 font-bold truncate">{service}</span>
                      <span className="text-[#00A089] font-mono font-black">{count} {count === 1 ? 'ración' : 'raciones'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#342D86]" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {sortedServices.length === 0 && (
                <div className="text-slate-500 font-semibold text-[11px] text-center py-2 select-none">
                  Sin registros válidos todavía en el turno de {selectedTurn.toLowerCase()}.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recommended visual indicator card banner */}
      <div className="mt-4 bg-[#00A089]/6 p-4 rounded-2xl border border-[#00A089]/15 text-xs text-slate-700 flex items-center justify-between gap-4 shadow-3xs">
        <div className="space-y-0.5">
          <div className="font-sans font-black text-[#342D86] flex items-center gap-1.5 select-none uppercase">
            <Award className="w-4 h-4 text-[#00A089]" />
            Certificación en Alimentación Hospitalaria Saludable
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Los menús del hospital son evaluados diariamente por nutricionistas clínicos para garantizar la salud de nuestros médicos y técnicos de guardia.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 p-2 bg-white rounded-xl font-mono text-[#00A089] leading-none border border-[#00A089]/10 shadow-xs select-none">
          <TrendingUp className="w-4 h-4 text-[#00A089]" />
          <span className="text-[10px] font-black uppercase">Óptimo</span>
        </div>
      </div>

    </div>
  );
}
