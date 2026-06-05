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

  // Referensi untuk fitur scroll ke bawah
  const aboutSectionRef = useRef<HTMLDivElement>(null);

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
      setSuccess('Account created! Please check your email to verify or sign in.');
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
      
      {/* =========================================
          HERO SECTION (LAYAR TERBELAH 100vh)
      ========================================= */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* --- PANEL KIRI (GAMBAR & TOMBOL ABOUT) --- */}
        <div className="relative w-full lg:w-1/2 h-[40vh] lg:h-screen flex flex-col justify-end p-8 lg:p-16 shrink-0 group">
          {/* Gambar Background Fotografi Realistis */}
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop" 
            alt="Fintech Lifestyle" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Overlay Gradient Gelap biar teks kebaca */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent lg:via-slate-900/40"></div>

          {/* Konten Kiri */}
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
              Kendalikan <span className="text-emerald-400">Finansialmu.</span>
            </h2>
            <p className="text-slate-300 mb-8 max-w-md lg:text-lg drop-shadow-md">
              Generasi Z tidak butuh buku kas manual. Biarkan AI dan analitik cerdas yang bekerja untuk masa depanmu.
            </p>
            
            {/* Tombol Menuju About (Scroll Down) */}
            <button 
              onClick={scrollToAbout}
              className="group/btn flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 w-fit"
            >
              Pelajari Tentang Web Ini
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 group-hover/btn:translate-y-1 transition-transform">
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>


        {/* --- PANEL KANAN (FORM LOGIN MINIMALIS) --- */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-slate-950">
          
          <div className="w-full max-w-md">
            
            {/* Header (Logo & Nama Aplikasi) */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                <Wallet className="w-8 h-8 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight font-serif italic">SmartBudget</h1>
              <p className="text-slate-400 mt-3 font-medium">
                {isLogin ? 'Welcome back to SmartBudget' : 'Create your SmartBudget account'}
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 pl-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  {isLogin && <a href="#" className="text-xs font-medium text-emerald-500 hover:text-emerald-400">Forgot password?</a>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in">
                  {success}
                </div>
              )}

              {/* Tombol Utama */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-white/5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Pemisah "OR" */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-4 bg-slate-950 text-slate-500">or</span></div>
            </div>

            {/* Tombol Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full py-3.5 bg-slate-900/50 border border-slate-800 text-white font-medium rounded-xl hover:bg-slate-800 transition-all focus:outline-none flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>

            {/* Toggler Register / Login ala Gambar Mockup */}
            <div className="mt-10 text-center text-sm text-slate-400">
              {isLogin ? "New to SmartBudget? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
                className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-4"
              >
                {isLogin ? "Create Account" : "Sign In here"}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs font-medium text-slate-600 mt-12">
              &copy; {new Date().getFullYear()} Tim Capstone Dicoding
            </p>

          </div>
        </div>
      </div>


      {/* =========================================
          SECTION ABOUT WEB (TARGET SCROLL)
      ========================================= */}
      <div ref={aboutSectionRef} className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden border-t border-slate-800">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-3xl mb-16 relative z-10">
          <h2 className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-3">Tentang Aplikasi</h2>
          <h3 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">Teknologi Dibalik SmartBudget</h3>
          <p className="text-slate-400 text-lg">
            Sistem cerdas yang mengombinasikan kekuatan Machine Learning, Computer Vision, dan Generative AI untuk menyederhanakan manajemen keuangan pribadimu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
          {/* Card 1 */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Z-Score Algorithm</h4>
            <p className="text-slate-400 leading-relaxed">
              Mesin pendeteksi anomali (outlier) berbasis statistik inferensial yang akan otomatis memberi peringatan saat pengeluaranmu terdeteksi tidak wajar atau melampaui batas normal.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
              <ScanLine className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">AI Receipt Scanner</h4>
            <p className="text-slate-400 leading-relaxed">
              Teknologi OCR (Optical Character Recognition) berbasis model AI dari Hugging Face yang mampu membedah foto struk belanja dan mengekstrak nominal harganya secara otomatis.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Google Gemini Insights</h4>
            <p className="text-slate-400 leading-relaxed">
              Integrasi langsung dengan Large Language Model (LLM) milik Google untuk memberikanmu analisis, nasehat, dan rekomendasi keuangan yang dipersonalisasi layaknya konsultan pribadi.
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-20 px-8 py-3 rounded-full border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Kembali ke Atas
        </button>

      </div>

    </div>
  );
}