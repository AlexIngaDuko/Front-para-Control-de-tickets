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

  // Totals calculations (Daily overall)
  const totalCalories = validScans.reduce((sum, r) => sum + r.calories, 0);
  const totalProtein = validScans.reduce((sum, r) => sum + r.protein, 0);
  const totalCarbs = validScans.reduce((sum, r) => sum + r.carbs, 0);
  
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

  const turnTotalCalories = turnScans.reduce((sum, r) => sum + r.calories, 0);
  const turnTotalProtein = turnScans.reduce((sum, r) => sum + r.protein, 0);
  const turnTotalCarbs = turnScans.reduce((sum, r) => sum + r.carbs, 0);

  const turnAvgCalories = turnEntregados > 0 ? Math.round(turnTotalCalories / turnEntregados) : 0;
  const turnAvgProtein = turnEntregados > 0 ? Math.round((turnTotalProtein / turnEntregados) * 10) / 10 : 0;
  const turnAvgCarbs = turnEntregados > 0 ? Math.round((turnTotalCarbs / turnEntregados) * 10) / 10 : 0;

  // Group service counts Specifically according to the active selection (Turno)
  const serviceStats: Record<string, number> = {};
  turnScans.forEach((r) => {
    serviceStats[r.service] = (serviceStats[r.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceStats)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4); // Top 4 services

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
          <h3 className="font-sans font-black text-[#342D86] text-lg uppercase tracking-wide">Métricas Nutricionales</h3>
          <p className="text-xs text-slate-500">Monitoreo de porciones distribuidas y control de límites del hospital</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric 1: General Day Supply Dashboard Card */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[#342D86] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#F9B719]" />
              Suministro Diario (General)
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
                  stroke="url(#calorieGradient)"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - dailyRationsPercentage / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
              <span>Calorías del día: <span className="font-bold text-[#342D86]">{totalCalories} Kcal</span></span>
            </span>
            <span className="font-mono text-[9px] bg-[#342D86]/6 text-[#342D86] border border-[#342D86]/10 px-2 py-0.5 rounded-full font-black select-none uppercase">
              Quedan: {Math.max(0, maxDailyRations - servedCount)} porciones
            </span>
          </div>
        </div>

        {/* Metric 2: Control del Turno Activo (Variando por turno) */}
        <div className="space-y-4">
          
          {/* Active shift details card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] text-[#342D86] uppercase tracking-wider font-extrabold font-sans block">
                Control del Turno
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

            {/* Nutritional summaries of the turn */}
            <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-slate-200/80 text-[10px] text-slate-600 font-bold">
              <div className="text-center">
                <div className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Calorías Turno</div>
                <div className="font-mono font-black text-slate-800 mt-0.5">{turnAvgCalories} Kcal</div>
              </div>
              <div className="text-center border-x border-slate-100 font-sans">
                <div className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Proteínas Prom.</div>
                <div className="font-mono font-black text-[#00A089] mt-0.5">{turnAvgProtein} g</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-[8px] font-black uppercase tracking-wider">Carbohidratos Prom.</div>
                <div className="font-mono font-black text-[#F9B719] mt-0.5">{turnAvgCarbs} g</div>
              </div>
            </div>
          </div>

          {/* Active services list filtered live by current active selected turn */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-black font-sans block">
              Servicios con Mayor Consumo ({selectedTurn.toLowerCase()})
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
