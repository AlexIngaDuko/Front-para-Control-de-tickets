import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import CriticalWorkers from './components/CriticalWorkers';

// Critical hospital workers data
import { CRITICAL_HOSPITAL_WORKERS } from './data_critical';

// Icons
import { 
  HeartPulse, Clock, Calendar, CheckSquare, Layers, HelpCircle, 
  Settings, Radio, Lightbulb, Bell, AlertCircle, Info, Star, LogOut,
  Activity, ChevronDown, Users
} from 'lucide-react';

export default function App() {
  // Authentic simulated identity gates
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('insn_food_logged_in') === 'true';
  });
  const [loggedUser, setLoggedUser] = useState<string>(() => {
    return localStorage.getItem('insn_food_logged_user') || 'admin/insn';
  });

  const [activeTab, setActiveTab] = useState<'scan' | 'critical' | 'metrics' | 'history'>('scan');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  const [useRealTime, setUseRealTime] = useState<boolean>(true);
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
      hour12: true,
      timeZone: 'America/Lima'
    });
  }, [currentDateTime]);

  const formattedDate = useMemo(() => {
    return currentDateTime.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    });
  }, [currentDateTime]);

  const formattedShortDateStr = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat('fr-CA', { 
        timeZone: 'America/Lima', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      return formatter.format(currentDateTime);
    } catch (e) {
      const year = currentDateTime.getFullYear();
      const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(currentDateTime.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
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
  const [lastScanAuthByAdmin, setLastScanAuthByAdmin] = useState<boolean>(false);

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
  const handleScanResult = (dni: string) => {
    // Current timestamp strings
    const scanTimeStr = currentDateTime.toLocaleTimeString('es-PE', { hour12: false, timeZone: 'America/Lima' });
    const scanDateStr = formattedShortDateStr;

    // Look up employee
    const ALL_WORKERS = [...HOSPITAL_WORKERS, ...CRITICAL_HOSPITAL_WORKERS];
    const worker = ALL_WORKERS.find(w => w.dni.trim().toUpperCase() === dni.trim().toUpperCase());

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
        status: 'ACTIVE'
      });
      setLastScanStatus('INVALID_CODE');
      setLastScanAuthByAdmin(false);
      setLastScanMessage(`El DNI ${dni} ingresado no se encuentra en la base de datos de trabajadores clínicos del hospital.`);
      setLastScanTime(scanTimeStr);

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
      setLastScanAuthByAdmin(false);
      
      const prevScan = records.find(r => 
        r.workerId === worker.id && 
        r.mealType === activeMeal!.type && 
        r.scanDate === scanDateStr && 
        r.status === 'VALID_COMPLETED'
      );
      const prevTime = prevScan ? prevScan.scanTime : 'hace unos minutos';

      setLastScanMessage(`¡TICKET DUPLICADO DETECTADO! El empleado ya consumió su ración asignada de ${activeMeal!.label} hoy a las ${prevTime}. Por directiva estricta institucional, no se permite ninguna ración de excepción ni doble entrega.`);
      
      // Register duplicate ticket scan in daily history
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
        statusMessage: `Intento de Duplicado de Ración de ${activeMeal!.label}`,
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

    // 3. Out of Clinical Hours Check
    if (!activeMeal) {
      playWarningChime();
      setLastScanStatus('OUT_OF_SCHEDULE');
      setLastScanAuthByAdmin(false);
      setLastScanMessage(`FUERA DE HORARIO: No existe un turno de alimentación activo para este horario. Pídele al administrador autorizar la ración especial.`);
      
      addNotification(
        '⚠️ Fuera de Horario',
        `${worker.lastNames}, ${worker.names} escaneó ticket fuera de horario general. Admite excepción razonada.`,
        'warning'
      );
      return;
    }

    // 4. PENDING SUCCESS SCENARIO - Normal within schedule & conditions met
    playWarningChime();
    setLastScanStatus('PENDING_VALID');
    setLastScanAuthByAdmin(false);
    setLastScanMessage(`Lectura de DNI detectada con éxito. El trabajador figura activo. Presiona "Autorizar Consumo" para habilitarlo y confirmar la ración de ${activeMeal.label}.`);
  };

  const handleConfirmScan = (isOverride: boolean = false) => {
    if (!lastScannedWorker) return;

    const scanTimeStr = currentDateTime.toLocaleTimeString('es-PE', { hour12: false, timeZone: 'America/Lima' });
    const scanDateStr = formattedShortDateStr;

    if (isOverride) {
      // Out of schedule authorization
      playSuccessBeep();
      setLastScanStatus('VALID_COMPLETED');
      setLastScanAuthByAdmin(true);
      setLastScanMessage(`Autorizado de Excepción - El trabajador ${lastScannedWorker.names} ha sido habilitado con autorización manual para consumir ración fuera de horario.`);
      
      const mockCalories = activeMeal?.calories || 600;
      const mockProtein = activeMeal?.protein || 28;
      const mockCarbs = activeMeal?.carbs || 75;

      const overriddenRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: lastScannedWorker.id,
        names: lastScannedWorker.names,
        lastNames: lastScannedWorker.lastNames,
        dni: lastScannedWorker.dni,
        service: lastScannedWorker.service,
        role: lastScannedWorker.role,
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
        `Autorización excepcional de ración fuera de horario para ${lastScannedWorker.lastNames}, ${lastScannedWorker.names}.`,
        'info'
      );
    } else {
      // Normal schedule authorization
      if (!activeMeal) return;

      playSuccessBeep();
      setLastScanStatus('VALID_COMPLETED');
      setLastScanAuthByAdmin(false);
      setLastScanMessage(`¡AUTORIZADO! Se ha acreditado de manera exitosa la ración de ${activeMeal.label} para el empleado ${lastScannedWorker.names} ${lastScannedWorker.lastNames}.`);

      const validRecord: ScanRecord = {
        id: `scan-${Date.now()}`,
        workerId: lastScannedWorker.id,
        names: lastScannedWorker.names,
        lastNames: lastScannedWorker.lastNames,
        dni: lastScannedWorker.dni,
        service: lastScannedWorker.service,
        role: lastScannedWorker.role,
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
        `${lastScannedWorker.names} ${lastScannedWorker.lastNames} (${lastScannedWorker.service}) ha consumido ${activeMeal.label}.`,
        'success'
      );
    }
  };

  const handleCriticalWorkersAuthorize = (workers: Worker[], isExceptional: boolean, selectedMealType: MealType) => {
    const scanTimeStr = currentDateTime.toLocaleTimeString('es-PE', { hour12: false, timeZone: 'America/Lima' });
    const scanDateStr = formattedShortDateStr;
    const activeSched = MEAL_SCHEDULES.find(s => s.type === selectedMealType);
    
    const mockCalories = activeSched?.calories || (selectedMealType === 'DESAYUNO' ? 450 : selectedMealType === 'ALMUERZO' ? 750 : 600);
    const mockProtein = activeSched?.protein || (selectedMealType === 'DESAYUNO' ? 18 : selectedMealType === 'ALMUERZO' ? 32 : 25);
    const mockCarbs = activeSched?.carbs || (selectedMealType === 'DESAYUNO' ? 62 : selectedMealType === 'ALMUERZO' ? 95 : 80);

    const newRecords: ScanRecord[] = workers.map((w, index) => ({
      id: `scan-${Date.now()}-${w.id}-${index}`,
      workerId: w.id,
      names: w.names,
      lastNames: w.lastNames,
      dni: w.dni,
      service: w.service,
      role: w.role,
      mealType: selectedMealType,
      scanTime: scanTimeStr,
      scanDate: scanDateStr,
      status: 'VALID_COMPLETED',
      statusMessage: isExceptional 
        ? `Autorizado Excepcional - Registro manual (Fuera de Horario)`
        : `Autorizado - Suministro de ración para ${selectedMealType}`,
      calories: mockCalories,
      protein: mockProtein,
      carbs: mockCarbs,
      authByAdmin: isExceptional
    }));

    if (newRecords.length > 0) {
      setRecords(prev => [...newRecords, ...prev]);
      playSuccessBeep();

      const namesStr = workers.map(w => `${w.names} ${w.lastNames}`).slice(0, 3).join(', ');
      const overflowStr = workers.length > 3 ? ` y ${workers.length - 3} profesionales más` : '';

      addNotification(
        isExceptional ? '⚙️ Excepción Especial' : '🟢 Raciones Emitidas por Lote',
        `Se autorizaron ${workers.length} raciones de ${selectedMealType} para personal crítico en ${workers[0].service} (${namesStr}${overflowStr}).`,
        isExceptional ? 'warning' : 'success'
      );
    }
  };

  // 5. Notifications helpers
  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'alert') => {
    const timeStr = currentDateTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' });
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

  const handleRevokeLastScan = () => {
    setRecords(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      // Mark the most recent record as 'REVOKED'
      updated[0] = {
        ...updated[0],
        status: 'REVOKED',
        statusMessage: 'El ticket de ración de alimentos fue revocado por el administrador.',
        calories: 0,
        protein: 0,
        carbs: 0
      };
      return updated;
    });

    setLastScanStatus('REVOKED');
    setLastScanMessage('El ticket de ración de alimentos fue revocado por el supervisor de la Oficina de Estadística e Informática.');
    
    addNotification(
      '🔴 Consumo Revocado',
      'Se ha revocado el último consumo registrado del anterior trabajador.',
      'alert'
    );
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
                  V1.0.0
                </span>
              </div>
              <div className="text-slate-700 text-[10px] sm:text-xs font-extrabold mt-0.5 sm:mt-1 leading-tight">
                Instituto Nacional de Salud del Niño
              </div>
              <div className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5 leading-none font-medium">
                Oficina de Estadística e Informática - 2026
              </div>
            </div>
          </div>

          {/* Clock controller state, presets widget & Logout action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3 justify-center sm:justify-start lg:justify-end">
            
            {/* Clock presets box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 lg:gap-2.5 border border-slate-200 bg-slate-50 p-1 sm:p-1.5 px-2 rounded-xl lg:rounded-2xl shadow-xs relative">
              
              {/* Live Clock Display */}
              <div className="flex items-center gap-1 px-0.5 justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#342D86] shrink-0" />
                <div className="text-center font-mono">
                  <span className="text-[11px] sm:text-xs lg:text-sm font-black text-slate-850 block tracking-tight leading-none">
                    {formattedTime}
                  </span>
                  <span className="text-[7.5px] lg:text-[8px] text-slate-500 font-sans block leading-none mt-0.5 font-medium whitespace-nowrap">
                    {currentDateTime.toLocaleDateString('es-PE', { month: 'short', day: '2-digit', timeZone: 'America/Lima' })} ({useRealTime ? 'HORA BASE' : 'SIMULADA'})
                  </span>
                </div>
              </div>

              {/* Simulation Dropdown Selector */}
              <div ref={timeDropdownRef} className="relative flex justify-center py-1 sm:py-0 px-1">
                <button
                  type="button"
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className={`px-2.5 py-1.5 rounded-lg lg:rounded-xl transition-all hover:scale-105 active:scale-[0.96] cursor-pointer flex items-center justify-center gap-1 text-[10px] font-black uppercase border border-slate-200 shadow-xs ${
                    showTimeDropdown 
                      ? 'bg-[#342D86] text-white' 
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                  id="simulator-clock-btn"
                  title="Simular diferentes horarios"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Configurar Hora</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {/* Dropdown Options List */}
                <AnimatePresence>
                  {showTimeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 sm:left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] p-1.5 block text-left"
                      style={{ transformOrigin: 'top left' }}
                    >
                      <div className="text-[8px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-100 select-none">
                        Turnos de Comida
                      </div>
                      
                      {/* Desayuno: 08:30 AM */}
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedHour(8, 30);
                          addNotification(
                            '🕒 Hora Simulada',
                            'Se ha simulado el reloj del sistema en el horario de Desayuno (08:30 AM).',
                            'info'
                          );
                          setShowTimeDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-sans font-bold">
                          ☀️ Desayuno
                        </span>
                        <span className="font-mono text-[9px] bg-amber-50 text-amber-700 px-1 rounded font-black">
                          08:30
                        </span>
                      </button>

                      {/* Almuerzo: 13:15 PM */}
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedHour(13, 15);
                          addNotification(
                            '🕒 Hora Simulada',
                            'Se ha simulado el reloj del sistema en el horario de Almuerzo de Turno (01:15 PM).',
                            'info'
                          );
                          setShowTimeDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-sans font-bold">
                          🥗 Almuerzo
                        </span>
                        <span className="font-mono text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded font-black">
                          13:15
                        </span>
                      </button>

                      {/* Cena: 20:45 PM */}
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedHour(20, 45);
                          addNotification(
                            '🕒 Hora Simulada',
                            'Se ha simulado el reloj del sistema en el horario de Cena Nutritiva (08:45 PM).',
                            'info'
                          );
                          setShowTimeDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-sans font-bold">
                          🌌 Cena
                        </span>
                        <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-black">
                          20:45
                        </span>
                      </button>

                      <div className="h-px bg-slate-100 my-1"></div>

                      <div className="text-[8px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider select-none">
                        Tiempo Real
                      </div>

                      {/* Hora Real */}
                      <button
                        type="button"
                        onClick={() => {
                          setUseRealTime(true);
                          addNotification(
                            '🟢 Hora Real Activa',
                            'El reloj del sistema ahora utiliza el tiempo real del dispositivo.',
                            'success'
                          );
                          setShowTimeDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                          useRealTime 
                            ? 'bg-[#342D86]/10 text-[#342D86]' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-sans">
                          ⏳ Hora Real
                        </span>
                        {useRealTime && (
                          <span className="w-1.5 h-1.5 bg-[#00A089] rounded-full animate-pulse" />
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time Source Selector Divider */}
              <div className="h-px sm:h-3.5 lg:h-7 w-full sm:w-px bg-slate-200 shrink-0"></div>

              {/* Notification Bell Button & Dropdown */}
              <div ref={notifDropdownRef} className="relative flex justify-center py-1 sm:py-0 px-1">
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className={`relative p-2 rounded-lg lg:rounded-xl transition-all hover:scale-105 active:scale-[0.96] cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black uppercase ${
                    showNotifDropdown 
                      ? 'bg-[#342D86] text-white shadow-xs' 
                      : 'bg-white hover:bg-slate-100 text-[#342D86] border border-slate-200 shadow-xs'
                  }`}
                  id="notifications-bell-header-btn"
                  title="Ver alertas del sistema"
                >
                  <Bell className={`w-4 h-4 ${notifications.filter(n => !n.read).length > 0 ? 'animate-bounce' : ''}`} />
                  <span className="text-[9px] tracking-wider font-extrabold hidden lg:inline">Alertas</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown dropdown popup list */}
                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 block text-left"
                      style={{ transformOrigin: 'top right' }}
                    >
                      {/* Speech bubble pointer arrow */}
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-201 rotate-45 pointer-events-none" />

                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-[10px] font-black text-[#342D86] uppercase tracking-wider">
                          Central de Alertas ({notifications.filter(n => !n.read).length} no leídas)
                        </span>
                        <div className="flex gap-1.5 items-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Mark all read
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            }}
                            className="text-[8.5px] font-black text-[#00A089] hover:underline uppercase transition-all"
                          >
                            Leídas
                          </button>
                          <span className="text-slate-300 text-[9px] font-medium font-sans">|</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearNotifications();
                            }}
                            className="text-[8.5px] font-black text-rose-650 hover:underline uppercase transition-all"
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Scroll List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 select-none custom-scrollbar text-xs">
                        {notifications.map((notification) => {
                          const isSuccess = notification.type === 'success';
                          const isWarning = notification.type === 'warning';
                          const isAlert = notification.type === 'alert';
                          const badgeColor = isSuccess 
                            ? 'bg-[#00A089]/8 text-[#00A089] border-l-[#00A089]' 
                            : isWarning 
                              ? 'bg-[#F9B719]/8 text-[#342D86] border-l-[#F9B719]' 
                              : isAlert 
                                ? 'bg-rose-50 text-rose-700 border-l-rose-500' 
                                : 'bg-slate-50 text-slate-700 border-l-[#342D86]';
                          
                          return (
                            <div
                              key={notification.id}
                              onClick={() => handleMarkNotifRead(notification.id)}
                              className={`p-2.5 rounded-lg border border-slate-100 border-l-3 ${badgeColor} transition-all relative flex flex-col gap-1 cursor-pointer hover:bg-slate-50/50 group text-left`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-sans font-black text-[#342D86] text-[10.5px] leading-tight truncate">
                                  {notification.title}
                                </span>
                                {!notification.read && (
                                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-600 font-medium leading-relaxed font-sans break-words whitespace-normal line-clamp-3">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[8px] text-slate-500 font-mono font-bold leading-none">
                                <span>A las {notification.timestamp}</span>
                                {!notification.read && (
                                  <span className="text-[7.5px] uppercase font-black text-[#00A089] group-hover:underline">
                                    Marcar leído
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {notifications.length === 0 && (
                          <div className="text-center py-6 text-slate-400 font-bold text-[10px] uppercase leading-relaxed font-sans">
                            Sin alertas disponibles.
                          </div>
                        )}
                      </div>
                      
                      {/* View all button to switch tabs */}
                      <div className="border-t border-slate-100 pt-2 mt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('history');
                            setShowNotifDropdown(false);
                          }}
                          className="text-[9.5px] font-black text-[#342D86] hover:text-[#00A089] uppercase tracking-wider font-sans leading-none flex items-center gap-1 cursor-pointer"
                        >
                          Ver historial &rarr;
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        <div className="grid grid-cols-4 w-full overflow-hidden bg-white/85 backdrop-blur-md rounded-2xl p-1.5 shadow-sm select-none gap-1 sm:gap-2 border border-slate-200/60" id="main-navigation-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col md:flex-row items-center justify-center text-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 rounded-xl text-[8.5px] sm:text-[10px] md:text-xs lg:text-[13px] font-black transition-all duration-200 cursor-pointer uppercase ${
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
            onClick={() => setActiveTab('critical')}
            className={`flex flex-col md:flex-row items-center justify-center text-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 rounded-xl text-[8.5px] sm:text-[10px] md:text-xs lg:text-[13px] font-black transition-all duration-200 cursor-pointer uppercase ${
              activeTab === 'critical'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="truncate">Trabajador Crítico</span>
            <span className={`text-[8px] sm:text-[9px] font-black tracking-wider px-1 sm:px-2 py-0.5 rounded-full shrink-0 ${
              activeTab === 'critical' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'
            }`}>
              90 per.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex flex-col md:flex-row items-center justify-center text-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 rounded-xl text-[8.5px] sm:text-[10px] md:text-xs lg:text-[13px] font-black transition-all duration-200 cursor-pointer uppercase ${
              activeTab === 'metrics'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="truncate">Métricas</span>
            <span className={`text-[8px] sm:text-[9px] font-black tracking-wider px-1 sm:px-2 py-0.5 rounded-full shrink-0 ${
              activeTab === 'metrics' ? 'bg-white/20 text-white' : 'bg-[#E2F1F0] text-[#00A089]'
            }`}>
              {records.filter(r => r.status === 'VALID_COMPLETED' || (r.status === 'OUT_OF_SCHEDULE' && r.authByAdmin)).length} rac.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col md:flex-row items-center justify-center text-center gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 rounded-xl text-[8.5px] sm:text-[10px] md:text-xs lg:text-[13px] font-black transition-all duration-200 cursor-pointer uppercase ${
              activeTab === 'history'
                ? 'bg-[#342D86] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#342D86]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="truncate">Historial</span>
            {records.length > 0 && (
              <span className={`text-[8px] sm:text-[9px] font-black tracking-wider px-1 sm:px-2 py-0.5 rounded-full shrink-0 ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {records.length} reg.
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
                  onConfirmScan={handleConfirmScan}
                  activeMeal={activeMeal}
                  lastScannedWorker={lastScannedWorker}
                  lastScanStatus={lastScanStatus}
                  lastScanMessage={lastScanMessage}
                  lastScanTime={lastScanTime}
                  lastScanAuthByAdmin={lastScanAuthByAdmin}
                  onClearLastScan={() => {
                    setLastScannedWorker(null);
                    setLastScanStatus(null);
                    setLastScanMessage(null);
                    setLastScanAuthByAdmin(false);
                  }}
                  onRevokeLastScan={handleRevokeLastScan}
                  isSimulatedTimeActive={!useRealTime}
                />
              </motion.div>
            )}

            {activeTab === 'critical' && (
              <motion.div
                key="critical-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto w-full"
              >
                <CriticalWorkers
                  records={records}
                  onAuthorizeWorkers={handleCriticalWorkersAuthorize}
                  activeMeal={activeMeal}
                  formattedShortDateStr={formattedShortDateStr}
                  currentDateTime={currentDateTime}
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
                className="max-w-6xl mx-auto w-full"
              >
                <ScanHistory
                  records={records}
                  onClearRecords={handleClearRecords}
                  onResetToDefault={handleResetToDefault}
                />
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
