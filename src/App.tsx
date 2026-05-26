import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import LoginScreen from './components/LoginScreen';

// Icons
import { 
  HeartPulse, Clock, Calendar, CheckSquare, Layers, HelpCircle, 
  Settings, Radio, Lightbulb, Bell, AlertCircle, Info, Star, LogOut,
  Activity
} from 'lucide-react';

export default function App() {
  // Authentic simulated identity gates
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('insn_food_logged_in') === 'true';
  });
  const [loggedUser, setLoggedUser] = useState<string>(() => {
    return localStorage.getItem('insn_food_logged_user') || 'admin/insn';
  });

  const [activeTab, setActiveTab] = useState<'scan' | 'metrics' | 'history'>('scan');

  const handleLoginSuccess = (usr: string) => {
    setIsLoggedIn(true);
    setLoggedUser(usr);
    localStorage.setItem('insn_food_logged_in', 'true');
    localStorage.setItem('insn_food_logged_user', usr);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedUser('');
    localStorage.removeItem('insn_food_logged_in');
    localStorage.removeItem('insn_food_logged_user');
  };

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
    const worker = HOSPITAL_WORKERS.find(w => w.dni.trim().toUpperCase() === dni.trim().toUpperCase());

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
      if (!isLoggedIn) return; // Guard scanner while on login screen

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
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col justify-between selection:bg-[#342D86]/10 selection:text-[#342D86]">
      
      {/* 1. App Top Clinical Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 py-2 sm:py-3 transition-all select-none shadow-sm">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-4">
          
          {/* Logo & title brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="shrink-0 bg-slate-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex items-center justify-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn9TfXpX99Vd5zMd625vUQ-gWG8zrTBWad0w&s" 
                alt="INSN Logo" 
                className="h-11 sm:h-14 w-auto object-contain transition-all" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== "https://www.insn.gob.pe/wp-content/uploads/2019/12/logo-insn.png") {
                    target.src = "https://www.insn.gob.pe/wp-content/uploads/2019/12/logo-insn.png";
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">
                <h1 className="font-sans font-black text-[#342D86] text-xs sm:text-base md:text-lg lg:text-base xl:text-xl tracking-tight uppercase leading-none whitespace-nowrap">
                  CONTROL DE GESTIÓN ALIMENTARIA
                </h1>
                <span className="bg-[#342D86]/8 border border-[#342D86]/20 text-[#342D86] font-sans text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md tracking-wider uppercase shrink-0">
                  V1.0
                </span>
              </div>
              <div className="text-slate-700 text-[10px] sm:text-xs font-extrabold mt-0.5 sm:mt-1 leading-tight">
                Instituto Nacional de Salud del Niño
              </div>
              <div className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5 leading-none font-medium">
                Oficina de Estadística e Informática
              </div>
            </div>
          </div>

          {/* Clock controller state, presets widget & Logout action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3 justify-center sm:justify-start lg:justify-end">
            
            {/* Clock presets box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 lg:gap-2.5 border border-slate-200 bg-slate-50 p-1 sm:p-1.5 px-2 rounded-xl lg:rounded-2xl shadow-xs">
              
              {/* Live Clock Display */}
              <div className="flex items-center gap-1 px-0.5 justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#342D86] shrink-0" />
                <div className="text-center font-mono">
                  <span className="text-[11px] sm:text-xs lg:text-sm font-black text-slate-850 block tracking-tight leading-none">
                    {formattedTime}
                  </span>
                  <span className="text-[7.5px] lg:text-[8px] text-slate-500 font-sans block leading-none mt-0.5 font-medium whitespace-nowrap">
                    {currentDateTime.toLocaleDateString('es-PE', { month: 'short', day: '2-digit' })} ({useRealTime ? 'HORA BASE' : 'SIMULADA'})
                  </span>
                </div>
              </div>

              {/* Time Source Selector */}
              <div className="h-px sm:h-3.5 lg:h-7 w-full sm:w-px bg-slate-200 shrink-0"></div>

              <div className="flex flex-col gap-0.5 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2 lg:gap-3 justify-between">
                  <span className="text-[8px] lg:text-[9px] text-[#582A85] uppercase tracking-wider font-black font-sans">Simular Escenario Clínico</span>
                  
                  {/* Realtime switch checkbox */}
                  <label className="inline-flex items-center gap-0.5 cursor-pointer text-[8px] lg:text-[9px] text-slate-600 font-extrabold select-none hover:text-[#342D86] transition-colors">
                    <input
                      type="checkbox"
                      checked={useRealTime}
                      onChange={(e) => setUseRealTime(e.target.checked)}
                      className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded border-slate-300 bg-white text-[#342D86] focus:ring-[#342D86] cursor-pointer"
                    />
                    <span>Usar Hora Real</span>
                  </label>
                </div>

                {/* Time Presets buttons */}
                <div className="flex flex-wrap gap-0.5">
                  <button
                    type="button"
                    onClick={() => setSimulatedHour(7, 30)}
                    className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-black transition-all duration-200 cursor-pointer flex items-center gap-0.5 hover:scale-105 active:scale-95 ${
                      !useRealTime && currentDateTime.getHours() === 7 ? 'bg-[#00A089] text-white font-black shadow-sm border border-[#00A089]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                    title="Establecer las 07:30 AM"
                  >
                    🌅 Desayuno
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedHour(9, 13)}
                    className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-black transition-all duration-200 cursor-pointer flex items-center gap-0.5 hover:scale-105 active:scale-95 ${
                      !useRealTime && currentDateTime.getHours() === 9 ? 'bg-[#F9B719] text-[#342D86] font-black shadow-sm border border-[#F9B719]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                    title="Establecer las 09:13 AM (Fuera de horario Desayuno)"
                  >
                    ⏰ Fuera Horas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedHour(13, 15)}
                    className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-black transition-all duration-200 cursor-pointer flex items-center gap-0.5 hover:scale-105 active:scale-95 ${
                      !useRealTime && currentDateTime.getHours() === 13 ? 'bg-[#00A089] text-white font-black shadow-sm border border-[#00A089]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                    title="Establecer las 01:15 PM"
                  >
                    ☀️ Almuerzo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedHour(16, 45)}
                    className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-black transition-all duration-200 cursor-pointer flex items-center gap-0.5 hover:scale-105 active:scale-95 ${
                      !useRealTime && currentDateTime.getHours() === 16 ? 'bg-[#F9B719] text-[#342D86] font-black shadow-sm border border-[#F9B719]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                    title="Establecer las 04:45 PM"
                  >
                    ☕ Fuera Horas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedHour(20, 30)}
                    className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-black transition-all duration-200 cursor-pointer flex items-center gap-0.5 hover:scale-105 active:scale-95 ${
                      !useRealTime && currentDateTime.getHours() === 20 ? 'bg-[#00A089] text-white font-black shadow-sm border border-[#00A089]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                    title="Establecer las 08:30 PM"
                  >
                    🌙 Cena
                  </button>
                </div>
              </div>

            </div>

            {/* Session Info badge and Logout */}
            <div className="flex items-center gap-2 border border-slate-200 bg-[#342D86]/5 hover:bg-[#342D86]/10 p-1 sm:p-1.5 px-2.5 rounded-xl lg:rounded-2xl shadow-xs transition-all duration-200 shrink-0 hover:shadow-xs">
              <div className="text-right leading-none hidden sm:block">
                <div className="text-[7px] lg:text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest">Usuario Activo</div>
                <div className="text-[10px] lg:text-[11px] font-black text-[#342D86] truncate max-w-[110px] font-sans mt-0.5" title={loggedUser}>
                  {loggedUser.split('@')[0]}
                </div>
              </div>
              <div className="w-px h-5 bg-slate-300/60 hidden sm:block"></div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 p-1.5 rounded-lg lg:rounded-xl transition-all hover:scale-105 active:scale-[0.96] cursor-pointer flex items-center justify-center gap-1 text-[9px] font-black uppercase shadow-xs shrink-0"
                title="Cerrar la sesión de raciones clínicas"
              >
                <LogOut className="w-3 h-3 text-red-500" />
                <span className="text-[8px] tracking-wider text-slate-600">Salir</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-white/85 backdrop-blur-md rounded-2xl p-1.5 shadow-sm overflow-x-auto select-none gap-1 sm:gap-2 border border-slate-200/60" id="main-navigation-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer uppercase shrink-0 ${
              activeTab === 'scan'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeTab === 'scan' ? 'animate-pulse' : ''}`} />
            <span>Terminal de Escaneo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer uppercase shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Métricas Nutricionales</span>
            <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
              activeTab === 'metrics' ? 'bg-white/20 text-white' : 'bg-[#E2F1F0] text-[#00A089]'
            }`}>
              {records.filter(r => r.status === 'VALID_COMPLETED' || (r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin)).length} raciones
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer uppercase shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Historial y Control Diario</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full h-4 min-w-4 flex items-center justify-center animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Tab Panes with motion animations */}
        <div className="relative min-h-[350px]" id="active-tab-container">
          <AnimatePresence mode="wait">
            {activeTab === 'scan' && (
              <motion.div
                key="scan-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
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
              </motion.div>
            )}

            {activeTab === 'metrics' && (
              <motion.div
                key="metrics-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <NutritionCharts records={records} activeMeal={activeMeal} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* 8-column wide list log */}
                <div className="lg:col-span-8">
                  <ScanHistory
                    records={records}
                    onClearRecords={handleClearRecords}
                    onResetToDefault={handleResetToDefault}
                  />
                </div>

                {/* 4-column notification widget logs */}
                <div className="lg:col-span-4">
                  <NotificationCenter
                    notifications={notifications}
                    onMarkRead={handleMarkNotifRead}
                    onClearAll={handleClearNotifications}
                    onAddSimulatedNotif={addNotification}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* 3. Footer branding */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Plataforma Médica de Distribución Alimenticia - Instituto Nacional de Salud del Niño © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full font-mono">
            <Radio className="w-3.5 h-3.5 text-[#00A089] animate-pulse" />
            <span>Escáner Conectado en puerto USB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
