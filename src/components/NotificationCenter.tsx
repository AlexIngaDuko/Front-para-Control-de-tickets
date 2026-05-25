import React, { useState } from 'react';
import { SystemNotification } from '../types';
import { 
  Bell, BellOff, Check, Trash2, ShieldAlert, CheckCircle2, 
  Info, Sparkles, Send, Volume2, VolumeX, Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onAddSimulatedNotif: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'alert') => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onClearAll,
  onAddSimulatedNotif
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customType, setCustomType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const displayedNotifications = notifications.filter(notif => {
    if (activeTab === 'UNREAD') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCreateCustomPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customMessage.trim()) return;
    
    onAddSimulatedNotif(
      customTitle.trim(),
      customMessage.trim(),
      customType
    );
    
    // Clear
    setCustomTitle('');
    setCustomMessage('');
  };

  const triggerPresetNotif = (preset: number) => {
    if (preset === 1) {
      onAddSimulatedNotif(
        '🔔 Almuerzo Disponible',
        'El comedor principal ha iniciado el servicio de raciones de Almuerzo de Turno. ¡Buen provecho!',
        'success'
      );
    } else if (preset === 2) {
      onAddSimulatedNotif(
        '⚠️ Límite Calórico Diario',
        'Se ha distribuido el 80% de la energía presupuestada para el servicio diario.',
        'warning'
      );
    } else if (preset === 3) {
      onAddSimulatedNotif(
        '🚨 Bloqueo por Duplicado',
        'Se detectó un ticket que intentó ser escaneado por segunda vez en menos de 5 minutos.',
        'alert'
      );
    }
  };

  const getNotifStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bdColor: 'border-l-4 border-l-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bgColor: 'bg-emerald-500/5'
        };
      case 'warning':
        return {
          bdColor: 'border-l-4 border-l-amber-500',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
          bgColor: 'bg-amber-500/5'
        };
      case 'alert':
        return {
          bdColor: 'border-l-4 border-l-red-500',
          icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
          bgColor: 'bg-red-500/5'
        };
      default:
        return {
          bdColor: 'border-l-4 border-l-indigo-500',
          icon: <Info className="w-4 h-4 text-indigo-400" />,
          bgColor: 'bg-indigo-500/5'
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6" id="notification-center">
      
      {/* Notifications header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 relative">
            <Bell className="w-5 h-5" id="bell-icon-notif" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-100 text-lg uppercase tracking-wide">Notificaciones Push</h3>
            <p className="text-xs text-slate-400">Disponibilidad de comida y alertas de consumo</p>
          </div>
        </div>

        {/* Mute and Wipe actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar comentarios en sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={onClearAll}
            className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all cursor-pointer text-xs"
            title="Limpiar avisos"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toggles bar */}
      <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold px-3 transition-all cursor-pointer ${
            activeTab === 'ALL' ? 'bg-slate-800 text-teal-400 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('UNREAD')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold px-3 transition-all cursor-pointer ${
            activeTab === 'UNREAD' ? 'bg-slate-800 text-teal-400 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          No Leídas ({unreadCount})
        </button>
      </div>

      {/* Push simulation panel */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1 leading-none">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Simulador de Envío Push
          </span>
          <span className="text-[9px] text-indigo-400 font-semibold uppercase">Estación de Nutrición</span>
        </div>

        {/* Multi-triggers buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => triggerPresetNotif(1)}
            className="flex-1 bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-400 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-left truncate"
          >
            🟢 Activar Almuerzo
          </button>
          <button
            type="button"
            onClick={() => triggerPresetNotif(2)}
            className="flex-1 bg-slate-900 hover:bg-amber-500/10 hover:text-amber-400 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-left truncate"
          >
            🟡 Avisar Umbral Kcal
          </button>
          <button
            type="button"
            onClick={() => triggerPresetNotif(3)}
            className="flex-1 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 text-[10px] font-semibold text-slate-300 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-left truncate"
          >
            🔴 Simular Fraude DNI
          </button>
        </div>

        {/* Mini Custom Form for testing custom notification */}
        <form onSubmit={handleCreateCustomPush} className="space-y-2 border-t border-slate-900 pt-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Asunto (Alerta...)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-300 focus:outline-none placeholder-slate-600 focus:border-teal-400"
            />
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-1.5 text-[10px] text-slate-400 cursor-pointer focus:outline-none"
            >
              <option value="info">Info</option>
              <option value="success">Comida</option>
              <option value="warning">Limite</option>
              <option value="alert">Crítico</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe el mensaje de la alerta push..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-300 focus:outline-none placeholder-slate-600 focus:border-teal-400"
            />
            <button
              type="submit"
              className="p-1 px-3.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-slate-950 font-bold transition-all cursor-pointer flex items-center justify-center placeholder-slate-600"
              title="Publicar alerta"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Notifications lists stack */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {displayedNotifications.map((notification) => {
            const styles = getNotifStyle(notification.type);
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 rounded-xl ${styles.bdColor} ${styles.bgColor} border border-slate-800/40 relative flex gap-3 group transition-all truncate`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {styles.icon}
                </div>
                
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-semibold text-slate-200 text-xs truncate">
                      {notification.title}
                    </span>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" title="Alerta no leída"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal break-words whitespace-normal">
                    {notification.message}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    Enviado a las {notification.timestamp}
                  </span>
                </div>

                {/* Mark read button */}
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                    className="absolute right-2 top-2 p-1 rounded-md bg-slate-800 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 transition-all cursor-pointer group-hover:opacity-100"
                    title="Marcar leído"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            );
          })}

          {displayedNotifications.length === 0 && (
            <div className="text-center py-8 text-slate-600 font-mono text-xs">
              <BellOff className="w-8 h-8 text-slate-700 mx-auto mb-1" />
              <span>Sin notificaciones en esta sección.</span>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
