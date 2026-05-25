import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, Camera, Laptop, RefreshCw, CheckCircle2, AlertTriangle, 
  XCircle, Keyboard, Clock, HelpCircle, ShieldAlert, ArrowRight, UserCheck
} from 'lucide-react';
import { Worker, ScanStatus, MealType, MealSchedule } from '../types';
import { HOSPITAL_WORKERS } from '../data';
import { playSuccessBeep, playErrorBuzzer, playWarningChime } from '../audio';

interface ScannerTerminalProps {
  onScanResult: (dni: string, authOverride?: boolean) => void;
  activeMeal: MealSchedule | null;
  lastScannedWorker: Worker | null;
  lastScanStatus: ScanStatus | null;
  lastScanMessage: string | null;
  lastScanTime: string | null;
  onClearLastScan: () => void;
  isSimulatedTimeActive: boolean;
}

export default function ScannerTerminal({
  onScanResult,
  activeMeal,
  lastScannedWorker,
  lastScanStatus,
  lastScanMessage,
  lastScanTime,
  onClearLastScan,
  isSimulatedTimeActive
}: ScannerTerminalProps) {
  const [manualDni, setManualDni] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [listenerActive, setListenerActive] = useState(true);
  const [scannerLog, setScannerLog] = useState<string[]>(['Iniciando consola de scanner hospitalario...', 'Listo para capturar lecturas...']);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Barcode listener state
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Focus helper
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [lastScannedWorker]);

  // Keyboard wedge emulations (physical barcode gun captures)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!listenerActive) return;
      
      // Do not capture if active input is outside or manually targeted
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== inputRef.current) {
        return;
      }

      const currentTime = Date.now();
      
      // Physical barcode guns type extremely fast (typically < 30ms between keystrokes)
      // We empty buffer if key delay is longer than 150ms to distinguish human typing from gun
      if (currentTime - lastKeyTimeRef.current > 150) {
        bufferRef.current = '';
      }
      
      lastKeyTimeRef.current = currentTime;

      // Filter digit keys
      if (/^[0-9]$/.test(e.key)) {
        bufferRef.current += e.key;
      } else if (e.key === 'Enter') {
        const potentialDni = bufferRef.current.trim();
        if (potentialDni.length >= 7 && potentialDni.length <= 10) {
          e.preventDefault();
          onScanResult(potentialDni);
          setScannerLog(prev => [`[PISTOLA SEÑAL] Código leído: ${potentialDni}`, ...prev.slice(0, 4)]);
          bufferRef.current = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [listenerActive, onScanResult]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDni.trim()) return;
    onScanResult(manualDni.trim());
    setScannerLog(prev => [`[Consola] Entrada manual: ${manualDni}`, ...prev.slice(0, 4)]);
    setManualDni('');
  };

  const addRandomScanLog = () => {
    const randomWorker = HOSPITAL_WORKERS[Math.floor(Math.random() * HOSPITAL_WORKERS.length)];
    onScanResult(randomWorker.dni);
    setScannerLog(prev => [`[Simulado] Escaneo aleatorio: ${randomWorker.names} - ${randomWorker.dni}`, ...prev.slice(0, 4)]);
  };

  const simulateLaserScan = (dni: string, label: string) => {
    setScannerLog(prev => [`[PISTOLA FÍSICA] Gatillo disparado para: DNI ${dni}`, ...prev.slice(0, 4)]);
    
    // Character by character emission to test the actual window wedge listener
    const digits = dni.split('');
    digits.forEach((digit, index) => {
      setTimeout(() => {
        const keyEvent = new KeyboardEvent('keydown', {
          key: digit,
          code: `Digit${digit}`,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(keyEvent);
      }, index * 20); // 20ms keyboard stream
    });

    // Final Enter key
    setTimeout(() => {
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(enterEvent);
    }, digits.length * 20 + 10);
  };

  const getStatusConfig = (status: ScanStatus) => {
    switch (status) {
      case 'VALID_COMPLETED':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/30',
          textColor: 'text-emerald-400',
          title: 'ACCESO AUTORIZADO',
          badgeText: 'Ticket Válido',
        };
      case 'DUPLICATE':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500 animate-pulse" />,
          bgColor: 'bg-red-500/10 border-red-500/30',
          textColor: 'text-red-500',
          title: 'ACCESO RECHAZADO - DUPLICADO',
          badgeText: 'Ticket Usado',
        };
      case 'OUT_OF_SCHEDULE':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-400" />,
          bgColor: 'bg-amber-500/10 border-amber-500/30',
          textColor: 'text-amber-400',
          title: 'ADVERTENCIA - FUERA DE HORARIO',
          badgeText: 'Fuera de Horario',
        };
      case 'INVALID_CODE':
        return {
          icon: <ShieldAlert className="w-12 h-12 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/30',
          textColor: 'text-rose-500',
          title: 'CÓDIGO NO REGISTRADO',
          badgeText: 'No Existe DNI',
        };
      case 'SUSPENDED_WORKER':
        return {
          icon: <XCircle className="w-12 h-12 text-slate-400" />,
          bgColor: 'bg-slate-700/10 border-slate-500/30',
          textColor: 'text-slate-400',
          title: 'TRABAJADOR EXCLUIDO / SUSPENDIDO',
          badgeText: 'Bloqueado Administrativo',
        };
    }
  };

  const isBypassAvailable = lastScanStatus === 'OUT_OF_SCHEDULE';

  return (
    <div className="space-y-6" id="scanner-terminal">
      {/* 1. Interactive Scanning Station */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400">
              <Scan className="w-6 h-6 animate-pulse" id="scan-terminal-icon" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-slate-100 uppercase tracking-wide">Puesto de Escaneo</h2>
              <p className="text-xs text-slate-400">Estación activa para lectora de barra o ingreso manual</p>
            </div>
          </div>
          
          {/* Active Meal Schedule Badge Header */}
          {activeMeal ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{activeMeal.label}</span>
              <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono text-indigo-200">
                {activeMeal.startTime} - {activeMeal.endTime}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase font-mono">Sin Turno de Alimento Activo</span>
            </div>
          )}
        </div>

        {/* 2 columns split: Scanning Cam Screen (left) and Scanning Config / logs (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Virtual Camera Viewfinder Screen (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between aspect-video rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden group">
            {cameraActive ? (
              <>
                {/* Simulated Camera Feed */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
                
                {/* Laser Sweep Beam Animation */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-red-500/80 shadow-[0_0_8px_#ef4444] z-10"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                />

                {/* Viewfinder brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br"></div>

                {/* Scanning Center Guidelines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="w-1/2 h-1/4 border border-dashed border-red-500/40 rounded flex items-center justify-center">
                    <span className="text-[10px] text-red-500/40 font-mono tracking-widest uppercase">Alinear Código</span>
                  </div>
                </div>

                {/* Live Banner */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm shadow px-3 py-1 rounded-full flex items-center gap-1.5 text-white text-[10px] font-bold tracking-wider uppercase">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  Simulador de Cámara Listo
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg border border-slate-800/40">
                  <span className="flex items-center gap-1 text-teal-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pistola USB Detectada
                  </span>
                  <span>Enfoque automático: ON</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <Camera className="w-12 h-12 mb-2 text-slate-600" />
                <p className="text-sm font-semibold">Simulador de cámara en pausa</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  La cámara ha sido desactiva. Aún puedes usar la pistola de barras o la consola de escritura.
                </p>
              </div>
            )}
          </div>

          {/* Quick actions Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Manual Form entry */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs uppercase font-sans font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-teal-400" />
                Ingreso manual o escáner
              </label>
              
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={10}
                    value={manualDni}
                    onChange={(e) => setManualDni(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Escribe DNI o emula pistola..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors font-mono"
                    id="barcode-manual-input"
                  />
                  {manualDni && (
                    <button 
                      type="button" 
                      onClick={() => setManualDni('')}
                      className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 rounded-xl transition-colors border border-slate-700 cursor-pointer"
                  id="btn-scan-manual-submit"
                >
                  Procesar
                </button>
              </form>

              <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                💡 <span className="font-semibold text-slate-400">LECTOR FÍSICO AUTOMÁTICO ACTIVO:</span> Apunta tu pistola de tickets a la pantalla y presiona el gatillo. La lectura se realiza de forma global en segundo plano.
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addRandomScanLog}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Escanear Profesional Azar
                </button>

                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-450 border border-slate-700 hover:text-slate-200 rounded-xl px-3.5 text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="Pausar/Activar Cámara"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Micro logs list */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 flex-1 min-h-[100px] flex flex-col justify-between">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Terminal Logs:</div>
              <div className="space-y-1 overflow-y-auto max-h-[85px] text-[10px] font-mono text-indigo-300 custom-scrollbar flex-1">
                {scannerLog.map((log, index) => (
                  <div key={index} className="truncate select-none opacity-80">
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Scanning Result Screen - Animates in upon scanner input */}
      <AnimatePresence mode="wait">
        {lastScannedWorker && lastScanStatus && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            id="scan-result-card"
          >
            {/* Colored ambient flash */}
            <div className={`absolute inset-0 opacity-[0.03] rounded-3xl pointer-events-none transition-colors duration-300 ${
              lastScanStatus === 'VALID_COMPLETED' ? 'bg-emerald-500' : 
              lastScanStatus === 'DUPLICATE' ? 'bg-red-500' : 'bg-amber-500'
            }`}></div>

            {/* Scanned Worker Visual Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-sans font-bold text-slate-100 text-lg">Trabajador del INSN</h3>
              </div>
              <button
                type="button"
                onClick={onClearLastScan}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar pantalla
              </button>
            </div>

            {/* Split layout inside results card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Profile Image card (from 3 expanded to 4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  {/* Status Indicator Frame Rings - scaled for larger photo size */}
                  <div className={`absolute -inset-2 rounded-full blur-md opacity-50 transition-colors ${
                    lastScanStatus === 'VALID_COMPLETED' ? 'bg-emerald-500' :
                    lastScanStatus === 'DUPLICATE' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></div>
                  
                  <img
                    src={lastScannedWorker.photoUrl}
                    alt={`${lastScannedWorker.names} ${lastScannedWorker.lastNames}`}
                    referrerPolicy="no-referrer"
                    className="relative w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-slate-700 bg-slate-950 shadow-xl"
                    onError={(e) => {
                      // Fallback clinical profile face SVG if Unsplash random blocks
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${lastScannedWorker.names}`;
                    }}
                  />
                  
                  {/* Miniature badge inside image */}
                  <div className={`absolute bottom-2 right-2 p-2 rounded-full border-2 border-slate-900 ${
                    lastScannedWorker.status === 'ACTIVE' ? 'bg-emerald-500' : 
                    lastScannedWorker.status === 'VACATION' ? 'bg-amber-500' : 'bg-red-500'
                  }`} title={`Estado del Trabajador: ${lastScannedWorker.status}`} />
                </div>

                <div>
                  <span className="text-[10px] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-full text-slate-400 font-mono tracking-wider">
                    ID: {lastScannedWorker.id.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Central Information blocks (adjusted to 5 cols to leave space for wider photo) */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <h4 className="font-sans font-bold text-slate-100 text-2xl truncate">
                    {lastScannedWorker.names} {lastScannedWorker.lastNames}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-sm font-semibold text-teal-400">
                      {lastScannedWorker.service}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300">
                      {lastScannedWorker.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Número de DNI:</span>
                    <span className="font-mono text-slate-200 mt-0.5 block font-semibold text-md">{lastScannedWorker.dni}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Condición Laboral:</span>
                    <span className={`mt-0.5 block font-semibold ${
                      lastScanStatus === 'INVALID_CODE' ? 'text-rose-400' :
                      lastScannedWorker.status === 'ACTIVE' ? 'text-emerald-400' :
                      lastScannedWorker.status === 'VACATION' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {lastScanStatus === 'INVALID_CODE' ? 'NO REGISTRADO' :
                       lastScannedWorker.status === 'ACTIVE' ? 'ACTIVO (DE TURNO)' :
                       lastScannedWorker.status === 'VACATION' ? 'EN VACACIONES' : 'SANCIONADO / SUSPENDIDO'}
                    </span>
                  </div>
                </div>

                {/* Status Notice Description */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${getStatusConfig(lastScanStatus).bgColor}`}>
                  <div className="mt-0.5">
                    {lastScanStatus === 'VALID_COMPLETED' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {lastScanStatus === 'DUPLICATE' && <XCircle className="w-5 h-5 text-red-500" />}
                    {lastScanStatus === 'OUT_OF_SCHEDULE' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {lastScanStatus === 'SUSPENDED_WORKER' && <ShieldAlert className="w-5 h-5 text-slate-400" />}
                    {lastScanStatus === 'INVALID_CODE' && <InfoIcon className="w-5 h-5 text-rose-500" />}
                  </div>
                  <div>
                    <div className="font-sans font-bold text-xs text-slate-100 uppercase tracking-wide">
                      {getStatusConfig(lastScanStatus).title}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {lastScanMessage}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Hora de registro: {lastScanTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Action controls (3 cols) */}
              <div className="md:col-span-3 flex flex-col gap-3 justify-center items-stretch h-full">
                
                <div className={`text-center py-3 px-4 rounded-2xl border text-xs font-semibold ${
                  lastScanStatus === 'VALID_COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                  lastScanStatus === 'DUPLICATE' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}>
                  <div className="text-[9px] uppercase text-slate-400 tracking-widest font-bold mb-1">Estado de Comedor</div>
                  {getStatusConfig(lastScanStatus).badgeText}
                </div>

                {/* SPECIAL ADMINISTRATOR ACTION OVERRIDE - FOR DUPLICATES OR OUT OF HOUR SCANS */}
                {isBypassAvailable && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-center mt-1"
                  >
                    <div className="text-[10px] text-slate-400 leading-normal">
                      ⚠️ ¿Autorizar manualmente como excepción? (Por ejemplo: doble turno médico o retraso justificado).
                    </div>
                    <button
                      type="button"
                      onClick={() => onScanResult(lastScannedWorker.dni, true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans text-xs font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10"
                    >
                      <span>Forzar Autorización</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
                
                {lastScanStatus === 'VALID_COMPLETED' && (
                  <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center text-[11px] text-slate-400 leading-normal flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    Consumo guardado con éxito.
                  </div>
                )}

                {lastScanStatus === 'DUPLICATE' && (
                  <div className="p-3 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-center text-[11.5px] text-rose-400 leading-normal flex flex-col gap-1 items-center justify-center">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider block">🚫 EXCEPCIÓN RECHAZADA</span>
                    <span>El ticket ya fue consumido hoy. Por política institucional del Instituto Nacional de Salud del Niño, no se admiten excepciones ni raciones múltiples.</span>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline replacement for InfoIcon
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
