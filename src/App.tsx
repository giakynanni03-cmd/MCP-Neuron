import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Info, 
  Settings, 
  Play, 
  RefreshCw, 
  ArrowRight, 
  Brain, 
  Thermometer, 
  Snowflake, 
  Flame,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type LogicGate = 'AND' | 'OR' | 'NOT';

interface MCPNeuronProps {
  inputs: number[];
  weights: number[];
  threshold: number;
  label?: string;
}

// --- Components ---

const Connection = ({ from, to, active, isInhibitory = false }: { from: { x: number, y: number }, to: { x: number, y: number }, active: boolean, isInhibitory?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  
  return (
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-help pointer-events-auto"
    >
      {/* Invisible thicker path for easier hovering */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="15"
        fill="none"
      />

      {/* Base Line */}
      <motion.path
        d={path}
        animate={{
          strokeWidth: isHovered ? 4 : 2,
          stroke: isHovered 
            ? (isInhibitory ? "#f87171" : "#52525b") 
            : (isInhibitory ? "#ef4444" : "#3f3f46"),
          opacity: isHovered ? 1 : (active ? 0.8 : 0.2)
        }}
        strokeDasharray={isInhibitory ? "4 4" : "0"}
        fill="none"
        className="transition-colors duration-300"
      />
      
      {/* Signal Pulse */}
      <AnimatePresence>
        {active && (
          <motion.path
            d={path}
            stroke={isInhibitory ? "#f87171" : "#10b981"}
            strokeWidth={isHovered ? 5 : 3}
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1], 
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        )}
      </AnimatePresence>
    </g>
  );
};

const Node = ({ 
  active, 
  label, 
  icon: Icon, 
  type = 'input', 
  color = 'emerald', 
  x, 
  y, 
  pulse = false, 
  holdTime = 0,
  maxHoldTime = 0,
  isHolding = false,
  ...props 
}: any) => {
  const colors: any = {
    emerald: active ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'bg-zinc-800 border-zinc-700',
    blue: active ? 'bg-blue-500 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'bg-zinc-800 border-zinc-700',
    orange: active ? 'bg-orange-500 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.6)]' : 'bg-zinc-800 border-zinc-700',
    red: active ? 'bg-red-500 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-zinc-800 border-zinc-700',
  };

  const glowColors: any = {
    emerald: '16, 185, 129',
    blue: '59, 130, 246',
    orange: '249, 115, 22',
    red: '239, 68, 68',
  };
  const glowColor = glowColors[color] || glowColors.emerald;

  // Dynamic glow based on hold time
  const dynamicGlow = isHolding && maxHoldTime > 0
    ? [
        `0 0 0px rgba(${glowColor}, 0)`,
        `0 0 ${20 + Math.min(holdTime / 50, 30)}px rgba(${glowColor}, ${0.3 + Math.min(holdTime / maxHoldTime, 0.5)})`,
        `0 0 0px rgba(${glowColor}, 0)`
      ]
    : undefined;

  return (
    <div 
      className="absolute flex flex-col items-center gap-3 z-10"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      {...props}
    >
      <motion.div 
        initial={false}
        animate={{ 
          scale: active ? (pulse ? [1.1, 1.18, 1.1] : 1.1) : 1,
          rotate: active ? [0, -3, 3, 0] : 0,
          boxShadow: dynamicGlow || (active && pulse 
            ? [
                `0 0 20px rgba(${glowColor}, 0.4)`, 
                `0 0 40px rgba(${glowColor}, 0.7)`, 
                `0 0 20px rgba(${glowColor}, 0.4)`
              ] 
            : undefined)
        }}
        transition={{ 
          scale: (active && pulse) ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 15 },
          rotate: { duration: 0.5 },
          boxShadow: (dynamicGlow || (active && pulse)) ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.5 }
        }}
        className={cn(
          "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative overflow-hidden",
          colors[color],
          type === 'neuron' ? 'rounded-2xl' : 'rounded-full'
        )}
      >
        {Icon ? (
          <Icon className={cn("text-white transition-opacity duration-500", active ? "opacity-100" : "opacity-20")} size={24} />
        ) : (
          <Brain className={cn("text-white transition-opacity duration-500", active ? "opacity-100" : "opacity-20")} size={24} />
        )}

        {/* Progress Bar for holding */}
        {isHolding && maxHoldTime > 0 && (
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-white/50"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((holdTime / maxHoldTime) * 100, 100)}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
          />
        )}
      </motion.div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 whitespace-nowrap",
        active ? "text-white" : "text-zinc-600"
      )}>
        {label}
      </span>
    </div>
  );
};

