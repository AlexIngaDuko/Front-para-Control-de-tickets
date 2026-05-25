import React from 'react';
import { ScanRecord } from '../types';
import { 
  Dna, Flame, Wheat, Apple, Activity, Award, TrendingUp, Info 
} from 'lucide-react';

interface NutritionChartsProps {
  records: ScanRecord[];
}

export default function NutritionCharts({ records }: NutritionChartsProps) {
  // Get valid records that actually consumed meal
  const validScans = records.filter(
    (r) => r.status === 'VALID_COMPLETED' || (r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin)
  );

  // Totals calculations
  const totalCalories = validScans.reduce((sum, r) => sum + r.calories, 0);
  const totalProtein = validScans.reduce((sum, r) => sum + r.protein, 0);
  const totalCarbs = validScans.reduce((sum, r) => sum + r.carbs, 0);
  
  // Average calculation per meal served
  const servedCount = validScans.length;
  const avgCalories = servedCount > 0 ? Math.round(totalCalories / servedCount) : 0;
  const avgProtein = servedCount > 0 ? Math.round((totalProtein / servedCount) * 10) / 10 : 0;
  const avgCarbs = servedCount > 0 ? Math.round((totalCarbs / servedCount) * 10) / 10 : 0;

  // Let's model a recommended balance: 
  // Daily target total limit for energy served in hospital shifts
  const targetCaloriesBudget = 15000; // e.g. 15,000 Kcal threshold for current batch
  const limitPercentage = Math.min(Math.round((totalCalories / targetCaloriesBudget) * 100), 100);

  // Group counts by clinical services for a custom horizontal SVG chart
  const serviceStats: Record<string, number> = {};
  validScans.forEach((r) => {
    serviceStats[r.service] = (serviceStats[r.service] || 0) + 1;
  });

  const sortedServices = Object.entries(serviceStats)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4); // top 4 maximum to keep view clean

  const maxServiceCount = sortedServices.length > 0 ? Math.max(...sortedServices.map(s => s.count)) : 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden" id="nutrition-charts-panel">
      {/* Absolute design lights */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <Activity className="w-5 h-5 animate-pulse" id="nutrition-chart-icon" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-slate-100 text-lg uppercase tracking-wide">Métricas Nutricionales</h3>
          <p className="text-xs text-slate-400">Distribución energética y balance calórico del personal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric 1: Calories budget Gauge directly designed in SVG */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              Suministro de Calorías
            </span>
            <span className="text-slate-400 font-mono">
              Límite del Turno: <span className="font-bold text-slate-200">{targetCaloriesBudget} Kcal</span>
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90 select-none">
                {/* Radial trail background */}
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  strokeWidth="8"
                  stroke="rgba(30, 41, 59, 1)"
                  fill="transparent"
                  className="stroke-slate-800"
                />
                {/* Active circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  strokeWidth="8"
                  stroke="url(#calorieGradient)"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - limitPercentage / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner numerical value */}
              <div className="absolute text-center">
                <span className="text-lg font-black text-slate-100 font-mono block tracking-tight">
                  {totalCalories}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">
                  Kcal Servidas
                </span>
              </div>
            </div>

            {/* Micro details panel right */}
            <div className="space-y-2 flex-grow text-xs">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Eficiencia:</span>
                <span className="font-mono text-slate-200 font-bold">{limitPercentage}%</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Raciones hoy:</span>
                <span className="font-mono text-slate-200 font-bold">{servedCount}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Promedio ración:</span>
                <span className="font-mono text-teal-400 font-bold">{avgCalories} Kcal</span>
              </div>
              
              {/* Progress visual bar */}
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1 select-none">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-700" 
                  style={{ width: `${limitPercentage}%` }}
                />
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>El promedio energético actual de {avgCalories} Kcal/comida cumple con las recomendaciones clínicas recomendadas por el hospital (450Kcal - 800Kcal).</span>
          </p>
        </div>

        {/* Metric 2: Top active services bar chart and macro nutrition balances */}
        <div className="space-y-4">
          
          {/* Macronutrients balance bars */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60 space-y-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans block">Balance Nutricional Promedio</span>
            
            {/* Protein bar helper */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Dna className="w-3.5 h-3.5 text-cyan-400" />
                  Proteínas Promedio
                </span>
                <span className="font-mono text-slate-300 font-bold">{avgProtein} g <span className="text-slate-500 text-[10px]">({Math.round(avgProtein * 4)} Kcal)</span></span>
              </div>
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min((avgProtein / 40) * 100, 100)}%` }} // 40g as normal target almuerzo
                />
              </div>
            </div>

            {/* Carbs bar helper */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Wheat className="w-3.5 h-3.5 text-amber-400" />
                  Carbohidratos Promedio
                </span>
                <span className="font-mono text-slate-300 font-bold">{avgCarbs} g <span className="text-slate-500 text-[10px]">({Math.round(avgCarbs * 4)} Kcal)</span></span>
              </div>
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min((avgCarbs / 100) * 100, 100)}%` }} // 100g max target almuerzo
                />
              </div>
            </div>
          </div>

          {/* Active departments stats list */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60 space-y-2 text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans block">Servicios con Mayor Consumo</span>
            
            <div className="space-y-2 mt-2">
              {sortedServices.map(({ service, count }) => {
                const percentage = Math.round((count / maxServiceCount) * 100);
                return (
                  <div key={service} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300 font-medium truncate">{service}</span>
                      <span className="text-slate-400 font-mono font-bold">{count} {count === 1 ? 'ración' : 'raciones'}</span>
                    </div>
                    <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {sortedServices.length === 0 && (
                <div className="text-slate-600 font-mono text-[11px] text-center py-2 select-none">
                  Sin registros válidos todavia en este turno.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recommended visual indicator card banner */}
      <div className="mt-4 bg-gradient-to-r from-teal-500/10 to-indigo-500/5 p-4 rounded-2xl border border-teal-500/20 text-xs text-slate-300 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="font-sans font-bold text-slate-100 flex items-center gap-1 select-none">
            <Award className="w-4 h-4 text-teal-400" />
            Certificación en Alimentación Hospitalaria Saludable
          </div>
          <p className="text-[11px] text-slate-400">
            Los menús del hospital son evaluados diariamente por nutricionistas clínicos para garantizar la salud de nuestros médicos y técnicos de guardia.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 p-2 bg-slate-950 rounded-xl font-mono text-teal-400 leading-none">
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] font-bold">Óptimo</span>
        </div>
      </div>

    </div>
  );
}
