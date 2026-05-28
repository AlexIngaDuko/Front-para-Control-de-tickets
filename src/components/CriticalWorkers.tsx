import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Worker, ScanRecord, MealType, MealSchedule } from '../types';
import { CRITICAL_HOSPITAL_WORKERS, SERVICE_DECRYPTIONS } from '../data_critical';
import { 
  Users, Check, CheckSquare, Square, ShieldAlert, AlertCircle, Utensils, 
  Baby, Syringe, HeartPulse, Shield, HelpCircle, Eye, Activity, CalendarDays,
  Sparkles, CheckCircle, Clock, ClipboardList, Info
} from 'lucide-react';

interface CriticalWorkersProps {
  records: ScanRecord[];
  onAuthorizeWorkers: (workers: Worker[], isExceptional: boolean, mealType: MealType) => void;
  activeMeal: MealSchedule | null;
  formattedShortDateStr: string;
  currentDateTime: Date;
}

export default function CriticalWorkers({
  records,
  onAuthorizeWorkers,
  activeMeal,
  formattedShortDateStr,
  currentDateTime
}: CriticalWorkersProps) {
  
  // Select active service (default to ANEST on load)
  const [selectedService, setSelectedService] = useState<string>('ANEST');

  // Maintain attendance registry in state (per worker id). Default all to true so user can simply authorize, but override as needed.
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('insn_critical_attendance_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default all 90 workers to present/assisted initially (so they can easily authorize)
    const initial: Record<string, boolean> = {};
    CRITICAL_HOSPITAL_WORKERS.forEach(w => {
      initial[w.id] = true;
    });
    return initial;
  });

  // Save attendance
  useEffect(() => {
    localStorage.setItem('insn_critical_attendance_v1', JSON.stringify(attendance));
  }, [attendance]);

  // Fallback selected meal for out-of-schedule or forced override
  const [customSelectedMeal, setCustomSelectedMeal] = useState<MealType>('ALMUERZO');

  // Update customSelectedMeal whenever activeMeal changes to keep aligned by default
  useEffect(() => {
    if (activeMeal) {
      setCustomSelectedMeal(activeMeal.type);
    }
  }, [activeMeal]);

  // Deciphered meal tag helpers
  const mealNameMap: Record<MealType, string> = {
    'DESAYUNO': '☀️ Desayuno Pediátrico',
    'ALMUERZO': '🥗 Almuerzo Nutritivo',
    'CENA': '🌌 Cena de Lactancia'
  };

  // Get workers in selected service
  const serviceWorkers = useMemo(() => {
    return CRITICAL_HOSPITAL_WORKERS.filter(w => w.service === selectedService);
  }, [selectedService]);

  // Check which workers of the selected service already have been authorized TODAY for the selected meal type
  const mealAuthorizationStatus = useMemo(() => {
    const statusMap: Record<string, { authorized: boolean; time?: string; authByAdmin?: boolean }> = {};
    
    // We search records for today matching this meal type and workerId
    serviceWorkers.forEach(w => {
      const scanToday = records.find(r => 
        r.workerId === w.id && 
        r.scanDate === formattedShortDateStr && 
        r.mealType === customSelectedMeal &&
        r.status === 'VALID_COMPLETED'
      );
      
      if (scanToday) {
        statusMap[w.id] = {
          authorized: true,
          time: scanToday.scanTime,
          authByAdmin: scanToday.authByAdmin
        };
      } else {
        statusMap[w.id] = { authorized: false };
      }
    });

    return statusMap;
  }, [serviceWorkers, records, formattedShortDateStr, customSelectedMeal]);

  // Get global counts per service to show beautiful badges in the sidebar
  const serviceStats = useMemo(() => {
    const stats: Record<string, { present: number; total: number; served: number }> = {};
    
    Object.keys(SERVICE_DECRYPTIONS).forEach(svc => {
      const workers = CRITICAL_HOSPITAL_WORKERS.filter(w => w.service === svc);
      const presentCount = workers.filter(w => attendance[w.id] !== false).length;
      
      // Served today for currently chosen meal type
      const servedCount = workers.filter(w => {
        return records.some(r => 
          r.workerId === w.id && 
          r.scanDate === formattedShortDateStr && 
          r.mealType === customSelectedMeal &&
          r.status === 'VALID_COMPLETED'
        );
      }).length;

      stats[svc] = {
        present: presentCount,
        total: workers.length,
        served: servedCount
      };
    });

    return stats;
  }, [attendance, records, formattedShortDateStr, customSelectedMeal]);

  // Helper icons for each clinical service for supreme aesthetics
  const getServiceIcon = (svc: string) => {
    switch (svc) {
      case 'ANEST':
        return <Syringe className="w-4 h-4 text-purple-600" />;
      case 'B.SANG':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'C.QUIRUR':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'CARDIO':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'CIRUG.G':
        return <Shield className="w-4 h-4 text-cyan-600" />;
      case 'EMERG.':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'LAB.EMERG':
        return <ClipboardList className="w-4 h-4 text-teal-600" />;
      case 'NEONAT':
        return <Baby className="w-4 h-4 text-pink-600" />;
      case 'RAYOS X':
        return <Eye className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-slate-600" />;
    }
  };

  // Toggle individual attendance
  const toggleAttendance = (workerId: string) => {
    setAttendance(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  // Check/uncheck all in current service
  const handleToggleAllAttendance = (allPresent: boolean) => {
    const updated = { ...attendance };
    serviceWorkers.forEach(w => {
      updated[w.id] = allPresent;
    });
    setAttendance(updated);
  };

  // Bulk authorize matching workers in selected service
  const handleBulkAuthorize = (isExceptional: boolean) => {
    // Collect present workers that are NOT yet authorized today
    const workersToAuth = serviceWorkers.filter(w => 
      attendance[w.id] !== false && 
      !mealAuthorizationStatus[w.id]?.authorized
    );

    if (workersToAuth.length === 0) {
      alert("No hay trabajadores seleccionados con ración pendiente hoy.");
      return;
    }

    onAuthorizeWorkers(workersToAuth, isExceptional, customSelectedMeal);
  };

  // Individual worker authorization toggle
  const handleIndividualAuthorize = (worker: Worker, isExceptional: boolean) => {
    onAuthorizeWorkers([worker], isExceptional, customSelectedMeal);
  };

  // Counts of matching workers
  const presentCount = serviceWorkers.filter(w => attendance[w.id] !== false).length;
  const alreadyServedCount = serviceWorkers.filter(w => mealAuthorizationStatus[w.id]?.authorized).length;
  const pendingCount = serviceWorkers.filter(w => attendance[w.id] !== false && !mealAuthorizationStatus[w.id]?.authorized).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="critical-workers-panel">
      
      {/* SIDEBAR: List of 9 Clinical Services */}
      <div className="col-span-1 lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 select-none">
        <div>
          <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#342D86]" />
            Servicios Clínicos Críticos
          </h3>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 font-sans">
            Selecciona un servicio para validar asistencia y gestionar la acreditación de raciones institucionales.
          </p>
        </div>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {Object.entries(SERVICE_DECRYPTIONS).map(([key, name]) => {
            const isSelected = selectedService === key;
            const stats = serviceStats[key] || { present: 0, total: 10, served: 0 };
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedService(key)}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 scale-99 active:scale-95 group ${
                  isSelected
                    ? 'bg-[#342D86] border-[#342D86] text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 transition-all ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-100 shadow-3xs'
                  }`}>
                    {getServiceIcon(key)}
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-[11px] font-black tracking-tight leading-none truncate ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {name}
                    </span>
                    <span className={`text-[8.5px] font-mono leading-none font-bold block mt-1 uppercase ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}>
                      Abreviación: {key}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <span className={`font-mono text-[9.5px] font-black px-1.5 py-0.5 rounded-md leading-none ${
                    isSelected 
                      ? 'bg-white/15 text-white' 
                      : 'bg-slate-200/60 text-slate-700'
                  }`} title="Trabajadores Asistieron / Total">
                    {stats.present}/{stats.total} Asist.
                  </span>
                  
                  {stats.served > 0 && (
                    <span className={`font-mono text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none flex items-center gap-0.5 ${
                      isSelected 
                        ? 'bg-emerald-500/25 text-emerald-100' 
                        : 'bg-emerald-100/75 text-emerald-800 border border-emerald-200/50'
                    }`}>
                      <Check className="w-2 h-2" />
                      {stats.served} Serv.
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-[10.5px] text-slate-600 font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1">
            <Info className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
            <span>Validación de Guardia</span>
          </div>
          Nuestros 90 trabajadores críticos tienen DNI institucional que puede ser escaneado opcionalmente desde la terminal principal.
        </div>
      </div>

      {/* DETAILED VIEW: Workers Table & Controls */}
      <div className="col-span-1 lg:col-span-9 space-y-6">
        
        {/* UPPER CONTROLS PROFILE */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 text-[10px] font-black border border-[#342D86]/20 bg-[#342D86]/8 text-[#342D86] rounded-full uppercase font-mono">
                {selectedService}
              </span>
              <h2 className="font-sans font-black text-slate-950 text-base md:text-lg uppercase tracking-tight">
                Servicio de {SERVICE_DECRYPTIONS[selectedService]}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Registro nominal de los 10 profesionales de guardia pre-ingresados en este sector.
            </p>
          </div>

          {/* MEAL ACCREDITATION SWITCHER BOX */}
          <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Turno de Acreditación:</span>
              {activeMeal ? (
                <span className="bg-[#00A089]/10 text-[#00A089] border border-[#00A089]/20 text-[8px] font-black px-1.5 py-0.5 rounded leading-none">
                  HORARIO ACTIVO: {activeMeal.type}
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black px-1.5 py-0.5 rounded leading-none animate-pulse">
                  FUERA DE HORARIO
                </span>
              )}
            </div>

            {/* Selector Buttons */}
            <div className="flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-3xs">
              {(['DESAYUNO', 'ALMUERZO', 'CENA'] as const).map((mType) => {
                const isSelected = customSelectedMeal === mType;
                const isSystemMatched = activeMeal?.type === mType;
                return (
                  <button
                    key={mType}
                    type="button"
                    onClick={() => setCustomSelectedMeal(mType)}
                    className={`px-2.5 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all uppercase leading-none ${
                      isSelected
                        ? 'bg-[#342D86] text-white shadow-xs font-black' 
                        : 'text-slate-600 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    {mType === 'DESAYUNO' ? 'Desayuno' : mType === 'ALMUERZO' ? 'Almuerzo' : 'Cena'}
                    {isSystemMatched && (
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* NOMINAL LIST OF 10 WORKERS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          
          <div className="border-b border-slate-200 p-4 bg-slate-50 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-[#342D86] uppercase tracking-wider block">
                Lista nominal de Control Diario:
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Ausente</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Presente</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Servido</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleToggleAllAttendance(true)}
                className="text-[9.5px] font-black text-indigo-750 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/50 px-2.5 py-1 rounded-lg uppercase tracking-wide cursor-pointer flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-indigo-600" />
                Marcar Presentes
              </button>
              <button
                type="button"
                onClick={() => handleToggleAllAttendance(false)}
                className="text-[9.5px] font-black text-slate-600 bg-slate-100 border border-slate-250 hover:bg-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wide cursor-pointer flex items-center gap-1"
              >
                <XButtonIcon className="w-3 h-3 text-slate-600" />
                Desmarcar Todos
              </button>
            </div>
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left max-lg:min-w-[650px] lg:min-w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase select-none">
                  <th className="py-2.5 px-4 w-[8%] text-center">Asistencia</th>
                  <th className="py-2.5 px-3 w-[15%]">DNI</th>
                  <th className="py-2.5 px-3 w-[30%]">Profesional Clínico</th>
                  <th className="py-2.5 px-3 w-[22%]">Cargo Registrado</th>
                  <th className="py-2.5 px-3 text-center w-[15%]">Estado Ración</th>
                  <th className="py-2.5 px-4 text-right w-[10%]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-sans text-xs">
                {serviceWorkers.map((worker) => {
                  const isPresent = attendance[worker.id] !== false;
                  const authStatus = mealAuthorizationStatus[worker.id];
                  const hasEaten = authStatus?.authorized;
                  
                  return (
                    <tr 
                      key={worker.id} 
                      className={`transition-colors duration-150 ${
                        hasEaten 
                          ? 'bg-emerald-50/20 hover:bg-emerald-50/45' 
                          : isPresent 
                            ? 'bg-white hover:bg-slate-50' 
                            : 'bg-slate-100/50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-4 text-center select-none">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(worker.id)}
                          className="mx-auto block text-[#342D86] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          title={isPresent ? 'Registrar como Ausente' : 'Registrar como Presente'}
                        >
                          {isPresent ? (
                            <CheckSquare className="w-5 h-5 text-indigo-700" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* DNI */}
                      <td className="py-2 px-3 font-mono text-[11px] font-bold">
                        {worker.dni}
                      </td>

                      {/* Photo and Full Name */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={worker.photoUrl} 
                            alt={worker.names} 
                            className={`w-7 h-7 rounded-lg object-cover border shrink-0 ${
                              hasEaten
                                ? 'border-emerald-300'
                                : isPresent 
                                  ? 'border-indigo-200' 
                                  : 'border-slate-200 opacity-60 filter grayscale'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <span className={`block font-bold truncate ${
                              isPresent ? 'text-slate-900' : 'text-slate-400 line-through'
                            }`}>
                              {worker.lastNames}, {worker.names}
                            </span>
                            <span className="text-[8.5px] text-slate-400 font-mono font-semibold block leading-none mt-0.5 uppercase">
                              ID: {worker.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Card */}
                      <td className="py-2 px-3 text-slate-600 font-semibold truncate max-w-[150px]" title={worker.role}>
                        {worker.role}
                      </td>

                      {/* Allocation status today */}
                      <td className="py-2 px-3 text-center select-none font-sans">
                        {hasEaten ? (
                          <div className="inline-flex flex-col items-center justify-center bg-emerald-55/12 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase leading-none">
                            <span className="text-[8.5px] font-black">Acreditado</span>
                            <span className="text-[6.5px] font-extrabold text-emerald-600 block mt-0.5">{authStatus.time}</span>
                          </div>
                        ) : !isPresent ? (
                          <span className="bg-slate-100 text-slate-400 border border-slate-200 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                            Ausente
                          </span>
                        ) : (
                          <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Action trigger standard/exceptional button */}
                      <td className="py-2 px-4 text-right">
                        {hasEaten ? (
                          <span className="text-emerald-500 font-mono text-[10px] font-extrabold select-none">
                            Listo ✓
                          </span>
                        ) : !isPresent ? (
                          <span className="text-slate-350 font-mono text-[9px] font-extrabold select-none">
                            --
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const isOutOfTime = !activeMeal || activeMeal.type !== customSelectedMeal;
                              handleIndividualAuthorize(worker, isOutOfTime);
                            }}
                            className={`p-1.5 px-2.5 rounded-lg text-[9px] font-black uppercase text-white transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 ${
                              (!activeMeal || activeMeal.type !== customSelectedMeal)
                                ? 'bg-amber-600 hover:bg-amber-750 shadow-3xs'
                                : 'bg-[#00A089] hover:bg-[#008A75] shadow-3xs'
                            }`}
                            title={(!activeMeal || activeMeal.type !== customSelectedMeal) ? 'Autorizar Excepcional (Fuera de Horario)' : 'Autorizar en Horario General'}
                          >
                            <Utensils className="w-3 h-3 text-white/90" />
                            <span>Acreditar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LOWER BULK ACTION CONTAINER */}
          <div className="bg-slate-50 border-t border-slate-205 p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none">
            <div className="space-y-0.5 font-sans">
              <div className="text-[11px] text-slate-650 font-bold block">
                Resumen de Gestión Asistencial:
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10.5px]">
                <span className="font-bold text-slate-705">
                  Total Presentes: <span className="font-mono font-black text-indigo-700">{presentCount}/10</span>
                </span>
                <span className="text-slate-350">•</span>
                <span className="font-bold text-slate-705">
                  Raciones Entregadas: <span className="font-mono font-black text-emerald-700">{alreadyServedCount}</span>
                </span>
                <span className="text-slate-350">•</span>
                <span className="font-bold text-slate-705">
                  Raciones Faltantes: <span className="font-mono font-black text-rose-700">{pendingCount}</span>
                </span>
              </div>
            </div>

            {/* ACTION DIRECTIVES BAR */}
            <div className="flex flex-col sm:flex-row gap-2">
              {(!activeMeal || activeMeal.type !== customSelectedMeal) ? (
                // 1. OUT OF TIMEFRAME TRIGGER ACTION
                <button
                  type="button"
                  onClick={() => handleBulkAuthorize(true)}
                  disabled={pendingCount === 0}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md text-white ${
                    pendingCount === 0
                      ? 'bg-amber-650/40 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-650 hover:to-amber-750'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  <span>Acreditar Excepcionalmente a los {pendingCount} Presentes</span>
                </button>
              ) : (
                // 2. NORMAL IN SHIFT TRIGGER ACTION
                <button
                  type="button"
                  onClick={() => handleBulkAuthorize(false)}
                  disabled={pendingCount === 0}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md text-white ${
                    pendingCount === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>Autorizar {mealNameMap[customSelectedMeal]} para los {pendingCount} Presentes</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* EXTRA HELP CENTER FOR CRITICAL PROCEDURES */}
        <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-3xl flex items-start gap-3 select-none shadow-3xs">
          <Shield className="w-5 h-5 text-indigo-750 block mt-0.5 shrink-0" />
          <div className="font-sans text-slate-800 text-[10.5px] leading-relaxed">
            <span className="font-extrabold text-indigo-900 block uppercase tracking-wide text-[11px] mb-0.5">
              Protocolo Institucional para Personal de Guardia Crítica:
            </span>
            Este visor nominal faculta la emisión especial por lotes de almuerzos, desayunos o cenas para el personal de contingencia extrema que se encuentra en servicio de custodia hospitalaria. Al autorizar la ración, el sistema registrará de manera inalterable la fecha y hora de la entrega en el Historial General de Raciones.
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple placeholder icon
function XButtonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