const MCPNeuron = ({ inputs, weights, threshold, label }: MCPNeuronProps) => {
  const weightedSum = inputs.reduce((sum, val, i) => sum + val * (weights[i] || 0), 0);
  const isActive = weightedSum >= threshold;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
      {label && <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">{label}</span>}
      
      <div className="flex gap-8 items-center">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {inputs.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                val === 1 ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"
              )}>
                {val}
              </div>
              <div className="text-[10px] font-mono text-zinc-400">w:{weights[i]}</div>
            </div>
          ))}
        </div>

        <ArrowRight className="text-zinc-300" size={20} />

        {/* The Neuron Body */}
        <motion.div 
          animate={{ 
            scale: isActive ? 1.05 : 1,
            backgroundColor: isActive ? '#10b981' : '#f4f4f5',
            borderColor: isActive ? '#059669' : '#e4e4e7'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center relative shadow-inner"
        >
          <div className={cn(
            "text-xs font-bold mb-1 transition-colors",
            isActive ? "text-white" : "text-zinc-500"
          )}>
            Σ = {weightedSum}
          </div>
          <div className={cn(
            "text-[10px] font-mono transition-colors",
            isActive ? "text-emerald-100" : "text-zinc-400"
          )}>
            T ≥ {threshold}
          </div>
          
          {isActive && (
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: 0 
              }}
              transition={{
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                rotate: { type: "spring", stiffness: 300, damping: 15 }
              }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm"
            >
              <Zap size={12} className="text-white fill-current" />
            </motion.div>
          )}
        </motion.div>

        <ArrowRight className="text-zinc-300" size={20} />

        {/* Output */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
          isActive ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-zinc-50 text-zinc-300 border-2 border-zinc-200"
        )}>
          {isActive ? 1 : 0}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'basic' | 'complex'>('intro');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Brain className="text-white" size={20} />
          </div>
          <h1 className="font-bold tracking-tight text-lg">MCP Neuron Explorer</h1>
        </div>
        
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
          {[
            { id: 'intro', label: 'Introduzione', icon: Info },
            { id: 'basic', label: 'Logica Base', icon: Zap },
            { id: 'complex', label: 'Freddo Paradossale', icon: Snowflake },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white text-emerald-700 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
              )}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <IntroSection onStart={() => setActiveTab('basic')} />
            </motion.div>
          )}
          {activeTab === 'basic' && (
            <motion.div key="basic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BasicSimulator />
            </motion.div>
          )}
          {activeTab === 'complex' && (
            <motion.div key="complex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComplexSimulator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 text-center text-xs text-zinc-400 font-mono">
        McCulloch-Pitts Model (1943) • Educational Interactive App
      </footer>
    </div>
  );
}

// --- Sub-Sections ---

