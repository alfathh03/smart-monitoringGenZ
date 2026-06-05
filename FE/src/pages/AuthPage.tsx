import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, TrendingUp, ScanLine, BrainCircuit } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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
    // Jika sukses, Supabase akan otomatis melakukan redirect ke Google
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 font-sans selection:bg-emerald-500/30">
      
      {/* =========================================
          PANEL KIRI - ABOUT / PENJELASAN WEBSITE 
          (Disembunyikan di HP, Muncul di Laptop)
      ========================================= */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-center p-16 xl:p-24 border-r border-slate-800 shadow-2xl">
        {/* Efek Cahaya Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 max-w-xl">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20">
            <Wallet className="w-8 h-8 text-slate-900" />
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight">Smart Budget</h1>
          <h2 className="text-xl font-semibold text-emerald-400 mb-6">Smart Financial Monitoring & Recommendation System for Gen Z</h2>
          
          <p className="text-slate-400 leading-relaxed mb-12 text-lg">
            Platform pencatatan keuangan cerdas yang dirancang khusus untuk menganalisis kebiasaan finansialmu. Tinggalkan pencatatan manual yang membosankan dan biarkan teknologi membantu kesehatan finansialmu.
          </p>

          {/* Fitur Unggulan (Capstone Features) */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-emerald-400 shadow-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Z-Score Anomaly Detection</h3>
                <p className="text-sm text-slate-400">Algoritma statistik yang mendeteksi dan memperingatkanmu saat ada pengeluaran yang bengkak dari kebiasaan normal.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400 shadow-lg">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">AI Receipt Scanner (OCR)</h3>
                <p className="text-sm text-slate-400">Cukup foto struk belanjamu, teknologi Computer Vision akan mengekstrak nominal angka secara otomatis.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-purple-400 shadow-lg">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Google Gemini Insights</h3>
                <p className="text-sm text-slate-400">Dapatkan analisa dan saran keuangan yang dipersonalisasi langsung dari Large Language Model Generative AI.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          PANEL KANAN - FORM LOGIN & REGISTER
      ========================================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-950 overflow-y-auto">
        
        {/* Gambar Ilustrasi Realistis Atas Login (Responsif) */}
        <div className="w-full max-w-md mb-6 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group shrink-0">
          <img
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop"
            alt="Fintech Lifestyle"
            className="w-full h-40 sm:h-48 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Efek Gradient Gelap di atas gambar agar menyatu dengan background */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Teks Logo khusus Mobile yang menimpa gambar agar elegan */}
          <div className="absolute bottom-5 left-0 w-full px-6 flex items-center gap-3 lg:hidden">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
              <Wallet className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">SmartBudget</h1>
              <p className="text-emerald-400 text-xs font-medium drop-shadow-md">Gen Z Fintech Revolution</p>
            </div>
          </div>
        </div>

        {/* Kotak Form */}
        <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl shadow-black/40 relative z-10">
          
          {/* Tab Toggle */}
          <div className="flex mb-8 bg-slate-800/50 rounded-xl p-1.5">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                isLogin ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 scale-100' : 'text-slate-400 hover:text-white scale-95'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                !isLogin ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 scale-100' : 'text-slate-400 hover:text-white scale-95'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="Min. 6 characters"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isLogin ? 'Sign In to Dashboard' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Pemisah */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500 font-medium">Atau masuk dengan</span>
            </div>
          </div>

          {/* Tombol Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full py-3.5 bg-slate-950 border border-slate-800 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Continue with Google
          </button>
        </div>
        
        {/* Footer Credit Diperbarui */}
        <p className="text-center text-xs font-medium text-slate-500 mt-8">
          &copy; {new Date().getFullYear()} Tim Capstone Dicoding
        </p>

      </div>
    </div>
  );
}