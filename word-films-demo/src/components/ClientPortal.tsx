import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { LogOut, ChevronDown, GripVertical, Clock, Users, Zap, LayoutDashboard, Activity, Eye, EyeOff, ArrowDownToLine, ListFilter, ArrowUpNarrowWide, ArrowDownNarrowWide, PlayCircle, Layers, X, List } from 'lucide-react';
import { subscribeToPortalData, updatePortalData } from '../firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
  Rectangle
} from 'recharts';

// --- TYPES & MOCK DATA ---

type ContentType = 'Pulse' | 'Reportagem' | 'Short Reel' | 'Small Deliverable' | 'Talk' | 'Talk to Short' | 'Teaser IA' | 'Tutorial';
type ContentStatus = 'Planejando' | 'À Fazer' | 'Em Andamento' | 'Aprovação' | 'Alteração' | 'Concluído';

interface VideoTask {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  hours: number;
}

const CONTENT_COLORS: Record<ContentType, string> = {
  'Pulse': '#1976D2',
  'Reportagem': '#2196F3',
  'Short Reel': '#42A5F5',
  'Small Deliverable': '#64B5F6',
  'Talk': '#90CAF9',
  'Talk to Short': '#BBDEFB',
  'Teaser IA': '#0D47A1',
  'Tutorial': '#1565C0'
};

const STATUS_ORDER = ['Planejando', 'À Fazer', 'Em Andamento', 'Aprovação', 'Alteração', 'Concluído'];

const MOCK_CLIENTS: Record<string, VideoTask[]> = {
  'GRI': [
    { id: 'g1', title: 'Relatório ESG 2025', type: 'Reportagem', status: 'À Fazer', hours: 10 },
    { id: 'g2', title: 'Entrevista CEO', type: 'Talk', status: 'Aprovação', hours: 5 },
    { id: 'g3', title: 'Teaser IA - Sustentabilidade', type: 'Teaser IA', status: 'Planejando', hours: 16 },
    { id: 'g4', title: 'Como usar a plataforma', type: 'Tutorial', status: 'Em Andamento', hours: 14 },
    { id: 'g5', title: 'Highlights Evento', type: 'Short Reel', status: 'À Fazer', hours: 8 },
    { id: 'g6', title: 'Teaser IA - Q3', type: 'Teaser IA', status: 'Alteração', hours: 16 },
    { id: 'g7', title: 'Talk to Short 01', type: 'Talk to Short', status: 'Planejando', hours: 4.5 },
    { id: 'g8', title: 'Talk to Short 02', type: 'Talk to Short', status: 'Concluído', hours: 5 },
    { id: 'g9', title: 'Reportagem Campo', type: 'Reportagem', status: 'Em Andamento', hours: 8 },
  ],
  'Executa': [
    { id: 'e1', title: 'Onboarding App', type: 'Tutorial', status: 'Planejando', hours: 10 },
    { id: 'e2', title: 'Pulse Update', type: 'Pulse', status: 'Em Andamento', hours: 3 },
    { id: 'e3', title: 'Promo Instagram', type: 'Short Reel', status: 'Aprovação', hours: 4 },
  ],
  'Anima': [
    { id: 'a1', title: 'Processos Internos', type: 'Small Deliverable', status: 'À Fazer', hours: 6 },
    { id: 'a2', title: 'Teaser Produto', type: 'Teaser IA', status: 'Planejando', hours: 12 },
  ]
};

// --- HELPER FUNCTIONS ---

const formatHours = (decimalHours: number) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
};

// --- COMPONENTS ---