const IntroSection = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-12 py-8"
  >
    <div className="max-w-2xl">
      <h2 className="text-5xl font-bold tracking-tighter mb-6 leading-tight">
        L'alba dell'Intelligenza <span className="text-emerald-600">Artificiale</span>.
      </h2>
      <p className="text-lg text-zinc-600 leading-relaxed mb-8">
        Nel 1943, Warren McCulloch e Walter Pitts proposero il primo modello matematico di un neurone biologico. 
        Dimostrarono che semplici "interruttori" logici potevano eseguire qualsiasi operazione computazionale.
      </p>
      <button 
        onClick={onStart}
        className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-600 transition-colors group"
      >
        Inizia l'esplorazione
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { 
          title: "Input Binari", 
          desc: "Segnali 0 (spento) o 1 (acceso), proprio come i bit di un computer.",
          icon: Zap
        },
        { 
          title: "Pesi & Soglia", 
          desc: "Ogni segnale ha un'influenza (peso). Se la somma supera la soglia (T), il neurone spara.",
          icon: Settings
        },
        { 
          title: "Logica Pura", 
          desc: "Combinando questi neuroni è possibile creare porte AND, OR e reti complesse.",
          icon: Brain
        }
      ].map((card, i) => (
        <div key={i} className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <card.icon size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">{card.title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
        </div>
      ))}
    </div>

    {/* Sezione Critiche & Frontiere - Layout Editoriale */}
    <div className="space-y-16 pt-20 border-t border-zinc-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Critiche & Frontiere</h2>
          </div>
          <p className="text-zinc-600 text-xl leading-relaxed font-medium">
            Dalla logica binaria del 1943 alla "Terza Generazione" delle reti neurali: 
            un viaggio tra i limiti del passato e le promesse del futuro neuromorfico.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-4xl font-black text-zinc-100 uppercase leading-none">Evolution</div>
          <div className="text-xs font-mono text-zinc-400 mt-2 tracking-widest">MCP → PERCEPTRON → SNN</div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Il Limite Storico (XOR) */}
        <div className="md:col-span-8 p-10 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-amber-400 font-mono text-sm tracking-widest uppercase mb-4 block">Critica Storica</span>
            <h3 className="text-3xl font-bold mb-4 leading-tight">Il Paradosso di Minsky: <br/>L'Orizzonte dell'XOR</h3>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
              Nel 1969, Marvin Minsky e Seymour Papert dimostrarono che un singolo neurone MCP non poteva risolvere il problema dell'XOR (OR esclusivo). 
              Questa rivelazione causò il primo "Inverno dell'IA", fermando i finanziamenti per un decennio. 
              La soluzione? Strati multipli e non-linearità, concetti che il modello originale non poteva ancora abbracciare.
            </p>
          </div>
          <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain size={120} />
          </div>
        </div>

        {/* Card 2: Efficienza Energetica */}
        <div className="md:col-span-4 p-10 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">Il Miraggio da 20 Watt</h3>
            <p className="text-emerald-700/70 text-sm leading-relaxed">
              Mentre un cluster di GPU consuma megawatt, il cervello umano opera con soli 20 Watt. 
              Le reti attuali sono "miraggi matematici" energivori; la vera frontiera è l'efficienza biologica.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-emerald-200/50">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Target: Neuromorphic</div>
          </div>
        </div>

        {/* Card 3: Le Tre Generazioni */}
        <div className="md:col-span-4 p-10 bg-white border border-zinc-200 rounded-[2.5rem]">
          <h3 className="text-2xl font-bold mb-6">Le 3 Generazioni</h3>
          <div className="space-y-6">
            {[
              { g: "1st", t: "MCP & Logica", d: "Input binari, pesi fissi." },
              { g: "2nd", t: "ReLU & Backprop", d: "Frequenza media, apprendimento." },
              { g: "3rd", t: "Spiking Neurons", d: "Il tempo come variabile chiave." }
            ].map((gen, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-emerald-500 font-black text-xl">{gen.g}</div>
                <div>
                  <div className="font-bold text-zinc-900">{gen.t}</div>
                  <div className="text-xs text-zinc-500">{gen.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: SNN & Temporal Coding */}
        <div className="md:col-span-8 p-10 bg-amber-50 border border-amber-100 rounded-[2.5rem] relative overflow-hidden">
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold text-amber-900 mb-4">Quando il "Quando" conta più del "Quanto"</h3>
            <p className="text-amber-800/70 text-lg leading-relaxed">
              Nelle Spiking Neural Networks (SNN), la comunicazione avviene tramite impulsi binari asincroni. 
              Come in una melodia, il messaggio non è nel volume, ma nel ritmo. 
              Questo "Temporal Coding" permette di processare informazioni con una latenza e un consumo minimi.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 p-8 opacity-5">
            <Settings size={200} />
          </div>
        </div>

        {/* Card 5: Plasticità STDP */}
        <div className="md:col-span-6 p-10 bg-zinc-100 rounded-[2.5rem] group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center">
              <Fingerprint size={20} />
            </div>
            <div className="text-xs font-mono text-zinc-400">ALGORITHM: STDP</div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Auto-Organizzazione</h3>
          <p className="text-zinc-500 leading-relaxed">
            La Spike-Timing-Dependent Plasticity (STDP) permette alle reti di imparare senza insegnanti. 
            Le sinapsi si rafforzano se il neurone pre-sinaptico spara appena prima di quello post-sinaptico. 
            È la base biologica dell'apprendimento non supervisionato.
          </p>
        </div>

        {/* Card 6: Il Futuro LIF */}
        <div className="md:col-span-6 p-10 bg-white border border-zinc-200 rounded-[2.5rem] relative group cursor-help">
          <h3 className="text-2xl font-bold mb-4">Oltre il Neurone Statico</h3>
          <p className="text-zinc-500 leading-relaxed">
            Il modello LIF (Leaky Integrate-and-Fire) introduce il concetto di "perdita" (leakage). 
            Se non arrivano stimoli, il potenziale decade. Questa dinamica temporale rende le macchine capaci di 
            percepire lo scorrere del tempo proprio come noi.
          </p>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span>Scopri il modello LIF</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quote Finale */}
      <div className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">
            IL TEMPO È LA SOSTANZA DI CUI È FATTO IL PENSIERO.
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto mb-8"></div>
          <p className="text-zinc-400 font-mono uppercase tracking-widest text-xs">
            Verso una singolarità neuromorfica
          </p>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

const BasicSimulator = () => {
  const [gate, setGate] = useState<LogicGate | 'CUSTOM'>('AND');
  const [inputs, setInputs] = useState<number[]>([0, 0]);
  
  const initialConfigs = {
    AND: { weights: [1, 1], threshold: 2, desc: "Si attiva solo se ENTRAMBI gli input sono 1." },
    OR: { weights: [1, 1], threshold: 1, desc: "Si attiva se ALMENO UN input è 1." },
    NOT: { weights: [-1], threshold: 0, desc: "Inverte il segnale: 1 diventa 0, 0 diventa 1." },
    CUSTOM: { weights: [1, 1], threshold: 1, desc: "Configurazione personalizzata." }
  };

  const [weights, setWeights] = useState<number[]>([1, 1]);
  const [threshold, setThreshold] = useState<number>(2);

  useEffect(() => {
    const config = initialConfigs[gate as keyof typeof initialConfigs];
    setWeights(config.weights);
    setThreshold(config.threshold);
    
    if (gate === 'NOT') setInputs([0]);
    else setInputs([0, 0]);
  }, [gate]);

  const toggleInput = (idx: number) => {
    const newInputs = [...inputs];
    newInputs[idx] = newInputs[idx] === 0 ? 1 : 0;
    setInputs(newInputs);
  };

  const updateWeight = (idx: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newWeights = [...weights];
    newWeights[idx] = num;
    setWeights(newWeights);
    setGate('CUSTOM');
  };

  const updateThreshold = (val: string) => {
    setThreshold(parseFloat(val) || 0);
    setGate('CUSTOM');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Operazioni Logiche</h3>
            <p className="text-zinc-500 text-sm">Seleziona una funzione o modifica i parametri manualmente per sperimentare.</p>
          </div>

          <div className="flex flex-col gap-2">
            {(['AND', 'OR', 'NOT', 'CUSTOM'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGate(g)}
                className={cn(
                  "px-4 py-3 rounded-xl text-left font-bold transition-all border-2",
                  gate === g 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300"
                )}
              >
                {g === 'CUSTOM' ? 'Personalizzato' : `Porta ${g}`}
              </button>
            ))}
          </div>

          {/* Manual Controls */}
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Parametri Manuali</h4>
            
            <div className="space-y-3">
              {weights.map((w, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                    <ArrowRight size={12} className="text-emerald-500" />
                    Peso Input {i + 1}
                  </label>
                  <input 
                    type="number" 
                    value={w} 
                    onChange={(e) => updateWeight(i, e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              ))}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                  <Zap size={12} className="text-amber-500" />
                  Soglia di Attivazione (θ)
                </label>
                <input 
                  type="number" 
                  value={threshold} 
                  onChange={(e) => updateThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-mono">
            <div className="flex justify-between mb-1">
              <span>Stato:</span>
              <span className="text-emerald-400">{gate}</span>
            </div>
            <p className="text-[10px] leading-relaxed italic">
              {gate !== 'CUSTOM' ? initialConfigs[gate as keyof typeof initialConfigs].desc : "Sperimenta con pesi e soglie personalizzate."}
            </p>
          </div>
        </div>

        <div className="flex-1 w-full bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-12 flex gap-4">
            {inputs.map((val, i) => (
              <button
                key={i}
                onClick={() => toggleInput(i)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2",
                  val === 1 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                )}
              >
                Input {i + 1}: {val}
              </button>
            ))}
          </div>

          <MCPNeuron 
            inputs={inputs} 
            weights={weights} 
            threshold={threshold} 
            label={gate === 'CUSTOM' ? "Neurone Personalizzato" : `Neurone ${gate}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ComplexSimulator = () => {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMode, setInputMode] = useState<'short' | 'long' | 'dynamic' | 'none'>('none');
  const [isHolding, setIsHolding] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [targetNode, setTargetNode] = useState<'cold' | 'heat' | 'none'>('none');

  // Manual Parameters
  const [params, setParams] = useState({
    n2Threshold: 1,
    n5Threshold: 1,
    heatOutThreshold: 1,
    coldOutThreshold: 2,
    inhibitionWeight: -2,
    n5ToColdWeight: 2
  });

  // State of the network
  const [state, setState] = useState({
    coldIn: 0,
    heatIn: 0,
    n2: 0,
    n5: 0,
    heatOut: 0,
    coldOut: 0
  });

  const reset = () => {
    setStep(0);
    setIsRunning(false);
    setInputMode('none');
    setIsHolding(false);
    setHoldTime(0);
    setTargetNode('none');
    setState({ coldIn: 0, heatIn: 0, n2: 0, n5: 0, heatOut: 0, coldOut: 0 });
  };

  useEffect(() => {
    let interval: any;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldTime(prev => prev + 50);
      }, 50);
    } else {
      if (inputMode === 'dynamic') {
        setState({ coldIn: 0, heatIn: 0, n2: 0, n5: 0, heatOut: 0, coldOut: 0 });
        setInputMode('none');
        setTargetNode('none');
      }
      setHoldTime(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, inputMode]);

  useEffect(() => {
    if (!isHolding || inputMode !== 'dynamic') return;

    const newState = { coldIn: 0, heatIn: 0, n2: 0, n5: 0, heatOut: 0, coldOut: 0 };

    if (targetNode === 'cold') {
      // Cold Node: Direct activation of cold pathway
      newState.coldIn = 1;
      if (holdTime > 200) newState.n5 = 1 >= params.n5Threshold ? 1 : 0;
      if (holdTime > 500) newState.coldOut = (newState.n5 * params.n5ToColdWeight) >= params.coldOutThreshold ? 1 : 0;
    } else if (targetNode === 'heat') {
      // Heat Node: Dynamic progression to paradox
      newState.heatIn = 1;
      
      // Phase 1: Initial Heat (0-1000ms)
      if (holdTime < 1000) {
        newState.heatOut = 1 >= params.heatOutThreshold ? 1 : 0;
      } 
      // Phase 2: Activation of Inhibitor and Cold Pathway (1000-2000ms)
      else if (holdTime < 2000) {
        newState.n2 = 1 >= params.n2Threshold ? 1 : 0;
        newState.n5 = 1 >= params.n5Threshold ? 1 : 0;
        // Heat is still active but starting to be inhibited
        const heatSum = 1 + (newState.n2 * params.inhibitionWeight * 0.5);
        newState.heatOut = heatSum >= params.heatOutThreshold ? 1 : 0;
      }
      // Phase 3: Full Paradox ( > 2000ms)
      else {
        newState.n2 = 1 >= params.n2Threshold ? 1 : 0;
        newState.n5 = 1 >= params.n5Threshold ? 1 : 0;
        
        const heatSum = 1 + (newState.n2 * params.inhibitionWeight);
        newState.heatOut = heatSum >= params.heatOutThreshold ? 1 : 0;
        
        const coldSum = (newState.n5 * params.n5ToColdWeight);
        newState.coldOut = coldSum >= params.coldOutThreshold ? 1 : 0;
      }
    }

    setState(newState);
  }, [holdTime, isHolding, inputMode, params, targetNode]);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setStep(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (inputMode === 'none') return;

    if (inputMode === 'short') {
      if (step === 1) {
        setState(s => ({ ...s, coldIn: 1 }));
      } else if (step === 2) {
        const n5Active = 1 >= params.n5Threshold ? 1 : 0;
        setState(s => ({ ...s, n5: n5Active }));
      } else if (step === 3) {
        const coldOutActive = (state.n5 * params.n5ToColdWeight) >= params.coldOutThreshold ? 1 : 0;
        setState(s => ({ ...s, coldOut: coldOutActive }));
      } else if (step > 4) {
        setIsRunning(false);
      }
    }

    if (inputMode === 'long') {
      if (step === 1) {
        setState(s => ({ ...s, heatIn: 1 }));
      } else if (step === 2) {
        const heatOutActive = 1 >= params.heatOutThreshold ? 1 : 0;
        setState(s => ({ ...s, heatOut: heatOutActive }));
      } else if (step === 3) {
        const n2Active = 1 >= params.n2Threshold ? 1 : 0;
        const n5Active = 1 >= params.n5Threshold ? 1 : 0;
        setState(s => ({ ...s, n2: n2Active, n5: n5Active }));
      } else if (step === 4) {
        const heatSum = 1 + (state.n2 * params.inhibitionWeight);
        const heatOutActive = heatSum >= params.heatOutThreshold ? 1 : 0;
        
        const coldSum = (state.n5 * params.n5ToColdWeight);
        const coldOutActive = coldSum >= params.coldOutThreshold ? 1 : 0;

        setState(s => ({ 
          ...s, 
          heatOut: heatOutActive,
          coldOut: coldOutActive
        }));
      } else if (step > 5) {
        setIsRunning(false);
      }
    }
  }, [step, inputMode, params, state.n2, state.n5]);

  const startSim = (mode: 'short' | 'long') => {
    reset();
    setInputMode(mode);
    setIsRunning(true);
    setStep(1);
  };

  const updateParam = (key: keyof typeof params, val: string) => {
    setParams(p => ({ ...p, [key]: parseFloat(val) || 0 }));
  };

  // Node Positions for SVG
  const pos = {
    heatIn: { x: 150, y: 100 },
    coldIn: { x: 450, y: 100 },
    n2: { x: 250, y: 250 },
    n5: { x: 450, y: 250 },
    coldOut: { x: 450, y: 400 },
    heatOut: { x: 150, y: 400 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Il Freddo Paradossale</h3>
            <p className="text-zinc-500 text-sm">
              Perché sentiamo "caldo" quando tocchiamo qualcosa di gelido? 
              Questa rete illustra l'inibizione temporale.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-[32px] p-8 relative overflow-hidden min-h-[500px] flex items-center justify-center">
            <div className="absolute top-6 left-8 z-20">
              <button
                onClick={reset}
                className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-md"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <div className="relative w-[600px] h-[500px]">
              <svg className="absolute inset-0 w-full h-full z-0">
                {/* Connections */}
                <Connection from={pos.coldIn} to={pos.n5} active={state.coldIn > 0} />
                <Connection from={pos.heatIn} to={pos.n2} active={state.heatIn > 0} />
                <Connection from={pos.heatIn} to={pos.n5} active={state.heatIn > 0} />
                <Connection from={pos.heatIn} to={pos.heatOut} active={state.heatIn > 0} />
                <Connection from={pos.n2} to={pos.heatOut} active={state.n2 > 0} isInhibitory />
                <Connection from={pos.n5} to={pos.coldOut} active={state.n5 > 0} />
              </svg>

              <Node 
                active={state.coldIn > 0} 
                label="Cold In" 
                icon={Snowflake} 
                color="blue" 
                x={pos.coldIn.x} 
                y={pos.coldIn.y}
                onMouseDown={() => { setInputMode('dynamic'); setTargetNode('cold'); setIsHolding(true); }}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => { setInputMode('dynamic'); setTargetNode('cold'); setIsHolding(true); }}
                onTouchEnd={() => setIsHolding(false)}
                className="cursor-pointer"
                holdTime={targetNode === 'cold' ? holdTime : 0}
                maxHoldTime={1000}
                isHolding={isHolding && targetNode === 'cold'}
              />
              <Node 
                active={state.heatIn > 0} 
                label="Heat In" 
                icon={Flame} 
                color="orange" 
                x={pos.heatIn.x} 
                y={pos.heatIn.y}
                onMouseDown={() => { setInputMode('dynamic'); setTargetNode('heat'); setIsHolding(true); }}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => { setInputMode('dynamic'); setTargetNode('heat'); setIsHolding(true); }}
                onTouchEnd={() => setIsHolding(false)}
                className="cursor-pointer"
                holdTime={targetNode === 'heat' ? holdTime : 0}
                maxHoldTime={2000}
                isHolding={isHolding && targetNode === 'heat'}
                pulse={isHolding && targetNode === 'heat' && holdTime > 2000}
              />
              
              <Node active={state.n2 > 0} label="N2 (Inibitore)" type="neuron" color="red" x={pos.n2.x} y={pos.n2.y} pulse={state.n2 > 0} />
              <Node active={state.n5 > 0} label="N5" type="neuron" color="emerald" x={pos.n5.x} y={pos.n5.y} pulse={state.n5 > 0} />
              
              <Node active={state.coldOut > 0} label="Cold Out" icon={Snowflake} color="blue" x={pos.coldOut.x} y={pos.coldOut.y} />
              <Node active={state.heatOut > 0} label="Heat Out" icon={Flame} color="orange" x={pos.heatOut.x} y={pos.heatOut.y} pulse={state.heatOut > 0} />
            </div>

            <div className="absolute top-6 right-8 flex flex-col items-end gap-2">
              {isHolding && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-3 backdrop-blur-md"
                >
                  <Fingerprint size={14} className="text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {targetNode === 'cold' ? "Stimolo Freddo" : (holdTime < 1000 ? "Stimolo Caldo" : (holdTime < 2000 ? "Inibizione..." : "Paradosso Freddo"))}
                  </span>
                  <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min((holdTime / 4000) * 100, 100)}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
              Simulation Step: {step}
            </div>
            {isRunning && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                SIMULAZIONE IN CORSO
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Parameters and Instructions */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Parametri Rete</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">SOGLIA N2</label>
                <input type="number" value={params.n2Threshold} onChange={(e) => updateParam('n2Threshold', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">SOGLIA N5</label>
                <input type="number" value={params.n5Threshold} onChange={(e) => updateParam('n5Threshold', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">SOGLIA CALDO</label>
                <input type="number" value={params.heatOutThreshold} onChange={(e) => updateParam('heatOutThreshold', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">SOGLIA FREDDO</label>
                <input type="number" value={params.coldOutThreshold} onChange={(e) => updateParam('coldOutThreshold', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">PESO INIBIZ. (N2)</label>
                <input type="number" value={params.inhibitionWeight} onChange={(e) => updateParam('inhibitionWeight', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500">PESO N5 → FREDDO</label>
                <input type="number" value={params.n5ToColdWeight} onChange={(e) => updateParam('n5ToColdWeight', e.target.value)} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs" />
              </div>
            </div>

            <div className="bg-zinc-100 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <HelpCircle size={14} /> Come funziona
              </h4>
              <div className="space-y-3">
                <StepInfo active={step >= 1 || isHolding} text="1. Tocca i nodi di input (Cold/Heat)." />
                <StepInfo active={step >= 2 || (isHolding && holdTime > 1000)} text="2. Tieni premuto Heat per il paradosso." />
                <StepInfo active={step >= 3 || (isHolding && holdTime > 1500)} text="3. Osserva l'inibizione temporale." />
                <StepInfo active={step >= 4 || (isHolding && holdTime > 2000)} text="4. Il caldo diventa freddo." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StepInfo = ({ active, text }: { active: boolean, text: string }) => (
  <div className={cn(
    "flex items-center gap-3 transition-all",
    active ? "translate-x-1 opacity-100" : "opacity-30"
  )}>
    <div className={cn(
      "w-1.5 h-1.5 rounded-full",
      active ? "bg-emerald-500" : "bg-zinc-400"
    )} />
    <span className="text-xs font-medium">{text}</span>
  </div>
);
