import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Lock, Eye, EyeOff, ArrowRight, Utensils, 
  Sparkles, Baby, ClipboardCheck, Heart, Apple, Milk,
  Carrot
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('admin@insn.gob.pe');
  const [password, setPassword] = useState('control2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic typewriter phrases configuration
  const configuredPhrases = [
    { text: 'Cero desperdicios', duration: 3000 },
    { text: 'Máxima Seguridad', duration: 3000 },
    { text: 'Gestión Alimentaria', duration: 6000 },
    { text: 'Control Total', duration: 3000 },
    { text: 'Nutrición Precisa', duration: 3000 },
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = configuredPhrases[textIndex];
    const fullText = currentPhrase.text;
    const stayTime = currentPhrase.duration;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (displayText !== fullText) {
        timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, 45); // Faster, more fluid typing speed
      } else {
        // Fully typed: stay for the configured duration
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, stayTime);
      }
    } else {
      // Deleting phase
      if (displayText !== '') {
        timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length - 1));
        }, 18); // Highly fluid and responsive deletion speed
      } else {
        // Fully deleted: swap to the next phrase
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % configuredPhrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Por favor ingresa tu usuario o correo corporativo.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    // Simulate login logic
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(username);
    }, 850);
  };

  // Preset quick fill
  const handleQuickFill = (role: 'admin' | 'nutritionist' | 'cafeteria') => {
    if (role === 'admin') {
      setUsername('admin@insn.gob.pe');
      setPassword('control2026');
    } else if (role === 'nutritionist') {
      setUsername('nutricion.insn@insn.gob.pe');
      setPassword('nutri992');
    } else {
      setUsername('soporte.alimentario@insn.gob.pe');
      setPassword('insn2026');
    }
    setErrorMsg(null);
  };

  return (
    <div 
      id="login_screen_container" 
      className="min-h-screen bg-[#F4F6FA] text-slate-800 flex items-center justify-center font-sans overflow-hidden relative select-none selection:bg-[#00A089]/20 selection:text-[#00A089]"
    >
      {/* Visual background ambient details - Hospital clinical grid mesh */}
      <div 
        id="login_bg_grid" 
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0" 
      />
      <div className="absolute inset-0 bg-radial-[circle_at_20%_35%] from-[#E2F1F0] via-[#F4F6FA] to-white opacity-95 pointer-events-none z-0" />
      
      {/* Decorative Floating outlines (themed clinical & kitchen icons in subtle brand color with random continuous drifting) */}
      <motion.div 
        className="absolute top-[10%] right-[8%] text-[#342D86]/10 pointer-events-none z-0"
        animate={{ 
          y: [0, -45, 30, -35, 0],
          x: [0, 40, -42, 35, 0],
          rotate: [12, -2, 20, 5, 12]
        }}
        transition={{ 
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Baby size={85} className="opacity-90" />
      </motion.div>

      <motion.div 
        className="absolute bottom-[8%] right-[12%] text-[#00A089]/12 pointer-events-none z-0 animate-pulse"
        animate={{ 
          y: [0, 48, -55, 32, 0],
          x: [0, -40, 35, -28, 0],
          rotate: [0, 25, -15, 10, 0]
        }}
        transition={{ 
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Heart size={76} className="opacity-80" />
      </motion.div>

      <motion.div 
        className="absolute top-[35%] left-[32%] text-[#342D86]/9 pointer-events-none z-0"
        animate={{ 
          y: [0, -50, 45, -30, 0],
          x: [0, 35, -45, 25, 0],
          rotate: [-15, 10, -35, -2, -15]
        }}
        transition={{ 
          duration: 9.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Utensils size={65} className="opacity-85" />
      </motion.div>

      <motion.div 
        className="absolute bottom-[14%] left-[10%] text-[#342D86]/12 pointer-events-none z-0"
        animate={{ 
          y: [0, 52, -42, 38, 0],
          x: [0, -38, 48, -25, 0],
          rotate: [-5, 20, -18, 5, -5]
        }}
        transition={{ 
          duration: 12.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Milk size={70} className="opacity-80" />
      </motion.div>

      <motion.div 
        className="absolute top-[18%] left-[6%] text-[#00A089]/9 pointer-events-none z-0"
        animate={{ 
          y: [0, -42, 50, -25, 0],
          x: [0, 30, -38, 20, 0],
          rotate: [15, -12, 32, 10, 15]
        }}
        transition={{ 
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Apple size={55} className="opacity-85" />
      </motion.div>

      {/* Dynamic Carrot floating background icon */}
      <motion.div 
        className="absolute bottom-[38%] right-[22%] text-[#00A089]/9 pointer-events-none z-0"
        animate={{ 
          y: [0, -48, 40, -30, 0],
          x: [0, -35, 45, -20, 0],
          rotate: [5, -25, 15, -10, 5]
        }}
        transition={{ 
          duration: 11.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Carrot size={68} className="opacity-80" />
      </motion.div>

      {/* Dynamic Small Heart floating background icon */}
      <motion.div 
        className="absolute top-[48%] right-[4%] text-[#00A089]/10 pointer-events-none z-0"
        animate={{ 
          y: [0, 40, -45, 25, 0],
          x: [0, 45, -40, 30, 0],
          rotate: [-10, 20, -15, 8, -10]
        }}
        transition={{ 
          duration: 10.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Heart size={44} className="opacity-85" />
      </motion.div>

      <motion.div 
        className="absolute top-[52%] left-[4%] text-[#00A089]/8 pointer-events-none z-0"
        animate={{ 
          y: [0, 45, -35, 25, 0],
          x: [0, -45, 38, -22, 0],
          rotate: [-10, 22, -14, 10, -10]
        }}
        transition={{ 
          duration: 10.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ClipboardCheck size={72} className="opacity-80" />
      </motion.div>

      {/* Grid wrapper */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        
        {/* Left column: Branding and details */}
        <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-2.5"
          >
            {/* Elegant official portal tag */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 select-none">
              <span className="bg-[#342D86]/8 text-[#342D86] text-[9.5px] sm:text-[10px] font-mono font-black px-3 py-1 rounded-full border border-[#342D86]/10 tracking-wider uppercase flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A089] animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A089] absolute" />
                PORTAL OFICIAL INSN - BREÑA
              </span>
              <span className="bg-[#00A089]/8 text-[#00A089] text-[9.5px] sm:text-[10px] font-mono font-black px-3 py-1 rounded-full border border-[#00A089]/10 tracking-wider uppercase flex items-center gap-1">
                🟢 EN LÍNEA
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-[#342D86] leading-[1.12] mt-1">
              Optimiza con <br />
              <div id="typewriter-phrase-container" className="h-[1.25em] sm:h-[1.2em] flex items-center justify-center lg:justify-start mt-1.5 sm:mt-2.5">
                <span className="bg-gradient-to-r from-[#342D86] via-[#2A65A4] to-[#00A089] bg-clip-text text-transparent inline-flex items-center gap-1.5 sm:gap-2.5">
                  {displayText}
                  <span className="inline-block bg-[#00A089] w-[3px] h-[0.8em] align-middle ml-0.5 animate-pulse" />
                </span>
              </div>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-600 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 mt-5 sm:mt-6"
          >
            Plataforma integral para la administración de raciones alimentarias. Control estricto de tickets, gestión asistencial y estadísticas en tiempo real.
          </motion.p>

          {/* Quick pills badges with high-contrast palette */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-2.5 sm:gap-3 justify-center lg:justify-start mt-8"
          >
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-sm">🍴</span>
              <span>Control de Raciones</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-sm">⚡</span>
              <span>Tiempo Real</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-sm">💜</span>
              <span>Atención Asistencial</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-sm">🎫</span>
              <span>Sistema de Tickets</span>
            </div>
          </motion.div>

          {/* Preset fast selector tips inside premium bordered box */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 border border-slate-200 bg-white/80 backdrop-blur-xs p-4 rounded-2xl max-w-md mx-auto lg:mx-0 text-left shadow-xs"
          >
            <div className="text-[10px] sm:text-xs font-black uppercase text-[#342D86] tracking-wider mb-2 flex items-center justify-between">
              <span>Modo Simulado / Acceso Rápido:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-xs">
              <button 
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="bg-slate-50 hover:bg-[#342D86]/5 py-2 rounded-lg text-slate-700 hover:text-[#342D86] border border-slate-200 font-bold transition-all text-center cursor-pointer active:scale-95"
              >
                💼 Admin
              </button>
              <button 
                type="button"
                onClick={() => handleQuickFill('nutritionist')}
                className="bg-slate-50 hover:bg-[#342D86]/5 py-2 rounded-lg text-slate-700 hover:text-[#342D86] border border-slate-200 font-bold transition-all text-center cursor-pointer active:scale-95"
              >
                🩺 Nutricionista
              </button>
              <button 
                type="button"
                onClick={() => handleQuickFill('cafeteria')}
                className="bg-slate-50 hover:bg-[#342D86]/5 py-2 rounded-lg text-slate-700 hover:text-[#342D86] border border-slate-200 font-bold transition-all text-center cursor-pointer active:scale-95"
              >
                🍽️ Comedor
              </button>
            </div>
          </motion.div>

          {/* Operating system tag at bottom-left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 sm:mt-12 flex justify-center lg:justify-start"
          >
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] tracking-widest font-black uppercase text-[#342D86] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute"></span>
              SISTEMA OPERATIVO
            </div>
          </motion.div>
        </div>

        {/* Right column: Login Card Panel */}
        <div className="w-full max-w-md shrink-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="bg-white text-slate-850 rounded-3xl p-6 sm:p-9 md:p-10 shadow-xl w-full border border-slate-200/80 relative overflow-hidden"
          >
            {/* Top tiny decorative color line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#342D86] via-[#00A089] to-[#F9B719]" />

            {/* Reused institutional logo above Bienvenido */}
            <div className="flex justify-center mb-5 mt-1 select-none">
              <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-center">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRn9TfXpX99Vd5zMd625vUQ-gWG8zrTBWad0w&s" 
                  alt="INSN Logo" 
                  className="h-14 w-auto object-contain transition-all" 
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
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-[#342D86] tracking-tight uppercase">
                Bienvenido
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-bold">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs p-3 rounded-xl font-bold mb-4 flex items-start gap-2"
              >
                <span className="text-sm">⚠️</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#342D86] block uppercase tracking-wider">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    autoComplete="username"
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#342D86] rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-[#342D86]/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#342D86] block uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#342D86] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-[#342D86]/10 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Utilities row */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#342D86] focus:ring-[#342D86] cursor-pointer"
                  />
                  <span className="font-semibold text-slate-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('Simulado: Comuníquese con la Oficina de Estadística e Informática (Anexo 2235) para restablecer credenciales.');
                  }}
                  className="font-black text-[#342D86] hover:text-[#252069] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit button with institution colors */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#342D86] via-[#2A65A4] to-[#00A089] hover:from-[#251F70] hover:to-[#008C77] active:scale-[0.98] text-white py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight size={15} className="mt-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Version Badge & Custom Footer */}
            <div className="mt-6 flex flex-col items-center justify-center gap-2 select-none">
              <span className="bg-[#342D86]/8 text-[#342D86] text-[9.5px] sm:text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-[#342D86]/15 tracking-wider uppercase">
                VERSIÓN 1.0
              </span>
              
              <p className="text-[9.5px] sm:text-[10.5px] text-slate-500 hover:text-[#342D86] transition-colors text-center font-bold mt-1.5 max-w-[300px] leading-tight font-sans">
                Creado por la Oficina de Estadística e Informática 2026- INSN
              </p>
            </div>
            
          </motion.div>
        </div>

      </div>
    </div>
  );
}
