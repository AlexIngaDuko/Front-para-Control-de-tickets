import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, Camera, CheckCircle2, AlertTriangle, 
  XCircle, Keyboard, Clock, ShieldAlert, ArrowRight, UserCheck, RefreshCw
} from 'lucide-react';
import { Worker, ScanStatus, MealType, MealSchedule } from '../types';
import { HOSPITAL_WORKERS } from '../data';
import { CRITICAL_HOSPITAL_WORKERS } from '../data_critical';

interface ScannerTerminalProps {
  onScanResult: (dni: string) => void;
  onConfirmScan: (authOverride?: boolean) => void;
  activeMeal: MealSchedule | null;
  lastScannedWorker: Worker | null;
  lastScanStatus: ScanStatus | null;
  lastScanMessage: string | null;
  lastScanTime: string | null;
  lastScanAuthByAdmin?: boolean;
  onClearLastScan: () => void;
  onRevokeLastScan: () => void;
  isSimulatedTimeActive: boolean;
}

export default function ScannerTerminal({
  onScanResult,
  onConfirmScan,
  activeMeal,
  lastScannedWorker,
  lastScanStatus,
  lastScanMessage,
  lastScanTime,
  lastScanAuthByAdmin = false,
  onClearLastScan,
  onRevokeLastScan,
  isSimulatedTimeActive
}: ScannerTerminalProps) {
  const [manualDni, setManualDni] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [listenerActive, setListenerActive] = useState(true);
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);
  
  // Reset confirmation when a new worker is loaded
  useEffect(() => {
    setIsConfirmingRevoke(false);
  }, [lastScannedWorker?.id]);
  
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

      // Filter alphanumeric keys
      if (/^[0-9a-zA-Z]$/.test(e.key)) {
        bufferRef.current += e.key;
      } else if (e.key === 'Enter') {
        const potentialDni = bufferRef.current.trim();
        if (potentialDni.length >= 4 && potentialDni.length <= 15) {
          e.preventDefault();
          onScanResult(potentialDni);
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
    setManualDni('');
  };

  const addRandomScanLog = () => {
    const ALL_WORKERS = [...HOSPITAL_WORKERS, ...CRITICAL_HOSPITAL_WORKERS];
    const randomWorker = ALL_WORKERS[Math.floor(Math.random() * ALL_WORKERS.length)];
    onScanResult(randomWorker.dni);
  };

  const getStatusConfig = (status: ScanStatus) => {
    switch (status) {
      case 'VALID_COMPLETED':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-[#00A089]" />,
          bgColor: 'bg-[#00A089]/8 border border-[#00A089]/20',
          textColor: 'text-[#00A089]',
          title: 'ACCESO AUTORIZADO',
          badgeText: 'Ticket Válido',
        };
      case 'PENDING_VALID':
        return {
          icon: <Clock className="w-12 h-12 text-[#342D86] animate-pulse" />,
          bgColor: 'bg-[#342D86]/8 border border-[#342D86]/20',
          textColor: 'text-[#342D86]',
          title: 'ESCANEO DETECTADO - PENDIENTE DE CONFIRMACIÓN',
          badgeText: 'Por Autorizar',
        };
      case 'DUPLICATE':
        return {
          icon: <XCircle className="w-12 h-12 text-[#B51A82] animate-pulse" />,
          bgColor: 'bg-[#B51A82]/8 border border-[#B51A82]/20',
          textColor: 'text-[#B51A82]',
          title: 'ACCESO RECHAZADO - DUPLICADO',
          badgeText: 'Ticket Usado',
        };
      case 'OUT_OF_SCHEDULE':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-[#F9B719]" />,
          bgColor: 'bg-[#F9B719]/8 border border-[#F9B719]/20',
          textColor: 'text-[#F9B719]',
          title: 'ADVERTENCIA - FUERA DE HORARIO',
          badgeText: 'Fuera de Horario',
        };
      case 'INVALID_CODE':
        return {
          icon: <ShieldAlert className="w-12 h-12 text-[#B51A82]" />,
          bgColor: 'bg-[#B51A82]/8 border border-[#B51A82]/20',
          textColor: 'text-[#B51A82]',
          title: 'CÓDIGO NO REGISTRADO',
          badgeText: 'No Existe DNI',
        };
      case 'SUSPENDED_WORKER':
        return {
          icon: <XCircle className="w-12 h-12 text-[#582A85]" />,
          bgColor: 'bg-[#582A85]/8 border border-[#582A85]/20',
          textColor: 'text-[#582A85]',
          title: 'TRABAJADOR EXCLUIDO / SUSPENDIDO',
          badgeText: 'Bloqueado Administrativo',
        };
      case 'REVOKED':
        return {
          icon: <XCircle className="w-12 h-12 text-red-600 animate-pulse" />,
          bgColor: 'bg-red-50 border border-red-200',
          textColor: 'text-red-600',
          title: 'TICKET DE RACIÓN REVOCADO',
          badgeText: 'Anulado / Revocado',
        };
    }
  };

  const isBypassAvailable = lastScanStatus === 'OUT_OF_SCHEDULE';

  return (
    <div className="space-y-6" id="scanner-terminal">
      {/* 1. Scanning Result Screen - Rendered at the TOP of the workspace */}
      <AnimatePresence mode="wait">
        {lastScannedWorker && lastScanStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-stretch" id="scanned-result-container">
            {/* Vertical "Abrir puerto de escaneo" button on the left */}
            <motion.button
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              type="button"
              onClick={onClearLastScan}
              className="lg:w-16 w-full bg-[#342D86] hover:bg-[#342D86]/95 text-white font-sans text-xs font-black p-4 rounded-3xl transition-all cursor-pointer flex lg:flex-col items-center justify-center gap-3.5 shadow-md uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] border border-transparent select-none"
              id="open-scanning-port-button"
            >
              <Scan className="w-5 h-5 shrink-0 animate-pulse lg:mb-1" />
              <span className="lg:[writing-mode:vertical-lr] lg:rotate-180 text-center tracking-widest leading-none block lg:py-2 whitespace-nowrap">
                Abrir puerto de escaneo
              </span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative flex-1"
              id="scan-result-card"
            >
              {/* Colored ambient flash */}
              <div className={`absolute inset-0 opacity-[0.02] rounded-3xl pointer-events-none transition-colors duration-300 ${
                lastScanStatus === 'VALID_COMPLETED' ? 'bg-[#00A089]' : 
                lastScanStatus === 'DUPLICATE' ? 'bg-[#B51A82]' : 
                lastScanStatus === 'REVOKED' ? 'bg-red-650' : 'bg-[#F9B719]'
              }`}></div>

              {/* Scanned Worker Visual Header */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#342D86]" />
                  <h3 className="font-sans font-black text-[#342D86] text-lg uppercase tracking-wide">Trabajador del INSN</h3>
                </div>
                <button
                  type="button"
                  onClick={onClearLastScan}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer flex items-center justify-center"
                  title="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Split layout inside results card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Profile Image card (from 3 expanded to 4 cols) */}
                <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    {/* Status Indicator Frame Rings */}
                    <div className={`absolute -inset-2 rounded-full blur-md opacity-40 transition-colors ${
                      lastScanStatus === 'VALID_COMPLETED' ? 'bg-[#00A089]' :
                      lastScanStatus === 'DUPLICATE' ? 'bg-[#B51A82]' :
                      lastScanStatus === 'REVOKED' ? 'bg-red-650' : 'bg-[#F9B719]'
                    }`}></div>
                    
                    <img
                      src={lastScannedWorker.photoUrl}
                      alt={`${lastScannedWorker.names} ${lastScannedWorker.lastNames}`}
                      referrerPolicy="no-referrer"
                      className="relative w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-full border-4 border-white shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${lastScannedWorker.names}`;
                      }}
                    />
                    
                    {/* Miniature badge inside image */}
                    <div className={`absolute bottom-2 right-2 p-2.5 rounded-full border-2 border-white ${
                      lastScannedWorker.status === 'ACTIVE' ? 'bg-[#00A089]' : 'bg-[#B51A82]'
                    }`} title={`Estado del Trabajador: ${lastScannedWorker.status}`} />
                  </div>

                  <div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-500 font-mono font-bold tracking-wider">
                      ID: {lastScannedWorker.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Central Information blocks (adjusted to 5 cols to leave space for wider photo) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <h4 className="font-sans font-black text-[#342D86] text-2xl truncate uppercase tracking-tight leading-none">
                      {lastScannedWorker.names} {lastScannedWorker.lastNames}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="text-sm font-bold text-[#00A089] uppercase">
                        {lastScannedWorker.service}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-extrabold font-sans uppercase">
                        {lastScannedWorker.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans">Número de DNI:</span>
                      <span className="font-mono text-slate-800 mt-0.5 block font-extrabold text-sm">{lastScannedWorker.dni}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans">Condición Laboral:</span>
                      <span className={`mt-0.5 block font-bold text-xs ${
                        lastScanStatus === 'INVALID_CODE' ? 'text-[#B51A82]' :
                        lastScannedWorker.status === 'ACTIVE' ? 'text-[#00A089]' : 'text-[#B51A82]'
                      }`}>
                        {lastScanStatus === 'INVALID_CODE' ? 'NO REGISTRADO' :
                         lastScannedWorker.status === 'ACTIVE' ? 'ACTIVO (DE TURNO)' : 'SANCIONADO / SUSPENDIDO'}
                      </span>
                    </div>
                  </div>

                  {/* Status Notice Description */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${getStatusConfig(lastScanStatus).bgColor}`}>
                    <div className="mt-0.5 shrink-0">
                      {lastScanStatus === 'VALID_COMPLETED' && <CheckCircle2 className="w-5 h-5 text-[#00A089]" />}
                      {lastScanStatus === 'PENDING_VALID' && <Clock className="w-5 h-5 text-[#342D86] animate-pulse" />}
                      {lastScanStatus === 'DUPLICATE' && <XCircle className="w-5 h-5 text-[#B51A82]" />}
                      {lastScanStatus === 'OUT_OF_SCHEDULE' && <AlertTriangle className="w-5 h-5 text-[#F9B719]" />}
                      {lastScanStatus === 'SUSPENDED_WORKER' && <ShieldAlert className="w-5 h-5 text-[#582A85]" />}
                      {lastScanStatus === 'INVALID_CODE' && <InfoIcon className="w-5 h-5 text-[#B51A82]" />}
                      {lastScanStatus === 'REVOKED' && <XCircle className="w-5 h-5 text-red-650" />}
                    </div>
                    <div>
                      <div className="font-sans font-black text-xs text-[#342D86] uppercase tracking-wide">
                        {getStatusConfig(lastScanStatus).title}
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                        {lastScanMessage}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Hora de registro: {lastScanTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Action controls (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-3 justify-center items-stretch h-full">
                  
                  <div className={`text-center py-2 px-3 rounded-2xl border text-xs font-bold ${
                    lastScanStatus === 'VALID_COMPLETED' ? 'bg-[#00A089]/10 border-[#00A089]/20 text-[#00A089]' :
                    lastScanStatus === 'PENDING_VALID' ? 'bg-[#342D86]/10 border-[#342D86]/20 text-[#342D86]' :
                    lastScanStatus === 'DUPLICATE' ? 'bg-[#B51A82]/10 border-[#B51A82]/20 text-[#B51A82]' :
                    'bg-[#F9B719]/10 border-[#F9B719]/25 text-[#342D86]'
                  }`}>
                    <div className="text-[9px] uppercase text-slate-500 tracking-widest font-black mb-1">Estado de Comedor</div>
                    {getStatusConfig(lastScanStatus).badgeText}
                  </div>

                  {lastScanStatus === 'REVOKED' ? (
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-250 text-center text-[11px] text-red-700 font-bold leading-normal flex flex-col gap-1 items-center justify-center">
                      <span className="flex items-center gap-1.5 justify-center font-black uppercase text-xs">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Ticket Anulado
                      </span>
                      <span className="text-[9.5px] text-slate-600 font-semibold leading-snug">El consumo ha sido invalidado. El portal ya registró la revocación del beneficio de comedor del INSN.</span>
                      <button
                        type="button"
                        onClick={onClearLastScan}
                        className="w-full mt-1.5 bg-slate-500 hover:bg-slate-600 text-white font-sans text-xs font-black py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Abrir Puerto</span>
                      </button>
                    </div>
                  ) : lastScanStatus === 'OUT_OF_SCHEDULE' ? (
                    <div className="flex flex-col gap-2 bg-amber-50/40 p-3 rounded-2xl border border-amber-200">
                      <div className="text-[10px] text-amber-900 font-bold leading-tight font-sans text-center mb-1">
                        ⚠️ ¿Autorizar excepcionalmente como caso especial o retraso justificado?
                      </div>
                      <button
                        type="button"
                        onClick={() => onConfirmScan(true)}
                        className="w-full bg-[#F9B719] hover:bg-[#F9B719]/90 text-[#342D86] font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Autorizar Excepcionalmente</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClearLastScan}
                        className="w-full bg-slate-500 hover:bg-slate-600 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Abrir Puerto (Escanear Otro)</span>
                      </button>
                    </div>
                  ) : lastScanStatus === 'PENDING_VALID' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onConfirmScan(false)}
                        className="w-full bg-[#00A089] hover:bg-[#00A089]/90 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Autorizar Consumo</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={onClearLastScan}
                        className="w-full bg-slate-500 hover:bg-slate-600 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Abrir Puerto (Ignorar)</span>
                      </button>
                    </div>
                  ) : lastScanStatus === 'VALID_COMPLETED' ? (
                    lastScanAuthByAdmin ? (
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-250 text-center text-[11px] text-amber-700 font-bold leading-normal flex flex-col gap-2 items-center justify-center">
                        <span className="flex items-center gap-1.5 justify-center font-black uppercase text-xs text-amber-600">
                          <UserCheck className="w-4 h-4 text-amber-600" />
                          Autorización Concedida
                        </span>
                        <span className="text-[9.5px] text-slate-600 font-semibold leading-normal">
                          Se registró la ración excepcional fuera de horario de manera exitosa en el hospital.
                        </span>
                        <button
                          type="button"
                          onClick={onClearLastScan}
                          className="w-full mt-1.5 bg-[#342D86] hover:bg-[#342D86]/95 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                        >
                          <Scan className="w-4 h-4" />
                          <span>Abrir Puerto (Listo)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-250 text-center text-[11px] text-emerald-800 font-bold leading-normal flex flex-col gap-2 items-center justify-center">
                        <span className="flex items-center gap-1.5 justify-center font-black uppercase text-xs text-emerald-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Ración Autorizada
                        </span>
                        <span className="text-[9.5px] text-slate-600 font-semibold leading-normal">
                          Se registró el consumo regular de manera exitosa en el hospital. No se permite revocar una ración ya confirmada.
                        </span>
                        
                        <div className="flex flex-col gap-1.5 w-full mt-1.5">
                          <button
                            type="button"
                            onClick={onClearLastScan}
                            className="w-full bg-[#342D86] hover:bg-[#342D86]/95 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                          >
                            <Scan className="w-4 h-4" />
                            <span>Abrir Puerto (Listo)</span>
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={onClearLastScan}
                        className="w-full bg-slate-500 hover:bg-slate-600 text-white font-sans text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Abrir Puerto</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Scanning Workspace Station - Replaced with Open Port button when professional is displayed */}
      {!lastScannedWorker && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#342D86]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#342D86]/10 text-[#342D86]">
                <Scan className="w-6 h-6 animate-pulse" id="scan-terminal-icon" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-xl text-[#342D86] uppercase tracking-wide">Puesto de Escaneo</h2>
                <p className="text-xs text-slate-500 font-sans font-semibold">Estación activa para lectora de barra o ingreso manual</p>
              </div>
            </div>
            
            {/* Active Meal Schedule Badge Header */}
            {activeMeal ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#342D86]/8 border border-[#342D86]/15 text-[#342D86]">
                <Clock className="w-4 h-4 text-[#342D86]" />
                <span className="text-xs font-bold uppercase font-sans">{activeMeal.label}</span>
                <span className="text-[10px] bg-[#342D86]/15 px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {activeMeal.startTime} - {activeMeal.endTime}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F9B719]/10 border border-[#F9B719]/35 text-[#B51A82] font-semibold">
                <Clock className="w-4 h-4 text-[#F9B719]" />
                <span className="text-xs font-bold uppercase font-sans">Sin Turno de Alimento Activo</span>
              </div>
            )}
          </div>

          {/* Viewfinder on left (7 cols) and quick manual box on right (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Camera sweep viewport */}
            <div className="lg:col-span-7 flex flex-col justify-between aspect-video rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden group">
              {cameraActive ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {/* Laser Beam Sweep */}
                  <motion.div 
                    className="absolute left-0 right-0 h-1 bg-red-500/80 shadow-[0_0_8px_#ef4444] z-10"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  />

                  {/* Overlay frames */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#342D86] rounded-tl"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#342D86] rounded-tr"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#342D86] rounded-bl"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#342D86] rounded-br"></div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="w-1/2 h-1/4 border border-dashed border-red-500/40 rounded flex items-center justify-center">
                      <span className="text-[10px] text-red-500/45 font-mono tracking-widest uppercase font-bold">Alinear Código</span>
                    </div>
                  </div>

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/5 backdrop-blur-xs border border-red-500/15 px-3 py-1 rounded-full flex items-center gap-1.5 text-red-500/55 text-[10px] font-bold tracking-wider uppercase select-none">
                    <div className="w-1.5 h-1.5 bg-red-500/60 rounded-full animate-ping"></div>
                    Simulador de Cámara Listo
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-600 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm leading-none">
                    <span className="flex items-center gap-1 text-[#00A089] font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A089]" />
                      Pistola USB Detectada
                    </span>
                    <span className="font-semibold text-slate-500 font-sans">Enfoque automático: ON</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Camera className="w-12 h-12 mb-2 text-slate-350" />
                  <p className="text-sm font-bold text-[#342D86]">Simulador de cámara en pausa</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    La cámara ha sido desactivada. Aún puedes usar la pistola de barras o la consola de escritura.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Manual Actions (5 cols) without Terminal logs panel */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <label className="text-xs uppercase font-sans font-black text-[#342D86] tracking-wider flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-[#342D86]" />
                  INGRESO MANUAL EXCEPCIONAL
                </label>
                
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      maxLength={15}
                      value={manualDni}
                      onChange={(e) => setManualDni(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="Escribe DNI o código de barras..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#342D86] transition-colors font-mono"
                      id="barcode-manual-input"
                    />
                    {manualDni && (
                      <button 
                        type="button" 
                        onClick={() => setManualDni('')}
                        className="absolute right-2.5 top-3 text-xs text-slate-400 hover:text-slate-650 font-bold"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#342D86] hover:bg-[#342D86]/90 text-white text-xs font-bold px-4 rounded-xl transition-colors cursor-pointer font-sans uppercase tracking-wider"
                    id="btn-scan-manual-submit"
                  >
                    Procesar
                  </button>
                </form>

                <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                  💡 <span className="font-bold text-slate-600">LECTOR FÍSICO AUTOMÁTICO ACTIVO:</span> Apunta tu pistola de tickets a la pantalla y presiona el gatillo. La lectura se realiza de forma global en segundo plano.
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addRandomScanLog}
                    className="flex-1 bg-white hover:bg-slate-50 text-[#342D86] border border-slate-250 rounded-xl py-2.5 px-3 text-xs font-black text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs font-sans uppercase tracking-wider"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#342D86]" />
                    Escanear Profesional Azar
                  </button>

                  <button
                    type="button"
                    onClick={() => setCameraActive(!cameraActive)}
                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl px-3.5 text-xs transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                    title="Pausar/Activar Cámara"
                  >
                    <Camera className="w-4 h-4 text-slate-550" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
