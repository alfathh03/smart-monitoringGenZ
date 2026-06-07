import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, TrendingUp, ScanLine, BrainCircuit, ChevronDown } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const loginSectionRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fn = isLogin ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
    } else if (!isLogin) {
      setSuccess('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.');
      setIsLogin(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 font-sans selection:bg-emerald-500/30 overflow-x-hidden text-slate-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col justify-center p-8 lg:p-16 shrink-0 group border-r border-slate-800/50">
          
          <img 
            src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=1000&auto=format&fit=crop" 
            alt="Premium Dark Analytics Background" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-emerald-900/20"></div>

          <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight drop-shadow-md">SmartBudget</span>
          </div>

          <div className="relative z-10 mt-12 lg:mt-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md leading-tight mt-12 lg:mt-0">
              Kelola <span className="text-emerald-400">Keuangan</span><br />Anda dengan Cerdas.
            </h2>
            <p className="text-slate-300 mb-10 max-w-md lg:text-lg drop-shadow-md leading-relaxed">
              Tinggalkan metode pencatatan manual. Sistem analitik terpadu kami hadir untuk membantu Anda merencanakan masa depan finansial yang lebih tertata dan terukur.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToLogin}
                className="lg:hidden group/btn flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white px-6 py-3.5 rounded-full font-bold transition-all w-full shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Mulai Login / Daftar
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={scrollToAbout}
                className="group/btn flex items-center justify-center gap-3 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-white px-6 py-3.5 rounded-full font-medium transition-all w-full sm:w-fit shadow-xl active:scale-95"
              >
                Pelajari Fitur Sistem
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/btn:translate-y-1 transition-transform">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div ref={loginSectionRef} className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative bg-slate-950 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <Wallet className="w-7 h-7 text-slate-900" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
              </h1>
              <p className="text-slate-400 mt-2 font-medium text-sm">
                {isLogin ? 'Selamat datang kembali di SmartBudget' : 'Bergabunglah bersama Gen Z cerdas lainnya'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 pl-1">Alamat Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                    placeholder="anda@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Kata Sandi</label>
                  {isLogin && <a href="#" className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400">Lupa sandi?</a>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-emerald-500/20 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{isLogin ? 'Masuk ke Sistem' : 'Daftar Akun'} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="px-4 bg-slate-950 text-slate-500">atau</span></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm rounded-xl hover:bg-slate-800 transition-all focus:outline-none flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              Lanjutkan dengan Google
            </button>

            <div className="mt-8 text-center text-xs text-slate-400">
              {isLogin ? "Belum memiliki akun? " : "Sudah memiliki akun? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
                className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-4"
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </div>

            <p className="text-center text-[10px] font-medium text-slate-600 mt-10 lg:hidden">
              &copy; {new Date().getFullYear()} Tim Capstone Dicoding
            </p>

          </div>
        </div>
      </div>

      <div ref={aboutSectionRef} className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-3xl mb-16 relative z-10">
          <h2 className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-3">Ikhtisar Sistem</h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">Teknologi di Balik SmartBudget</h3>
          <p className="text-slate-400 lg:text-lg">
            Sistem terintegrasi yang menggabungkan analisis data dan kecerdasan komputasi untuk memberikan kendali penuh atas manajemen keuangan pribadi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Algoritma Z-Score</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sistem pendeteksi anomali berbasis statistik inferensial yang otomatis menganalisis riwayat transaksi dan memberikan peringatan dini saat pengeluaran terdeteksi melampaui batas wajar.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
              <ScanLine className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Pemindai Struk Optik</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Teknologi pengenalan karakter optik (OCR) yang mampu memproses foto struk belanja untuk mengenali dan mengekstrak nominal transaksi secara otomatis.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white mb-3">Analisis Terpersonalisasi</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrasi model bahasa berukuran besar (LLM) untuk menyajikan evaluasi keuangan komprehensif serta rekomendasi yang disesuaikan dengan pola pengeluaran bulanan Anda.
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-16 px-8 py-3 rounded-full border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
        >
          Kembali ke Atas
        </button>
        
        <p className="hidden lg:block text-center text-[10px] font-medium text-slate-600 mt-16">
          &copy; {new Date().getFullYear()} Tim Capstone Dicoding 2026
        </p>
      </div>
    </div>
  );
}