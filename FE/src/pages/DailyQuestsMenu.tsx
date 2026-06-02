import { useState, useRef, useEffect, useCallback } from 'react';
import { Target, Wallet, Scan, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, receiptsApi, insightsApi } from '../lib/api';
import { isToday } from 'date-fns';
import clsx from 'clsx';

export default function DailyQuestsMenu() {
  const { activeStyle, isLight } = useTheme() as any;
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [questProgress, setQuestProgress] = useState({
    manualTx: 0,
    scanReceipt: 0,
    checkInsight: 0
  });

  const checkMissions = useCallback(async () => {
    if (!user) return;
    try {
      const [txRes, receiptRes, insightRes] = await Promise.all([
        transactionsApi.list(user.id),
        receiptsApi.list(user.id),
        insightsApi.list(user.id)
      ]);

      const todayTx = (txRes.data || []).filter((t: any) => isToday(new Date(t.date || t.created_at)));
      const todayReceipts = (receiptRes.data || []).filter((r: any) => isToday(new Date(r.created_at)));
      const todayInsights = (insightRes.data || []).filter((i: any) => isToday(new Date(i.created_at)));

      // Update skor misinya
      setQuestProgress({
        manualTx: todayTx.length > 0 ? 1 : 0,
        scanReceipt: todayReceipts.length > 0 ? 1 : 0, 
        checkInsight: todayInsights.length > 0 ? 1 : 0
      });

    } catch (err) {
      console.error("Gagal memuat progress misi:", err);
    }
  }, [user]);


  useEffect(() => {
    if (isOpen) {
      checkMissions();
    }
  }, [isOpen, checkMissions]);

  useEffect(() => {
    checkMissions();
  }, [checkMissions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const DAILY_QUESTS = [
    { id: 1, title: 'Catat Pengeluaran Manual', reward: 10, current: questProgress.manualTx, target: 1, icon: <Wallet className="w-4 h-4" /> },
    { id: 2, title: 'Scan Struk Pertama', reward: 25, current: questProgress.scanReceipt, target: 1, icon: <Scan className="w-4 h-4" /> },
    { id: 3, title: 'Cek Insight Keuangan', reward: 5, current: questProgress.checkInsight, target: 1, icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const activeQuests = DAILY_QUESTS.filter(q => q.current < q.target).length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Tombol Pemicu di Top Bar */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-105 active:scale-95",
          isLight ? "bg-white border-pink-100 shadow-sm text-pink-500 hover:bg-pink-50" : "bg-slate-800 border-slate-700 text-pink-400 hover:bg-slate-700",
          isOpen && (isLight ? "ring-2 ring-pink-200" : "ring-2 ring-pink-500/50")
        )}
      >
        <div className="relative">
          <Target className="w-5 h-5" />
          {/* Titik merah notifikasi */}
          {activeQuests > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
          )}
        </div>
      </button>

      {/* Kotak Dropdown Misi */}
      {isOpen && (
        <div className={clsx(
          "absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2 duration-200",
          isLight ? "bg-white border-pink-100" : "bg-slate-900 border-slate-700"
        )}>
          <div className={clsx("p-4 border-b flex justify-between items-center", isLight ? "border-pink-50 bg-pink-50/30 rounded-t-2xl" : "border-slate-800 bg-slate-800/50 rounded-t-2xl")}>
            <h3 className={clsx("font-bold flex items-center gap-2", isLight ? "text-slate-800" : "text-white")}>
              <Target className="w-4 h-4 text-pink-500" /> Daily Quests
            </h3>
            <span className={clsx("text-[10px] font-bold px-2 py-1 rounded-full", isLight ? "bg-pink-100 text-pink-600" : "bg-pink-500/20 text-pink-400")}>
              RESET 12AM
            </span>
          </div>
          
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {DAILY_QUESTS.map((quest) => {
              const isCompleted = quest.current >= quest.target;
              return (
                <div key={quest.id} className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl transition-all", 
                  isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/50",
                  isCompleted && "opacity-60" // Meredup kalau sudah selesai
                )}>
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-indigo-500/20 text-indigo-500")}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : quest.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-sm font-medium truncate", isLight ? "text-slate-800" : "text-white")}>{quest.title}</p>
                    <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(quest.current / quest.target) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {/* Teks berubah jadi hijau kalau kelar */}
                    <span className={clsx("text-xs font-bold", isCompleted ? "text-emerald-500" : "text-indigo-500")}>
                      {isCompleted ? 'Selesai!' : `+${quest.reward} Pts`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}