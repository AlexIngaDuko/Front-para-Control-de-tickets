import React, { useState, useEffect, useMemo } from 'react';
import { 
  Worker, ScanRecord, MealSchedule, ScanStatus, 
  SystemNotification, MealType 
} from './types';
import { 
  HOSPITAL_WORKERS, MEAL_SCHEDULES, INITIAL_SCAN_RECORDS, 
  INITIAL_NOTIFICATIONS 
} from './data';
import { playSuccessBeep, playErrorBuzzer, playWarningChime } from './audio';

// Dynamic sub-components
import ScannerTerminal from './components/ScannerTerminal';
import ScanHistory from './components/ScanHistory';
import NutritionCharts from './components/NutritionCharts';
import NotificationCenter from './components/NotificationCenter';

// Icons
import { 
  HeartPulse, Clock, Calendar, CheckSquare, Layers, HelpCircle, 
  Settings, Radio, Lightbulb, Bell, AlertCircle, Info, Star
} from 'lucide-react';

export default function App() {
  // 1. Time state management (Device real-time vs Manual simulated time)
  const [useRealTime, setUseRealTime] = useState<boolean>(false);
  const [simulatedDateTime, setSimulatedDateTime] = useState<Date>(() => {
    // We default to exactly 2026-05-25 at 09:13 AM to easily matching the provided ticket image!
    const date = new Date('2026-05-25T09:13:00');
    return date;
  });
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());

  // Real-time ticking clock effect
  useEffect(() => {
    if (useRealTime) {
      const interval = setInterval(() => {
        setActiveDate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [useRealTime]);

  // Read active time
  const currentDateTime = useRealTime ? activeDate : simulatedDateTime;

  // Format time display
  const formattedTime = useMemo(() => {
    return currentDateTime.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }, [currentDateTime]);

  const formattedDate = useMemo(() => {
    return currentDateTime.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [currentDateTime]);

  const formattedShortDateStr = useMemo(() => {
    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentDateTime]);

  // 2. Persistent States from LocalStorage (or fallbacks)
  const [records, setRecords] = useState<ScanRecord[]>(() => {
    const cached = localStorage.getItem('hospital_food_scans_v1');
    return cached ? JSON.parse(cached) : INITIAL_SCAN_RECORDS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const cached = localStorage.getItem('hospital_food_notifications_v1');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  // Save states
  useEffect(() => {
    localStorage.setItem('hospital_food_scans_v1', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hospital_food_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Last Scanned Result view states
  const [lastScannedWorker, setLastScannedWorker] = useState<Worker | null>(null);
  const [lastScanStatus, setLastScanStatus] = useState<ScanStatus | null>(null);
  const [lastScanMessage, setLastScanMessage] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // 3. Dynamic food schedule calculations
  const activeMeal = useMemo((): MealSchedule | null => {
    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const currentMinutesVal = hours * 60 + minutes;

    for (const sched of MEAL_SCHEDULES) {
      const [startH, startM] = sched.startTime.split(':').map(Number);
      const [endH, endM] = sched.endTime.split(':').map(Number);
      const startMinutesVal = startH * 60 + startM;
      const endMinutesVal = endH * 60 + endM;

      if (currentMinutesVal >= startMinutesVal && currentMinutesVal <= endMinutesVal) {
        return sched;
      }
    }
    return null;
  }, [currentDateTime]);

  // 4. Primary Scan Processing Handler
  const handleScanResult = (dni: string, authOverride: boolean = false) => {
    // Current timestamp strings
    const scanTimeStr = currentDateTime.toLocaleTimeString('es-PE', { hour12: false });
    const scanDateStr = formattedShortDateStr;

    // Look up employee
    const worker = HOSPITAL_WORKERS.find(w => w.dni === dni);

    if (!worker) {
      // DNI not exist error
      playErrorBuzzer();
      setLastScannedWorker({
        id: 'unknown',
        dni,
        names: 'No Identificado',
        lastNames: 'Código Inválido',
        service: 'Sin Servicio',
        role: 'Desconocido',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
        status: 'VACATION'
      });
      setLastScanStatus('INVALID_CODE');
      setLastScanMessage(`El DNI ${dni} ingresado no se encuentra en la base de datos de trabajadores clínicos del hospital.`);
      setLastScanTime(scanTimeStr);

      // Log event to records list
      const failRecord: ScanRecord = {
        id: `scan-fail-${Date.now()}`,
        workerId: 'unknown',
        names: 'No Identificado',
        lastNames: 'Código Inválido',
        dni,
        service: 'Externo',
        role: 'Desconocido',
        mealType: activeMeal?.type || 'ALMUERZO',
        scanTime: scanTimeStr,
        scanDate: scanDateStr,
        status: 'INVALID_CODE',
        statusMessage: 'Denegado - DNI inexistente',
        calories: 0,
        protein: 0,
        carbs: 0
      };
      setRecords(prev => [failRecord, ...prev]);

      // Add push warning in center
      addNotification(
        '⚠️ Escaneo de Código Inválido',
        `Se detectó una lectura fallida en el puesto con DNI: ${dni}.`,
        'alert'
      );
      return;
    }

    setLastScannedWorker(worker);
    setLastScanTime(scanTimeStr);

    // 1. Vacation Block - VACATION workers are NOT allowed to consume any meals ("no pueda recibir ración si está de vacaciones")
    if (worker.status === 'VACATION') {
      playErrorBuzzer();
      setLastScanStatus('SUSPENDED_WORKER'); // Employs the existing locked panel UI styles
      setLastScanMessage(`¡TRABAJADOR EN VACACIONES! El empleado ${worker.names} ${worker.lastNames} no está autorizado para recibir raciones. El personal de vacaciones se encuentra excluido temporalmente de los beneficios de comedor del Instituto Nacional de Salud del Niño.`);
      
      const lockedRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: worker.id,
        names: worker.names,
        lastNames: worker.lastNames,
        dni: worker.dni,
        service: worker.service,
        role: worker.role,
        mealType: activeMeal?.type || 'ALMUERZO',
        scanTime: scanTimeStr,
        scanDate: scanDateStr,
        status: 'SUSPENDED_WORKER',
        statusMessage: 'Denegado - Trabajador en Vacaciones',
        calories: 0,
        protein: 0,
        carbs: 0
      };
      setRecords(prev => [lockedRecord, ...prev]);

      addNotification(
        '🚨 Bloqueo por Vacaciones',
        `Intento de consumo denegado por personal de vacaciones (${worker.lastNames}, ${worker.names}).`,
        'alert'
      );
      return;
    }

    // 2. Duplicate Check - If they already ate today, they are blocked. NO EXCEPTIONS ALLOWED!
    const isDuplicate = activeMeal ? records.some(r => 
      r.workerId === worker.id && 
      r.mealType === activeMeal.type && 
      r.scanDate === scanDateStr && 
      r.status === 'VALID_COMPLETED'
    ) : false;

    if (isDuplicate) {
      playErrorBuzzer();
      setLastScanStatus('DUPLICATE');
      
      const prevScan = records.find(r => 
        r.workerId === worker.id && 
        r.mealType === activeMeal!.type && 
        r.scanDate === scanDateStr && 
        r.status === 'VALID_COMPLETED'
      );
      const prevTime = prevScan ? prevScan.scanTime : 'hace unos minutos';

      setLastScanMessage(`¡TICKET DUPLICADO DETECTADO! El empleado ya consumió su ración asignada de ${activeMeal!.label} hoy a las ${prevTime}. Por directiva estricta institucional, no se permite ninguna ración de excepción ni doble entrega.`);
      
      const duplicateRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: worker.id,
        names: worker.names,
        lastNames: worker.lastNames,
        dni: worker.dni,
        service: worker.service,
        role: worker.role,
        mealType: activeMeal!.type,
        scanTime: scanTimeStr,
        scanDate: scanDateStr,
        status: 'DUPLICATE',
        statusMessage: `Denegado - Duplicado de ${activeMeal!.label} (Consumos múltiples prohibidos)`,
        calories: 0,
        protein: 0,
        carbs: 0
      };
      
      setRecords(prev => [duplicateRecord, ...prev]);
      
      addNotification(
        '🚨 Duplicado Rechazado',
        `Se bloqueó ración doble para ${worker.lastNames}, ${worker.names}. Sin excepciones.`,
        'alert'
      );
      return;
    }

    // 3. Special Override Bypass - Only allowed for OUT_OF_SCHEDULE / FUERA DE HORARIO
    if (authOverride) {
      playSuccessBeep();
      setLastScanStatus('VALID_COMPLETED');
      setLastScanMessage(`Autorizado de Excepción - El trabajador ${worker.names} ha sido habilitado con autorización manual para consumir ración fuera de horario.`);
      
      const mockCalories = activeMeal?.calories || 600;
      const mockProtein = activeMeal?.protein || 28;
      const mockCarbs = activeMeal?.carbs || 75;

      const overriddenRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: worker.id,
        names: worker.names,
        lastNames: worker.lastNames,
        dni: worker.dni,
        service: worker.service,
        role: worker.role,
        mealType: activeMeal?.type || 'ALMUERZO',
        scanTime: scanTimeStr,
        scanDate: scanDateStr,
        status: 'VALID_COMPLETED',
        statusMessage: `Autorizado Excepcional - Bypass manual por Admin (Fuera de Horario)`,
        calories: mockCalories,
        protein: mockProtein,
        carbs: mockCarbs,
        authByAdmin: true
      };
      
      setRecords(prev => [overriddenRecord, ...prev]);
      addNotification(
        '⚙️ Excepción Registrada',
        `Autorización excepcional de ración fuera de horario para ${worker.lastNames}, ${worker.names}.`,
        'info'
      );
      return;
    }

    // 4. Out of Clinical Hours Check
    if (!activeMeal) {
      playWarningChime();
      setLastScanStatus('OUT_OF_SCHEDULE');
      setLastScanMessage(`FUERA DE HORARIO: No existe un turno de alimentación activo para este horario. Pídele al administrador autorizar la ración especial.`);
      
      const outHourRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: worker.id,
        names: worker.names,
        lastNames: worker.lastNames,
        dni: worker.dni,
        service: worker.service,
        role: worker.role,
        mealType: 'ALMUERZO', // default category
        scanTime: scanTimeStr,
        scanDate: scanDateStr,
        status: 'OUT_OF_SCHEDULE',
        statusMessage: `Denegado - Ticket fuera de horario general`,
        calories: 0,
        protein: 0,
        carbs: 0
      };
      setRecords(prev => [outHourRecord, ...prev]);

      addNotification(
        '⚠️ Fuera de Horario',
        `${worker.lastNames}, ${worker.names} escaneó ticket fuera de horario general. Admite excepción razonada.`,
        'warning'
      );
      return;
    }

    // 5. SUCCESS SCENARIO - Normal within schedule & conditions met
    playSuccessBeep();
    setLastScanStatus('VALID_COMPLETED');
    setLastScanMessage(`¡AUTORIZADO! Se ha acreditado de manera exitosa la ración de ${activeMeal.label} para el empleado ${worker.names} ${worker.lastNames}.`);

    const validRecord: ScanRecord = {
      id: `scan-${Date.now()}`,
      workerId: worker.id,
      names: worker.names,
      lastNames: worker.lastNames,
      dni: worker.dni,
      service: worker.service,
      role: worker.role,
      mealType: activeMeal.type,
      scanTime: scanTimeStr,
      scanDate: scanDateStr,
      status: 'VALID_COMPLETED',
      statusMessage: `Autorizado - Suministro de ración para ${activeMeal.label}`,
      calories: activeMeal.calories,
      protein: activeMeal.protein,
      carbs: activeMeal.carbs
    };

    setRecords(prev => [validRecord, ...prev]);

    addNotification(
      '🟢 Consumo Registrado',
      `${worker.names} ${worker.lastNames} (${worker.service}) ha consumido ${activeMeal.label}.`,
      'success'
    );
  };

  // 5. Notifications helpers
  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'alert') => {
    const timeStr = currentDateTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: timeStr,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Helper presets for simulated clock
  const setSimulatedHour = (hour: number, minute: number) => {
    const newDate = new Date(currentDateTime);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    setSimulatedDateTime(newDate);
    setUseRealTime(false);
  };

  // Resets logs to default state
  const handleClearRecords = () => {
    setRecords([]);
  };

  const handleResetToDefault = () => {
    setRecords(INITIAL_SCAN_RECORDS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  // Setup dynamic reference to handleScanResult to bypass React stale closures
  const handleScanRef = React.useRef(handleScanResult);
  useEffect(() => {
    handleScanRef.current = handleScanResult;
  });

  // Global rapid detector of physical laser gun barcode scanners
  useEffect(() => {
    let lastKeyTime = Date.now();
    let scanBuffer = '';
    let bufferClearTimeout: NodeJS.Timeout | null = null;

    const handleGlobalScanKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Filter numbers
      if (/^[0-9]$/.test(e.key)) {
        if (bufferClearTimeout) {
          clearTimeout(bufferClearTimeout);
        }

        // Real gun input has less than 80ms delay between keys
        if (timeDiff > 200 && isInput) {
          scanBuffer = e.key;
        } else {
          scanBuffer += e.key;
        }

        // Wipe buffer if no key is entered for 400ms
        bufferClearTimeout = setTimeout(() => {
          scanBuffer = '';
        }, 400);

        if (scanBuffer.length === 8) {
          const scannedDni = scanBuffer;
          scanBuffer = '';
          if (bufferClearTimeout) clearTimeout(bufferClearTimeout);

          handleScanRef.current(scannedDni);

          if (isInput) {
            activeEl.blur();
          }
        }
      } else if (e.key === 'Enter') {
        if (scanBuffer.length >= 7 && scanBuffer.length <= 10) {
          const scannedDni = scanBuffer;
          scanBuffer = '';
          if (bufferClearTimeout) clearTimeout(bufferClearTimeout);

          handleScanRef.current(scannedDni);

          if (isInput) {
            activeEl.blur();
          }
          e.preventDefault();
        } else {
          scanBuffer = '';
        }
      } else {
        // Clear if not a numeric key or enter
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          scanBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleGlobalScanKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleGlobalScanKeyDown, true);
      if (bufferClearTimeout) clearTimeout(bufferClearTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1122] text-slate-100 flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* 1. App Top Clinical Header */}
      <header className="border-b border-slate-900 bg-[#0a1122]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4 transition-all select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Logo & title brand */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-3xl shadow-lg shadow-teal-500/10 text-slate-950">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-sans font-black text-slate-100 text-[17px] tracking-tight uppercase leading-none">
                  CONTROL DE TICKETS
                </h1>
                <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  v3.5 Live
                </span>
              </div>
              <span className="text-slate-400 text-xs mt-0.5 block leading-none">Instituto Nacional de Salud del Niño de Nutrición y Guardia</span>
            </div>
          </div>

          {/* Clock controller state and presets widget (Enlarged and highly readable on Desktop, compact on mobile/tablets) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-5 border lg:border-2 border-teal-500/35 bg-[#0e1930] p-3 lg:p-5 rounded-2xl lg:rounded-3xl shadow-xl shadow-teal-500/5">
            
            {/* Live Clock Display */}
            <div className="flex items-center gap-1.5 lg:gap-3 px-2 lg:px-4 justify-center">
              <Clock className="w-4 h-4 lg:w-5.5 lg:h-5.5 text-teal-400 shrink-0" />
              <div className="text-center font-mono">
                <span className="text-sm lg:text-lg font-black text-slate-100 block tracking-tight leading-none">
                  {formattedTime}
                </span>
                <span className="text-[8px] lg:text-[10px] text-slate-350 font-sans block leading-none mt-1 lg:mt-2 font-medium">
                  {currentDateTime.toLocaleDateString('es-PE', { month: 'short', day: '2-digit' })} ({useRealTime ? 'HORA DISPOSITIVO' : 'HORA SIMULADA'})
                </span>
              </div>
            </div>

            {/* Time Source Selector */}
            <div className="h-px sm:h-6 lg:h-12 w-full sm:w-px bg-slate-800"></div>

            <div className="flex flex-col gap-1.5 lg:gap-2.5 flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 lg:gap-4 justify-between">
                <span className="text-[10px] lg:text-xs text-teal-400 uppercase tracking-widest font-black font-sans">Simular Escenario Clínico</span>
                
                {/* Realtime switch checkbox */}
                <label className="inline-flex items-center gap-1.5 lg:gap-2 cursor-pointer text-[10px] lg:text-xs text-slate-350 font-bold select-none hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={useRealTime}
                    onChange={(e) => setUseRealTime(e.target.checked)}
                    className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <span>Usar Hora Real</span>
                </label>
              </div>

              {/* Time Presets buttons */}
              <div className="flex flex-wrap gap-1 lg:gap-1.5">
                <button
                  type="button"
                  onClick={() => setSimulatedHour(7, 30)}
                  className={`px-2 py-1 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 ${
                    !useRealTime && currentDateTime.getHours() === 7 ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20 border border-teal-450' : 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-slate-100 border border-slate-700'
                  }`}
                  title="Establecer las 07:30 AM"
                >
                  🌅 Desayuno
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedHour(9, 13)}
                  className={`px-2 py-1 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 ${
                    !useRealTime && currentDateTime.getHours() === 9 ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-450' : 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-slate-100 border border-slate-700'
                  }`}
                  title="Establecer las 09:13 AM (Fuera de horario Desayuno)"
                >
                  ⏰ 9:13 AM
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedHour(13, 15)}
                  className={`px-2 py-1 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 ${
                    !useRealTime && currentDateTime.getHours() === 13 ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20 border border-teal-450' : 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-slate-100 border border-slate-700'
                  }`}
                  title="Establecer las 01:15 PM"
                >
                  ☀️ Almuerzo
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedHour(16, 45)}
                  className={`px-2 py-1 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 ${
                    !useRealTime && currentDateTime.getHours() === 16 ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-450' : 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-slate-100 border border-slate-700'
                  }`}
                  title="Establecer las 04:45 PM"
                >
                  ☕ Fuera Horas
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedHour(20, 30)}
                  className={`px-2 py-1 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 ${
                    !useRealTime && currentDateTime.getHours() === 20 ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20 border border-teal-450' : 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-slate-100 border border-slate-700'
                  }`}
                  title="Establecer las 08:30 PM"
                >
                  🌙 Cena
                </button>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        


        {/* Primary responsive grid (Wider main column space for Scanner and Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE COLUMN: Scanner View and Validation Result cards (8 cols - Expanded horizontally) */}
          <div className="lg:col-span-8 space-y-6">
            <ScannerTerminal
              onScanResult={handleScanResult}
              activeMeal={activeMeal}
              lastScannedWorker={lastScannedWorker}
              lastScanStatus={lastScanStatus}
              lastScanMessage={lastScanMessage}
              lastScanTime={lastScanTime}
              onClearLastScan={() => {
                setLastScannedWorker(null);
                setLastScanStatus(null);
                setLastScanMessage(null);
              }}
              isSimulatedTimeActive={!useRealTime}
            />

            {/* Daily stats with custom charts */}
            <NutritionCharts records={records} />
          </div>

          {/* RIGHT SIDE COLUMN: Notification alerts (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Notification flow */}
            <NotificationCenter
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onClearAll={handleClearNotifications}
              onAddSimulatedNotif={addNotification}
            />

          </div>

        </div>

        {/* BOTTOM SECTION: Control Log Grid (Full Width) */}
        <ScanHistory
          records={records}
          onClearRecords={handleClearRecords}
          onResetToDefault={handleResetToDefault}
        />

      </main>

      {/* 3. Footer branding */}
      <footer className="border-t border-slate-900 bg-[#060b17]/90 py-6 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Plataforma Médica de Distribución Alimenticia - Instituto Nacional de Salud del Niño © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Escáner Conectado en puerto USB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