const DraggableQueueList = ({
  items,
  acknowledgedTasks,
  onReorderEnd,
  handleAcknowledge,
  onDraggingChange
}: {
  items: VideoTask[];
  acknowledgedTasks: Set<string>;
  onReorderEnd: (newOrder: VideoTask[]) => void;
  handleAcknowledge: (e: any, taskId: string) => void;
  onDraggingChange: (isDragging: boolean) => void;
}) => {
  const [localItems, setLocalItems] = useState(items);
  const [localIsDragging, setLocalIsDragging] = useState(false);

  useEffect(() => {
    if (!localIsDragging) {
      setLocalItems(items);
    }
  }, [items, localIsDragging]);

  const handleDragEnd = () => {
    setLocalIsDragging(false);
    onDraggingChange(false);
    onReorderEnd(localItems);
  };

  return (
    <Reorder.Group 
      axis="y" 
      values={localItems} 
      onReorder={setLocalItems} 
      className="space-y-2"
      layoutScroll
    >
      {localItems.map((task, index) => {
        const isConcluido = task.status === 'Concluído';
        const isAcknowledged = acknowledgedTasks.has(task.id);
        const shouldGlow = isConcluido && !isAcknowledged;
        
        const isArchived = isConcluido && isAcknowledged;
        // Don't calculate borders dynamically while dragging for performance
        const prevIsArchived = index > 0 && localItems[index-1].status === 'Concluído' && acknowledgedTasks.has(localItems[index-1].id);
        const showConcluidosHeader = isArchived && !prevIsArchived && !localIsDragging;
        
        return (
          <Reorder.Item 
            key={task.id}
            value={task}
            onDragStart={() => {
              setLocalIsDragging(true);
              onDraggingChange(true);
            }}
            onDragEnd={handleDragEnd}
            className="relative"
            // Make sure dragged layout updates properly with minimal thrashing
          >
            {showConcluidosHeader && (
              <div className="py-2 flex items-center gap-3 mt-4 mb-2 cursor-default">
                 <div className="h-px flex-1 bg-zinc-800/50" />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Concluídos</span>
                 <div className="h-px flex-1 bg-zinc-800/50" />
              </div>
            )}
            <div className={`border p-3 rounded-2xl flex items-center gap-3 cursor-grab active:cursor-grabbing transition-colors ${shouldGlow ? 'bg-[#22C55E]/10 border-[#22C55E]/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-black border-zinc-800/70 hover:border-zinc-700'}`}>
              <GripVertical className={shouldGlow ? "text-[#22C55E]" : "text-zinc-600"} size={16} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start md:items-center mb-1 md:mb-1.5 gap-2">
                  <p className="text-xs md:text-sm font-semibold text-zinc-200 line-clamp-2 md:truncate pr-2">{task.title}</p>
                  <span className="text-xs font-mono text-[#2196F3] flex-shrink-0 mt-0.5 md:mt-0">{formatHours(task.hours)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1 md:mt-0">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                     <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CONTENT_COLORS[task.type]}20`, color: CONTENT_COLORS[task.type] }}>
                       {task.type}
                     </span>
                     {!isConcluido ? (
                       <span className="text-[10px] text-zinc-500 whitespace-nowrap">{task.status}</span>
                     ) : (
                       <span className="text-[10px] text-[#22C55E] font-bold whitespace-nowrap">Concluído</span>
                     )}
                  </div>
                  
                  {shouldGlow && (
                    <button 
                      onClick={(e) => handleAcknowledge(e, task.id)}
                      className="flex items-center gap-1 text-[10px] text-[#22C55E] hover:text-[#16a34a] hover:bg-[#22C55E]/20 px-2 py-1 rounded transition-colors whitespace-nowrap ml-auto"
                    >
                      <ArrowDownToLine size={12} />
                      Arquivar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};

export const ClientPortal = ({ onBack }: { onBack: () => void }) => {
  // Initialize from sessionStorage to maintain session when navigating back from Home
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('portal_authenticated') === 'true';
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedClient, setSelectedClient] = useState<string>(() => {
    return sessionStorage.getItem('portal_selected_client') || 'GRI';
  });
  const [clientData, setClientData] = useState<VideoTask[]>(MOCK_CLIENTS['GRI']);
  const [acknowledgedTasks, setAcknowledgedTasks] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileQueueOpen, setIsMobileQueueOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Use refs to keep track of latest state for unmount-syncing
  const latestDataRef = React.useRef({ clientData, acknowledgedTasks, selectedClient, isAuthenticated, isDragging });
  
  useEffect(() => {
    latestDataRef.current = { clientData, acknowledgedTasks, selectedClient, isAuthenticated, isDragging };
  }, [clientData, acknowledgedTasks, selectedClient, isAuthenticated, isDragging]);


  // Persistence: Subscribe to changes for the selected client
  useEffect(() => {
    if (!isAuthenticated || !selectedClient) return;

    const unsubscribe = subscribeToPortalData(selectedClient, (data) => {
      if (data && data.tasks) {
        // Deep compare simple JSON to avoid overwrite loops
        const currentTasksJson = JSON.stringify(latestDataRef.current.clientData);
        const incomingTasksJson = JSON.stringify(data.tasks);
        const currentAckJson = JSON.stringify(Array.from(latestDataRef.current.acknowledgedTasks));
        const incomingAckJson = JSON.stringify(data.acknowledgedTaskIds || []);

        if (!latestDataRef.current.isDragging) {
          if (currentTasksJson !== incomingTasksJson) {
             setClientData(data.tasks);
          }
          if (currentAckJson !== incomingAckJson) {
             setAcknowledgedTasks(new Set(data.acknowledgedTaskIds || []));
          }
        }
      } else if (!data) {
        // Initialize with mocks if no data exists in Firestore Yet
        const initialTasks = MOCK_CLIENTS[selectedClient] || [];
        setClientData(initialTasks);
        setAcknowledgedTasks(new Set());
        updatePortalData(selectedClient, initialTasks, []);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, selectedClient]);

  // Persistence: Debounced Sync to Firestore
  useEffect(() => {
    if (!isAuthenticated || !selectedClient || isDragging) return;

    const timer = setTimeout(async () => {
      // Only sync if data has actually been loaded/initialized
      if (clientData.length > 0) {
        setIsSyncing(true);
        try {
          await updatePortalData(selectedClient, clientData, Array.from(acknowledgedTasks));
        } catch (error) {
          console.error("Failed to sync portal data:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    }, 500); // Shorter debounce (500ms)

    return () => clearTimeout(timer);
  }, [clientData, acknowledgedTasks, selectedClient, isAuthenticated, isDragging]);

  // Persistence: Final sync on unmount
  useEffect(() => {
    return () => {
      const current = latestDataRef.current;
      if (current.isAuthenticated && current.selectedClient && current.clientData.length > 0) {
        updatePortalData(current.selectedClient, current.clientData, Array.from(current.acknowledgedTasks)).catch(console.error);
      }
    };
  }, []);

  // Persistence: Manual push helper (remaining for immediate actions if needed)
  const persistChanges = useCallback(async (newTasks: VideoTask[], newAcknowledged: Set<string>) => {
    if (!selectedClient) return;
    // We can rely on the useEffect for most things, but immediate actions can call this
    await updatePortalData(selectedClient, newTasks, Array.from(newAcknowledged));
  }, [selectedClient]);

  // Lock body scroll when mobile queue is open
  useEffect(() => {
    if (isMobileQueueOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isMobileQueueOpen]);

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const p = password.trim().toLowerCase();
    
    // Find client by matching password (case insensitive)
    const clientKey = Object.keys(MOCK_CLIENTS).find(k => k.toLowerCase() === p);

    if (clientKey) {
      setSelectedClient(clientKey);
      setIsAuthenticated(true);
      sessionStorage.setItem('portal_authenticated', 'true');
      sessionStorage.setItem('portal_selected_client', clientKey);
      setError("");
    } else {
      setError("Cliente não encontrado. Tente 'gri', 'executa' ou 'anima'");
    }
  };

  // Change Client
  const handleClientChange = (client: string) => {
    setSelectedClient(client);
    sessionStorage.setItem('portal_selected_client', client);
    setIsDropdownOpen(false);
  };

  // Derived Data: Represado Data (Individual Tasks)
  const represadoData = useMemo(() => {
    return clientData
      .map(task => ({
        id: task.id,
        name: task.title,
        hours: task.hours,
        fill: task.status === 'Concluído' ? '#22C55E' : CONTENT_COLORS[task.type],
        type: task.type,
        status: task.status
      }));
  }, [clientData]);

  const totalRepresado = useMemo(() => {
    return represadoData
      .filter(task => task.status !== 'Concluído')
      .reduce((acc, curr) => acc + curr.hours, 0);
  }, [represadoData]);

  // Derived Data: Status Count Data (Stacked)
  const statusData = useMemo(() => {
    return STATUS_ORDER.map(status => {
      const dataForStatus: any = { status };
      clientData.filter(t => t.status === status).forEach(task => {
        dataForStatus[task.type] = (dataForStatus[task.type] || 0) + 1;
      });
      return dataForStatus;
    });
  }, [clientData]);

  // Unqiue Types present in the client for Stacked Bar Legends
  const activeTypes = useMemo(() => {
    const types = new Set<ContentType>();
    clientData.forEach(t => types.add(t.type));
    // Sort to keep stacking order consistent regardless of task priority reordering
    return Array.from(types).sort();
  }, [clientData]);

  // Handle acknowledging a concluded task (Move to bottom of the queue and remove glow)
  const handleAcknowledge = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // prevent drag action
    
    const newAcknowledged = new Set(acknowledgedTasks);
    newAcknowledged.add(taskId);
    setAcknowledgedTasks(newAcknowledged);

    const taskIndex = clientData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const newTasks = [...clientData];
      const [movedTask] = newTasks.splice(taskIndex, 1);
      newTasks.push(movedTask);
      setClientData(newTasks);
    }
  };

  // Handle Manual Reorder (called when drag ends)
  const handleReorder = (newOrder: VideoTask[]) => {
    let nextAcknowledged = new Set(acknowledgedTasks);
    let changed = false;

    // 1. Auto-unarchive: If an acknowledged item is moved above any unacknowledged item
    let inArchivedZone = true;
    for (let i = newOrder.length - 1; i >= 0; i--) {
      const task = newOrder[i];
      const isCurrentlyAcknowledged = acknowledgedTasks.has(task.id);
      
      if (inArchivedZone) {
        if (!isCurrentlyAcknowledged) {
          inArchivedZone = false;
        }
      } else {
        if (isCurrentlyAcknowledged) {
          nextAcknowledged.delete(task.id);
          changed = true;
        }
      }
    }

    // 2. Auto-archive: If the last item is now 'Concluído' and wasn't acknowledged yet
    const lastItem = newOrder[newOrder.length - 1];
    if (lastItem && lastItem.status === 'Concluído' && !nextAcknowledged.has(lastItem.id)) {
      nextAcknowledged.add(lastItem.id);
      changed = true;
    }

    setClientData(newOrder);
    if (changed) {
      setAcknowledgedTasks(nextAcknowledged);
    }
  };

  // Handle Sort
  const handleSortQueue = (sortMode: 'time-asc' | 'time-desc' | 'status' | 'complexity') => {
    const sorted = [...clientData];
    
    sorted.sort((a, b) => {
      // Force acknowledged 'Concluído' tasks to the absolute bottom
      const aArchived = a.status === 'Concluído' && acknowledgedTasks.has(a.id);
      const bArchived = b.status === 'Concluído' && acknowledgedTasks.has(b.id);
      
      if (aArchived && !bArchived) return 1;
      if (!aArchived && bArchived) return -1;

      // If both share the same archived state, sort normally based on the requested filter
      if (sortMode === 'time-asc') {
        return a.hours - b.hours;
      } else if (sortMode === 'time-desc') {
        return b.hours - a.hours;
      } else if (sortMode === 'status') {
        const order: Record<ContentStatus, number> = {
          'Em Andamento': 1,
          'Alteração': 2,
          'À Fazer': 3,
          'Planejando': 4,
          'Aprovação': 5,
          'Concluído': 6
        };
        return order[a.status] - order[b.status];
      } else if (sortMode === 'complexity') {
        const order: Record<ContentType, number> = {
          'Reportagem': 1,
          'Talk': 2,
          'Tutorial': 3,
          'Pulse': 4,
          'Talk to Short': 5,
          'Teaser IA': 6,
          'Short Reel': 7,
          'Small Deliverable': 8
        };
        return order[a.type] - order[b.type];
      }
      return 0;
    });
    
    setClientData(sorted);
    setIsSortOpen(false);
  };

  // Count of completed tasks that haven't been archived yet
  const pendingConcluidosCount = useMemo(() => {
    return clientData.filter(t => t.status === 'Concluído' && !acknowledgedTasks.has(t.id)).length;
  }, [clientData, acknowledgedTasks]);

  // Custom Tooltip for Represado Chart (Chart 1)
  const renderRepresadoTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-content bg-[#18181B] border border-[#3F3F46] p-3 rounded-xl shadow-xl">
          <p className="text-[#A1A1AA] text-xs mb-1">{label}</p>
          <p className="text-white text-sm">Duração: <span className="font-bold">{formatHours(payload[0].value)}</span></p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Status Chart
  const renderStatusTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-content bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label === 'Concluído' ? '#22C55E' : entry.color }} />
              <span className="text-zinc-300">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-zinc-800 text-sm font-bold text-[#2196F3]">
            Total: {payload.reduce((acc: number, entry: any) => acc + entry.value, 0)} vídeos
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tick for Wrapping Text in Represado Chart
  const renderCustomBarTick = ({ x, y, payload }: any) => {
    const words = payload.value.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word: string) => {
      // Hyphenate word if too long
      if (word.length > 10) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        lines.push(word.substring(0, 8) + '-');
        lines.push(word.substring(8));
      } else if ((currentLine + word).length > 10) {
         if (currentLine) lines.push(currentLine.trim());
         currentLine = word + ' ';
      } else {
         currentLine += word + ' ';
      }
    });
    if (currentLine) lines.push(currentLine.trim());

    const mobileText = payload.value.length > 12 ? payload.value.substring(0, 11) + '...' : payload.value;

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Mobile: Rotated Text */}
        <text 
          x={0} 
          y={0} 
          dy={12} 
          textAnchor="end" 
          fill="#A1A1AA" 
          fontSize={10} 
          transform="rotate(-45)"
          className="md:hidden"
        >
          {mobileText}
        </text>

        {/* Desktop: Wrapped Horizontal Text */}
        <text 
          x={0} 
          y={10} 
          dy={14} 
          textAnchor="middle" 
          fill="#A1A1AA" 
          fontSize={11} 
          className="hidden md:block"
        >
          {lines.map((line, index) => (
            <tspan textAnchor="middle" x={0} dy={index === 0 ? 0 : 14} key={index}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  // Custom Tick for Second Chart (Status)
  const CustomStatusTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Mobile */}
        <text 
          x={0} 
          y={0} 
          dy={12} 
          textAnchor="end" 
          fill="#A1A1AA" 
          fontSize={10} 
          transform="rotate(-40)"
          className="md:hidden"
        >
          {payload.value}
        </text>

        {/* Desktop */}
        <text 
          x={0} 
          y={10} 
          dy={14} 
          textAnchor="middle" 
          fill="#A1A1AA" 
          fontSize={11} 
          className="hidden md:block"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom Shape for Stacked Bars to properly round only the highest available block
  const CustomStackedBar = (props: any) => {
    const { fill, x, y, width, height, payload, dataKey } = props;
    if (height === 0 || isNaN(height)) return null;
    
    let isTop = false;
    // Iterate from the latest processed component to the earliest
    for (let i = activeTypes.length - 1; i >= 0; i--) {
      const type = activeTypes[i];
      if (payload[type] && payload[type] > 0) {
         if (type === dataKey) {
            isTop = true;
         }
         break;
      }
    }
    
    const isConcluido = payload.status === 'Concluído';
    const finalFill = isConcluido ? '#22C55E' : fill;
    const stroke = isConcluido ? '#000000' : 'none';
    const strokeWidth = isConcluido ? 1 : 0;
    
    return (
      <Rectangle 
        className="recharts-bar-rectangle"
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill={finalFill} 
        stroke={stroke} 
        strokeWidth={strokeWidth} 
        radius={isTop ? [6, 6, 0, 0] : [0, 0, 0, 0]} 
      />
    );
  };

  // Render
  return (
    <div className="min-h-screen bg-transparent text-zinc-50 pt-32 pb-16 px-4 md:px-8 relative z-10 font-sans">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="portal-login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-[#2196F3]/20 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="text-[#2196F3]" size={24} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2 tracking-tight text-white">Portal do Cliente</h2>
              <p className="text-zinc-500 text-center mb-8 text-sm">Acesse seu dashboard de acompanhamento</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Insira a chave do cliente"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-[#2196F3] transition-colors"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button 
                  type="submit"
                  className="w-full bg-[#2196F3] text-white font-bold py-3 rounded-xl hover:bg-[#1976D2] transition-colors shadow-lg shadow-[#2196F3]/20"
                >
                  Acessar Painel
                </button>
              </form>
              <button 
                onClick={onBack}
                className="w-full mt-4 text-zinc-500 text-xs hover:text-white transition-colors"
              >
                ← Voltar ao Site
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="portal-dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <div className="max-w-[1400px] mx-auto space-y-6">
              
              {/* TOP BAR */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 md:gap-6 border-b border-zinc-800/50 pb-4 md:pb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-white">Dashboard <span className="text-[#2196F3]">{selectedClient}</span></h1>
                  <p className="text-zinc-500 text-xs md:text-sm">Acompanhamento e Inteligência Visual de Produção</p>
                </div>
                
                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 md:gap-4">
                  {pendingConcluidosCount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: [
                          "0 0 0px rgba(34, 197, 94, 0)",
                          "0 0 15px rgba(34, 197, 94, 0.4)",
                          "0 0 0px rgba(34, 197, 94, 0)"
                        ]
                      }}
                      transition={{
                        boxShadow: {
                          repeat: Infinity,
                          duration: 2
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#22C55E]/15 border border-[#22C55E]/50 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
                      <span className="text-xs font-bold text-[#22C55E] drop-shadow-[0_0_3px_rgba(34,197,94,0.3)]">
                        {pendingConcluidosCount} {pendingConcluidosCount === 1 ? 'concluída' : 'concluídas'}
                      </span>
                    </motion.div>
                  )}
                  <button 
                    onClick={() => {
                      setIsAuthenticated(false);
                      setPassword("");
                      sessionStorage.removeItem('portal_authenticated');
                      sessionStorage.removeItem('portal_selected_client');
                    }}
                    className="px-4 py-2 border border-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>

              {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 md:p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 mb-3 md:mb-4 whitespace-nowrap">
              <Clock size={16} className="text-[#2196F3]" />
              <span className="text-xs md:text-sm font-semibold truncate">Tempo Represado</span>
            </div>
            <div className="mt-auto">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">{formatHours(totalRepresado)}</span>
              <p className="text-zinc-500 text-[10px] md:text-xs mt-1">Acúmulo pendente</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 md:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-400 mb-3 md:mb-4 whitespace-nowrap">
              <Users size={16} />
              <span className="text-xs md:text-sm font-semibold truncate">Editores Alocados</span>
            </div>
            <div className="mt-auto">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">4</span>
              <p className="text-zinc-500 text-[10px] md:text-xs mt-1">Profissionais ativos</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 md:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-400 mb-3 md:mb-4 whitespace-nowrap">
              <Zap size={16} />
              <span className="text-xs md:text-sm font-semibold truncate">Tempo/Editor</span>
            </div>
            <div className="mt-auto">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">10h</span>
              <p className="text-zinc-500 text-[10px] md:text-xs mt-1">Média produtiva</p>
            </div>
          </div>

          <div className="bg-[#2196F3]/10 backdrop-blur-md border border-[#2196F3]/20 rounded-2xl p-4 md:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#42A5F5] mb-3 md:mb-4 whitespace-nowrap">
              <Activity size={16} />
              <span className="text-xs md:text-sm font-semibold truncate">Capacidade</span>
            </div>
            <div className="mt-auto">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#2196F3]">40h</span>
              <p className="text-[#2196F3]/70 text-[10px] md:text-xs mt-1">Horas entregues/dia</p>
            </div>
          </div>
        </div>

        {/* CHARTS LAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* COLUNA ESQUERDA: GRÁFICOS */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full overflow-hidden">
            {/* Chart 1: Tempo Represado */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-4 md:p-6 overflow-hidden">
              <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white text-balance leading-tight">Tempo Médio de Edição por Tipo de Vídeo</h3>
              <div className="chart-container h-[280px] md:h-[350px] w-full hidden-scrollbar tracking-tighter md:tracking-normal pb-4 md:pb-0 relative">
                {represadoData.length > 0 && (
                  <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={represadoData} margin={{ top: 20, right: 0, left: -5, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#71717A" 
                      axisLine={false} 
                      tickLine={false}
                      interval={0}
                      tick={renderCustomBarTick}
                    />
                    <YAxis 
                      stroke="#71717A" 
                      tick={{ fill: '#A1A1AA', fontSize: 11 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `${value}h`}
                      width={30}
                    />
                    <RechartsTooltip 
                      cursor={false}
                      content={renderRepresadoTooltip}
                      wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                      isAnimationActive={false}
                    />
                    <Bar 
                      dataKey="hours" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={45} 
                      isAnimationActive={false}
                      activeBar={false}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    >
                      {represadoData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill} 
                        />
                      ))}
                      <LabelList dataKey="hours" position="top" fill="#fff" fontSize={10} formatter={(val: number) => formatHours(val)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Contagem por Status */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-4 md:p-6 overflow-hidden">
              <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white text-balance leading-tight">Contagem por Status e Tipo de Conteúdo</h3>
              <div className="chart-container h-[300px] md:h-[350px] w-full hidden-scrollbar tracking-tighter md:tracking-normal relative">
                {statusData.length > 0 && (
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={statusData} margin={{ top: 20, right: 0, left: -5, bottom: 0 }} barSize={45}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                    <XAxis 
                      dataKey="status" 
                      stroke="#71717A" 
                      tick={<CustomStatusTick />}
                      axisLine={false} 
                      tickLine={false}
                      interval={0}
                      height={55}
                    />
                    <YAxis 
                      stroke="#71717A" 
                      tick={{ fill: '#A1A1AA', fontSize: 11 }} 
                      axisLine={false} 
                      tickLine={false}
                      allowDecimals={false}
                      domain={[0, 'dataMax']}
                      width={25}
                    />
                    <RechartsTooltip content={renderStatusTooltip} cursor={false} wrapperStyle={{ outline: 'none', pointerEvents: 'none' }} isAnimationActive={false} />
                    <Legend 
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: '15px' }}
                      formatter={(value) => <span style={{ color: '#A1A1AA', fontSize: '10px', whiteSpace: 'nowrap' }}>{value}</span>}
                    />
                    
                    {activeTypes.map((type, idx) => (
                      <Bar 
                        key={type} 
                        dataKey={type} 
                        stackId="a" 
                        fill={CONTENT_COLORS[type]} 
                        isAnimationActive={false}
                        activeBar={false}
                        shape={<CustomStackedBar />}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Overlay for Queue */}
          {isMobileQueueOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              style={{ touchAction: 'none' }}
              onClick={() => setIsMobileQueueOpen(false)}
            />
          )}

          {/* Interactive Priority Queue */}
          <div className={`
            flex flex-col items-stretch
            transition-transform duration-300 ease-out
            fixed bottom-0 left-0 right-0 z-50 h-[85vh] bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 rounded-t-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
            ${isMobileQueueOpen ? 'translate-y-0' : 'translate-y-full'}
            lg:translate-y-0 lg:static lg:z-auto lg:h-fit lg:bg-zinc-900/50 lg:backdrop-blur-md lg:border lg:border-zinc-800/50 lg:rounded-3xl lg:p-6 lg:shadow-none lg:col-span-4
          `}>
             <div className="mb-4 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white truncate">Fila de Priorização</h3>
                <p className="text-[10px] md:text-xs text-zinc-500 mt-0.5 truncate">Arraste para repriorizar</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative flex-shrink-0">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                    title="Ordenar Fila"
                  >
                    <ListFilter size={16} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-12 w-64 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-30 flex flex-col py-1">
                      <button onClick={() => { handleSortQueue('time-asc'); setIsSortOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                        <ArrowUpNarrowWide size={14} className="text-[#2196F3]" />
                        Tempo (Menor p/ Maior)
                      </button>
                      <button onClick={() => { handleSortQueue('time-desc'); setIsSortOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                        <ArrowDownNarrowWide size={14} className="text-[#2196F3]" />
                        Tempo (Maior p/ Menor)
                      </button>
                      <button onClick={() => { handleSortQueue('status'); setIsSortOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                        <PlayCircle size={14} className="text-[#22C55E]" />
                        Status (Em Andamento ↑)
                      </button>
                      <button onClick={() => { handleSortQueue('complexity'); setIsSortOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                        <Layers size={14} className="text-[#9C27B0]" />
                        Complexidade (Formato)
                      </button>
                    </div>
                  )}
                </div>

                {/* Close Button for Mobile */}
                <button 
                  onClick={() => setIsMobileQueueOpen(false)}
                  className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors lg:hidden flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
             </div>
             
             <div className="flex-1 overflow-y-auto lg:overflow-y-visible pr-2 custom-scrollbar">
                <DraggableQueueList 
                   items={clientData}
                   acknowledgedTasks={acknowledgedTasks}
                   onDraggingChange={setIsDragging}
                   onReorderEnd={handleReorder}
                   handleAcknowledge={handleAcknowledge}
                />
             </div>
          </div>

        </div>

        {/* Floating Action Button (Mobile Only) */}
        <button 
          className="fixed bottom-6 right-6 lg:hidden z-30 bg-[#2196F3] text-white p-4 rounded-full shadow-[0_4px_14px_rgba(33,150,243,0.4)] flex items-center justify-center hover:bg-[#1976D2] transition-transform active:scale-95"
          onClick={() => setIsMobileQueueOpen(true)}
        >
          <List size={26} />
        </button>
        
        {/* Custom scrollbar styling scoped to this view */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3F3F46;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #52525B;
          }
          .hidden-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hidden-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .chart-container .recharts-tooltip-wrapper {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.1s ease, visibility 0.1s ease;
            pointer-events: none;
          }
          .chart-container:has(.recharts-bar-rectangle:hover) .recharts-tooltip-wrapper {
            opacity: 1;
            visibility: visible;
          }
          /* Remove accessibility outline/white border on click */
          .recharts-surface:focus, 
          .recharts-wrapper:focus,
          .recharts-bar-rectangle:focus,
          .recharts-rectangle:focus,
          .recharts-sector:focus,
          .recharts-dot:focus,
          .chart-container *:focus {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
          }
          /* Specifically target the SVG and its children */
          .chart-container svg, 
          .chart-container svg * {
            outline: none !important;
            user-select: none;
          }
        `}} />
      </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
  );
};


