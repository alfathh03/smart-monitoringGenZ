import { useState, useRef, useEffect, useCallback } from 'react';
import { Target, Wallet, Scan, TrendingUp, CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, receiptsApi, insightsApi, profilesApi } from '../lib/api';
import { supabase } from '../lib/supabase'; 
import { isToday, format } from 'date-fns';
import clsx from 'clsx';

export default function DailyQuestsMenu() {
  const { activeStyle, isLight } = useTheme() as any;
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [claiming, setClaiming] = useState<number | null>(null);

  const [questProgress, setQuestProgress] = useState({
    manualTx: 0,
    scanReceipt: 0,
    checkInsight: 0
  });

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const [claimedQuests, setClaimedQuests] = useState<number[]>([]);

  // 🔥 PERBAIKAN: Ambil data Misi dari Supabase (Bukan LocalStorage)
  const loadClaimedStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_claim_date, claimed_quests')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile?.last_claim_date === todayKey) {
        setClaimedQuests(profile.claimed_quests || []);
      } else {
        setClaimedQuests([]); 
      }
    } catch (err) {
      console.error("Gagal load status misi dari DB:", err);
    }
  }, [user, todayKey]);

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
      loadClaimedStatus();
    }
  }, [isOpen, checkMissions, loadClaimedStatus]);

  useEffect(() => {
    checkMissions();
    loadClaimedStatus();
  }, [checkMissions, loadClaimedStatus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClaim = async (questId: number, reward: number) => {
    if (!user) return;
    setClaiming(questId);
    try {
      const profile = await profilesApi.get(user.id);
      const currentPoints = profile?.points || 0;

      // 1. Tambah Poin
      await profilesApi.updatePoints(user.id, currentPoints + reward);

      const newClaimed = [...claimedQuests, questId];
      await supabase
        .from('profiles')
        .update({ 
            last_claim_date: todayKey,
            claimed_quests: newClaimed
        })
        .eq('id', user.id);

      setClaimedQuests(newClaimed);
      window.dispatchEvent(new Event('pointsUpdated'));
    } catch (error) {
      console.error("Gagal klaim poin:", error);
    } finally {
      setClaiming(null);
    }
  };

  const DAILY_QUESTS = [
    { id: 1, title: 'Catat Pengeluaran Manual', reward: 10, current: questProgress.manualTx, target: 1, icon: <Wallet className="w-4 h-4" /> },
    { id: 2, title: 'Scan Struk Pertama', reward: 25, current: questProgress.scanReceipt, target: 1, icon: <Scan className="w-4 h-4" /> },
    { id: 3, title: 'Cek Insight Keuangan', reward: 5, current: questProgress.checkInsight, target: 1, icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const activeQuests = DAILY_QUESTS.filter(q => q.current >= q.target && !claimedQuests.includes(q.id)).length;

  return (
    <div className="relative" ref={menuRef}>
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
          {activeQuests > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
          )}
        </div>
      </button>

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
          
          <div className="p-2 space-y-1 max-h-[350px] overflow-y-auto">
            {DAILY_QUESTS.map((quest) => {
              const isCompleted = quest.current >= quest.target;
              const isClaimed = claimedQuests.includes(quest.id);

              return (
                <div key={quest.id} className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl transition-all", 
                  isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/50",
                  isClaimed && "opacity-50" 
                )}>
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-indigo-500/20 text-indigo-500")}>
                    {isClaimed ? <CheckCircle2 className="w-4 h-4" /> : quest.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-sm font-medium truncate", isLight ? "text-slate-800" : "text-white")}>{quest.title}</p>
                    <div className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(quest.current / quest.target) * 100}%` }} />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {isClaimed ? (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Diklaim
                      </span>
                    ) : isCompleted ? (
                      <button 
                        onClick={() => handleClaim(quest.id, quest.reward)}
                        disabled={claiming === quest.id}
                        className={clsx("text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-transform active:scale-95", activeStyle.solidBg, activeStyle.solidText)}
                      >
                        {claiming === quest.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Gift className="w-3 h-3" /> Klaim</>}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-indigo-500">+{quest.reward} Pts</span>
                    )}
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