import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext'; 
import { receiptsApi, transactionsApi } from '../lib/api';
import type { Receipt } from '../types';
import { Upload, CheckCircle, AlertCircle, Sparkles, Loader2, Camera, Images, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import axios from 'axios'; 
// INI IMPORT YANG PENTING BUAT MUTER GAMBAR:
import imageCompression from 'browser-image-compression'; 

interface ParsedReceipt { 
  merchant: string; 
  total: number; 
  date: string; 
  items: string[]; 
  payment_method: string; 
  image_url?: string; 
}

interface ScannedItem {
  id: string;
  file: File;
  preview: string;
  parsed: ParsedReceipt | null;
  status: 'queued' | 'loading' | 'success' | 'error';
  saved: boolean;
  errorMessage?: string;
}

export default function ScannerPage() {
  const { user } = useAuth();
  const { activeStyle, isLight } = useTheme() as any; 
  
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [modalState, setModalState] = useState<{type: 'success' | 'warning' | 'error', title: string, message: string} | null>(null);
  
  const [isMobile, setIsMobile] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobileCheck = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
    setIsMobile(mobileCheck);
  }, []);

  const fetchReceipts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await receiptsApi.list(user.id);
      setReceipts(res.data || []);
    } catch (err) {}
  }, [user]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // 1. PROSES GAMBAR DULU (Auto-Rotate & Kompresi)
    const processedItems: ScannedItem[] = [];
    
    for (const file of Array.from(files)) {
      try {
       const options: any = {
          maxSizeMB: 1.5, 
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          exifOrientation: true 
        };
        
        const compressedFile = await imageCompression(file, options);
        
        processedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: compressedFile, 
          preview: URL.createObjectURL(compressedFile), 
          status: 'loading',
          parsed: null,
          saved: false
        });
      } catch (error) {
        // Fallback kalau kompresi gagal
        processedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: file,
          preview: URL.createObjectURL(file),
          status: 'loading',
          parsed: null,
          saved: false
        });
      }
    }

    setScannedItems((prev) => [...prev, ...processedItems]);

    // 2. KIRIM KE AI BACKEND
    for (const item of processedItems) {
      try {
        const formData = new FormData();
        formData.append('receiptImage', item.file); 

        let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        BASE_URL = BASE_URL.replace(/\/+$/, ''); 
        
        const response = await axios.post(`${BASE_URL}/api/ocr-receipt`, formData);

        const aiData = response.data;

        setScannedItems((prev) => prev.map(p => p.id === item.id ? {
          ...p,
          status: 'success',
          parsed: { 
            merchant: aiData.merchant_name || 'Tidak Diketahui', 
            total: aiData.total_amount || 0, 
            date: format(new Date(), 'yyyy-MM-dd'), 
            items: [],
            payment_method: aiData.payment_method || 'cash',
            image_url: aiData.receipt_url 
          }
        } : p));

      } catch (error: any) {
        console.error("Gagal scan:", error);
        setScannedItems((prev) => prev.map(p => p.id === item.id ? {
          ...p,
          status: 'error',
          errorMessage: 'Gagal terbaca AI. Struk mungkin buram.'
        } : p));
      }
    }
  };

  const saveTransaction = async (item: ScannedItem) => {
    if (!item.parsed || !user) return;
    
    try {
      await transactionsApi.create({ 
        user_id: user.id, 
        type: 'expense', 
        amount: item.parsed.total, 
        description: item.parsed.merchant, 
        source: item.parsed.payment_method, 
        date: item.parsed.date, 
        is_ocr: true,
        image_url: item.parsed.image_url 
      });

      await receiptsApi.create({
        user_id: user.id,
        merchant_name: item.parsed.merchant,
        total_amount: item.parsed.total,
        image_url: item.parsed.image_url || null,
        ocr_status: 'processed',             
        transaction_date: item.parsed.date     
      });
      
      setScannedItems((prev) => prev.map(p => p.id === item.id ? { ...p, saved: true } : p));
      setModalState({ type: 'success', title: 'Berhasil!', message: `Pengeluaran di ${item.parsed?.merchant} sebesar Rp${item.parsed?.total.toLocaleString('id-ID')} telah dicatat.` });
      
    } catch (err) {
      setModalState({ type: 'error', title: 'Gagal', message: 'Tidak dapat menyimpan transaksi hasil struk.' });
    }
  };

  const removeItem = (id: string) => {
    setScannedItems((prev) => prev.filter(item => item.id !== id));
  };

  if (!activeStyle) return null;

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className={clsx("text-2xl font-bold transition-colors", isLight ? "text-slate-800" : "text-white")}>Smart Receipt Scanner</h1>
        <p className={clsx("text-sm mt-1 transition-colors", isLight ? "text-slate-500" : "text-slate-400")}>
          {isMobile ? "Scan struk pakai kamera atau upload dari galeri!" : "Upload file struk belanja untuk dicatat otomatis!"}
        </p>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const files = e.target.files; if(files) handleFiles(files); e.target.value = ''; }} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = e.target.files; if(files) handleFiles(files); e.target.value = ''; }} />

      <div
        className={clsx(
          'border-2 border-dashed rounded-2xl p-6 text-center transition-all',
          dragActive ? `${activeStyle.activeBorder} ${activeStyle.bg} scale-[1.01]` : isLight ? 'border-pink-200 bg-white' : 'border-slate-700 bg-slate-900'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); const files = e.dataTransfer.files; if(files) handleFiles(files); }}
      >
        <div className="flex justify-center mb-4">
           <Upload className={clsx("w-10 h-10", activeStyle.text)} />
        </div>
        <p className={clsx("font-medium mb-4", isLight ? "text-slate-700" : "text-white")}>
          {isMobile ? "Pilih metode di bawah:" : "Seret struk ke sini, atau klik tombol di bawah:"}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          
          {isMobile && (
            <button onClick={() => cameraRef.current?.click()} className={clsx("flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105", activeStyle.solidBg, activeStyle.solidText)}>
               <Camera className="w-5 h-5" /> Buka Kamera
            </button>
          )}

          <button onClick={() => galleryRef.current?.click()} className={clsx("flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 border-2", isLight ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-slate-700 text-white hover:bg-slate-800")}>
             <Images className="w-5 h-5" /> 
             {isMobile ? "Upload dari Galeri" : "Upload File Struk"}
          </button>

        </div>
      </div>

      {scannedItems.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h3 className={clsx("font-bold text-lg border-b pb-2", isLight ? "text-slate-800 border-slate-200" : "text-white border-slate-700")}>
            Antrean Struk ({scannedItems.length})
          </h3>
          
          {scannedItems.map((item) => (
            <div key={item.id} className={clsx("rounded-2xl border p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden", isLight ? "bg-white border-pink-100 shadow-sm" : `${activeStyle.sidebarBg} border-white/5`)}>
              
              <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-full md:w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center relative">
                {}
                <img src={item.preview} alt="Struk" className="w-full h-full object-contain bg-slate-100 dark:bg-slate-800" />
                {item.status === 'loading' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center flex-col">
                    <Loader2 className={clsx("w-8 h-8 animate-spin mb-2", activeStyle.text)} />
                    <span className="text-white text-xs font-bold">Menganalisis...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {item.status === 'loading' ? (
                   <div className="animate-pulse space-y-3 w-full">
                     <div className="h-4 bg-slate-300/20 rounded w-1/2"></div>
                     <div className="h-4 bg-slate-300/20 rounded w-1/3"></div>
                     <div className="h-8 bg-slate-300/20 rounded w-full mt-4"></div>
                   </div>
                ) : item.status === 'error' ? (
                   <div className="text-red-500">
                     <AlertCircle className="w-8 h-8 mb-2" />
                     <p className="font-bold">Gagal Diproses</p>
                     <p className="text-sm">{item.errorMessage}</p>
                   </div>
                ) : item.parsed ? (
                   <div className="w-full">
                     <div className="space-y-2 mb-4">
                       <div className="flex justify-between border-b border-slate-500/20 pb-1">
                         <span className={isLight ? "text-slate-500 text-sm" : "text-slate-400 text-sm"}>Merchant:</span>
                         <span className={clsx("font-bold text-sm", isLight ? "text-slate-800" : "text-white")}>{item.parsed.merchant}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-500/20 pb-1">
                         <span className={isLight ? "text-slate-500 text-sm" : "text-slate-400 text-sm"}>Total Tagihan:</span>
                         <span className={clsx("font-bold text-sm", isLight ? "text-slate-800" : "text-white")}>Rp {item.parsed.total.toLocaleString('id-ID')}</span>
                       </div>
                     </div>

                     <button onClick={() => saveTransaction(item)} disabled={item.saved} className={clsx("w-full py-2.5 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all", item.saved ? "bg-emerald-500/20 text-emerald-500" : `${activeStyle.solidBg} ${activeStyle.solidText} hover:opacity-90`)}>
                        {item.saved ? <><CheckCircle className="w-4 h-4"/> Tersimpan</> : <><Sparkles className="w-4 h-4"/> Simpan ke Pembukuan</>}
                     </button>
                   </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={clsx("rounded-3xl p-6 max-w-sm w-full shadow-2xl transform transition-all border text-center", isLight ? "bg-white border-pink-100" : "bg-slate-900 border-slate-800")}>
            <div className="flex justify-center mb-4">
              {modalState.type === 'success' && (
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner"><CheckCircle className="w-8 h-8" /></div>
              )}
              {modalState.type === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 shadow-inner"><AlertCircle className="w-8 h-8" /></div>
              )}
            </div>
            <h3 className={clsx("text-xl font-bold mb-2", isLight ? "text-slate-800" : "text-white")}>{modalState.title}</h3>
            <p className={clsx("text-sm mb-6", isLight ? "text-slate-500" : "text-slate-400")}>{modalState.message}</p>
            <button onClick={() => setModalState(null)} className={clsx("w-full py-3 rounded-xl font-bold text-sm transition-transform active:scale-95", activeStyle.solidBg, activeStyle.solidText)}>
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}