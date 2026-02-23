
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AIChatbot from './components/AIChatbot';
import { UserProfile, SchoolItem, Language, ThemeMode, Badge, ItemRequest } from './types';
import { translations } from './lib/translations';
import { 
  onAuthStateChanged,
  onSnapshot, 
  db
} from './lib/firebase';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ALL_BADGES: Badge[] = [
  { id: 'first-give', nameEn: 'First Giver', nameAr: 'شرارة العطاء', icon: '🌟', color: 'bg-amber-400', condition: 'Donate 1 item' },
  { id: 'eco-hero', nameEn: 'Eco Hero', nameAr: 'بطل الاستدامة', icon: '🌿', color: 'bg-emerald-500', condition: 'Donate 5 items' },
  { id: 'top-donor', nameEn: 'Top Donor', nameAr: 'نخبة المعطين', icon: '👑', color: 'bg-blue-500', condition: 'Top 3 on leaderboard' },
  { id: 'ataa-legend', nameEn: 'Ataa Legend', nameAr: 'أسطورة عطاء', icon: '💎', color: 'bg-indigo-600', condition: '1000+ Points' }
];

const SecurityShield: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="glass p-8 md:p-12 squircle-lg shadow-2xl max-w-md w-full text-center space-y-6 border border-rose-500/20">
      <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert size={56} />
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Security Shield</h3>
      <p className="text-slate-500 text-lg leading-relaxed font-medium">{message}</p>
      <button 
        onClick={onClose}
        className="w-full bg-emerald-600 text-white py-4.5 rounded-[20px] font-black text-lg active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
      >
        Dismiss
      </button>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  // Persistent language state even for guests
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ataa_lang');
    return (saved as Language) || 'ar';
  });

  const location = useLocation();
  const navigate = useNavigate();
  
  const language = user?.preferences.language || currentLanguage;
  const theme = user?.preferences.theme || 'system';
  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged({}, (u) => {
      setUser(u);
      if (u?.preferences.language) {
        setCurrentLanguage(u.preferences.language);
      }
      setIsInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubItems = onSnapshot({ collectionName: 'items' }, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as SchoolItem);
      setItems(data);
    }, (err: any) => console.error("Sync error items:", err));
    
    const unsubReqs = onSnapshot({ collectionName: 'requests' }, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => d.data() as ItemRequest);
      setRequests(data);
    }, (err: any) => console.error("Sync error reqs:", err));
    return () => { unsubItems(); unsubReqs(); };
  }, []);

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme(theme);
  }, [theme]);

  // Handle RTL/LTR and Fonts globally
  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('ataa_lang', language);
    
    // Apply appropriate class to body for font-family switching
    document.body.classList.remove('font-arabic', 'font-sans');
    document.body.classList.add(isRTL ? 'font-arabic' : 'font-sans');
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    
    if (user && user.id !== 'guest') {
      const updatedUser = { 
        ...user, 
        preferences: { ...user.preferences, language: newLang as Language } 
      };
      setUser(updatedUser);
      localStorage.setItem('ataa_current_user', JSON.stringify(updatedUser));
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-600 squircle mx-auto animate-bounce flex items-center justify-center shadow-2xl shadow-emerald-500/20">
             <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Initializing Ataa Engine...</p>
        </div>
      </div>
    );
  }

  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen mesh-gradient transition-all duration-700 pb-32 md:pb-0 ${isRTL ? 'rtl' : 'ltr'}`}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="squircle-path" clipPathUnits="objectBoundingBox">
            <path d="M0,0.5 C0,0.1 0.1,0 0.5,0 C0.9,0 1,0.1 1,0.5 C1,0.9 0.9,1 0.5,1 C0.1,1 0,0.9 0,0.5" />
          </clipPath>
          <clipPath id="squircle-lg-path" clipPathUnits="objectBoundingBox">
            <path d="M0,0.5 C0,0.05 0.05,0 0.5,0 C0.95,0 1,0.05 1,0.5 C1,0.95 0.95,1 0.5,1 C0.05,1 0,0.95 0,0.5" />
          </clipPath>
        </defs>
      </svg>
      {securityAlert && <SecurityShield message={securityAlert} onClose={() => setSecurityAlert(null)} />}
      
      <Navbar 
        user={user} 
        theme={theme}
        language={language} 
        toggleLanguage={toggleLanguage} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home user={user || { id: 'guest' } as any} language={language} items={items} />} />
          <Route path="/marketplace" element={<Marketplace items={items.filter(i => i.status === 'approved')} requests={requests} user={user || { id: 'guest' } as any} language={language} theme={theme} onPostRequest={() => {}} />} />
          <Route path="/upload" element={<Upload user={user} language={language} onUpload={() => {}} />} />
          <Route path="/upload/:itemId" element={<Upload user={user} language={language} onUpload={() => {}} items={items} />} />
          <Route path="/settings" element={<Settings user={user} setUser={setUser} theme={theme} setTheme={(mode) => {
            if (user && user.id !== 'guest') {
              const updatedUser = { ...user, preferences: { ...user.preferences, theme: mode } };
              setUser(updatedUser);
              localStorage.setItem('ataa_current_user', JSON.stringify(updatedUser));
            } else {
              // For guests, we can't easily update the 'user' object since it's null/guest
              // but we can update the theme class directly or a local state if needed.
              // However, the component expects a way to change it.
              // Let's ensure the parent knows about the theme change for guests too.
              const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', isDark);
              localStorage.setItem('ataa_theme', mode);
              window.location.reload(); // Refresh to apply to all components
            }
          }} language={language} toggleLanguage={toggleLanguage} />} />
          <Route path="/admin" element={user && user.role === 'Admin' ? <Admin items={items} onApprove={() => {}} onReject={() => {}} language={language} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <AIChatbot language={language} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
    