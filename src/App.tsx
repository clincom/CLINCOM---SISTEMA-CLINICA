/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Search, 
  Bell, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  HelpCircle, 
  Plus, 
  Heart, 
  Moon, 
  Dumbbell, 
  Download, 
  PlayCircle, 
  ShieldCheck, 
  Activity, 
  Stethoscope,
  Video,
  Send,
  MoreVertical,
  CheckCircle2,
  Clock,
  Menu,
  X,
  Trash2,
  TrendingUp,
  Droplets,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';

type Screen = 'landing' | 'login' | 'register' | 'patient-dashboard' | 'doctor-dashboard';

interface UserProfile {
  name: string;
  crm?: string;
  rqe?: string;
  specialty?: string;
  signature?: string; // Data URL of the signature image
}

// Mock Data for Charts
const healthData = [
  { name: 'Seg', bpm: 72, steps: 4000, sleep: 7.2 },
  { name: 'Ter', bpm: 75, steps: 5200, sleep: 6.8 },
  { name: 'Qua', bpm: 70, steps: 6100, sleep: 7.5 },
  { name: 'Qui', bpm: 82, steps: 4800, sleep: 6.2 },
  { name: 'Sex', bpm: 74, steps: 7300, sleep: 8.0 },
  { name: 'Sáb', bpm: 68, steps: 8500, sleep: 8.5 },
  { name: 'Dom', bpm: 72, steps: 5000, sleep: 7.8 },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Visitante',
  });
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile & { role: 'patient' | 'doctor' };
          setUserProfile(profile);
          setRole(profile.role);
          setCurrentScreen(profile.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
        }
      } else {
        setCurrentScreen('landing');
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const goTo = (screen: Screen) => setCurrentScreen(screen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary animate-bounce fill-primary" />
          <p className="font-display font-bold text-primary animate-pulse tracking-widest uppercase text-xs">CLINCOM ®</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && <LandingScreen key="landing" onStart={() => goTo('login')} goTo={goTo} />}
        {currentScreen === 'login' && (
          <LoginScreen 
            key="login" 
            onLogin={(r, profile) => {
              setRole(r);
              if (profile) setUserProfile(profile);
              goTo(r === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
            }} 
            onRegister={() => goTo('register')}
          />
        )}
        {currentScreen === 'register' && (
          <RegisterScreen 
            key="register" 
            onBack={() => goTo('login')} 
            onSuccess={(profile) => {
              setUserProfile(profile);
              goTo('login');
            }} 
          />
        )}
        {(currentScreen === 'patient-dashboard' || currentScreen === 'doctor-dashboard') && (
          <Dashboard 
            key="dashboard" 
            role={role} 
            userProfile={userProfile}
            onLogout={() => goTo('landing')} 
            onToggleRole={() => {
              const newRole = role === 'patient' ? 'doctor' : 'patient';
              setRole(newRole);
              goTo(newRole === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Components ---

const LandingScreen: React.FC<{ onStart: () => void, goTo: (screen: Screen) => void }> = ({ onStart, goTo }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-surface"
    >
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary w-8 h-8" />
          <span className="text-2xl font-display font-extrabold tracking-tighter text-primary">CLINCOM ®</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center font-display font-semibold text-sm">
          <button onClick={() => goTo('landing')} className="text-primary border-b-2 border-primary pb-1">Início</button>
          <button onClick={() => goTo('login')} className="text-on-surface-variant hover:text-primary transition-colors">Dashboard</button>
          <button onClick={() => goTo('register')} className="text-on-surface-variant hover:text-primary transition-colors">Agendamentos</button>
          <button onClick={() => alert('Central de suporte CLINCOM ®: (11) 99999-9999')} className="text-on-surface-variant hover:text-primary transition-colors">Suporte</button>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={onStart} className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all">Relatar Erro</button>
          <button onClick={onStart} className="medical-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Teste Grátis 30 Dias
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center px-8 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-primary font-medium text-xs">
                <ShieldCheck className="w-4 h-4" />
                Tecnologia a serviço do cuidado
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold tracking-tighter text-primary leading-[1.1]">
                Cuidado coordenado <br /> em serenidade
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Transforme a gestão de sua clínica com uma interface editorial pensada para o foco médico e o bem-estar do paciente.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => goTo('login')} className="medical-gradient text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Começar Agora
                </button>
                <button onClick={() => alert('Carregando demonstração interativa...')} className="flex items-center gap-2 px-8 py-4 rounded-xl border border-outline-variant font-bold text-primary hover:bg-surface-container-low transition-all">
                  <PlayCircle className="w-6 h-6" />
                  Ver Demonstração
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoViCWbtct4wPy5noao7PtUAXte4fRbACKEqRYR5TS5fQ5sZoQ0tDISvGVywVfqAQ8UYdcysM3XtJfnKOvUDG_rm6FcTiFenDR3WaMclsrM7EPGYEHJ3IYJTevvqJJy_bn9ZBXEBQWUjt50mSaXtqyuk43TE2KtJOfZoT7YwB5Ebj8KihCdHzPeWfiXOA3GsLva9DApRFP3zRkF_rSy0fzz5jH9n4RiYXh2fB9umNMQQcmsIL3uwIZ8KJbqZaJFZVstmr6uoleFbt0" 
                alt="Clinic Interior" 
                referrerPolicy="no-referrer"
                className="relative rounded-[2.5rem] shadow-2xl object-cover h-[600px] w-full"
              />
              <div className="absolute -bottom-6 -left-6 glass-panel p-6 rounded-2xl shadow-2xl border border-white/40 w-64">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Próximo Paciente</p>
                    <p className="font-bold text-primary text-sm">Dr. Ricardo Oliveira</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%]"></div>
                  </div>
                  <p className="text-[9px] text-outline font-bold tracking-widest uppercase">GESTÃO DE AGENDA 75% OTIMIZADA</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-display font-extrabold text-primary">Eficiência sem ruído visual</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Nossas ferramentas foram desenhadas para reduzir a carga cognitiva, permitindo que você foque no que realmente importa: a saúde.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-low rounded-[2.5rem] p-10 group overflow-hidden flex flex-col justify-between h-[320px]">
              <div className="max-w-md">
                <Users className="text-tertiary w-10 h-10 mb-6" />
                <h3 className="text-2xl font-display font-bold text-primary mb-2">Gestão Inteligente de Pacientes</h3>
                <p className="text-on-surface-variant">Prontuários eletrônicos organizados de forma cronológica e intuitiva. Acesso instantâneo ao histórico completo sem alternar abas.</p>
              </div>
              <div className="h-12 bg-white rounded-t-xl shadow-lg mt-8 transform translate-y-4 group-hover:translate-y-0 transition-transform"></div>
            </div>
            <div className="bg-secondary-container rounded-[2.5rem] p-10 flex flex-col justify-between h-[320px]">
              <Bell className="text-primary w-10 h-10 mb-6" />
              <div>
                <h3 className="text-2xl font-display font-bold text-primary mb-2">Notificações</h3>
                <p className="text-primary/70 text-sm leading-relaxed">Alertas críticos e lembretes de consulta automáticos via WhatsApp e E-mail.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 px-8 border-t border-outline-variant/20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-outline">
        <div className="mb-8 md:mb-0 space-y-2">
          <div className="font-display font-extrabold text-primary text-xl tracking-tighter">CLINCOM ®</div>
          <p>© 2024 CLINCOM ®. Excelência Médica Digital.</p>
        </div>
        <div className="flex gap-8">
          <button onClick={() => alert('Nossa política de privacidade segue padrões HIPAA.')} className="hover:text-primary transition-colors">Privacidade</button>
          <button onClick={() => alert('Termos de uso atualizados em 2024.')} className="hover:text-primary transition-colors">Termos</button>
          <button onClick={() => alert('CLINCOM ®: Líder em tecnologia médica.')} className="hover:text-primary transition-colors">Sobre Nós</button>
          <button onClick={() => alert('Telefone: (11) 99999-0000')} className="hover:text-primary transition-colors">Contato</button>
        </div>
      </footer>
    </motion.div>
  );
}

const LoginScreen: React.FC<{ onLogin: (role: 'patient' | 'doctor', profile?: UserProfile) => void, onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<'patient' | 'doctor'>('patient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile & { role: 'patient' | 'doctor' };
        if (profile.role !== loginRole) {
          alert(`Esta conta está registrada como ${profile.role === 'doctor' ? 'Médico' : 'Paciente'}. Por favor, altere o seletor acima.`);
          await signOut(auth);
          return;
        }
        onLogin(profile.role, profile);
      }
    } catch (err: any) {
      alert('Erro ao entrar: ' + (err.message || 'Verifique suas credenciais.'));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex"
    >
      <div className="hidden lg:block lg:w-7/12 relative h-full">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOVYGR4BVe2NsQpx2EkaEG3iRSRDh8fYEbm8ne0ui13KVjGKd8jvW5UL3keDlHEU6GUO48PeULjWHxO8Ao9rCFIIEdvTCUWBInmAQYWJHHFKe5EfQ8y2crtVrZWzwlstFHmPGaazJiAP6x_FiFFbXLEH19gPGDMVyLpmLA3rlVLMpX2G4700kNym41hQ_ADBnZecsnOVA0fLT8_5MtneOjL3pKaoxYgPQIMTrsjJCF3_snEYJG013wXu8skPoc-8370kB3uFYCl-ZD" 
          alt="Clinic Sanctuary" 
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-multiply"></div>
        <div className="absolute bottom-20 left-20 max-w-lg z-10">
          <h2 className="font-display text-5xl font-extrabold text-white tracking-tighter leading-tight">
            Cuidado coordenado <br /> em serenidade.
          </h2>
          <p className="mt-6 text-white/90 text-lg font-medium max-w-sm">
            Acesse o Portal Clínico para gerenciar agendamentos, registros de pacientes e fluxos de trabalho da clínica com precisão.
          </p>
        </div>
      </div>

      <main className="w-full lg:w-5/12 bg-surface h-full flex flex-col justify-center items-center px-8 relative">
        <div className="absolute top-10 right-10 flex items-center gap-2">
          <Leaf className="text-primary w-6 h-6 fill-primary" />
          <span className="font-display text-xl font-black text-primary tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>CLINCOM ®</span>
        </div>

        <div className="w-full max-w-md space-y-10">
          <header className="space-y-4">
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight">Portal Clínico</h1>
            
            {/* Role Selector */}
            <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10">
              <button 
                onClick={() => setLoginRole('patient')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginRole === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Sou Paciente
              </button>
              <button 
                onClick={() => setLoginRole('doctor')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginRole === 'doctor' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Sou Médico
              </button>
            </div>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface ml-1">
                {loginRole === 'doctor' ? 'E-mail Profissional' : 'E-mail ou CPF'}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-outline-variant" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginRole === 'doctor' ? "clinico@clincom.com.br" : "seuemail@exemplo.com"}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-outline-variant outline-none" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-on-surface">Senha</label>
                <button type="button" onClick={() => alert('Recuperação de conta enviada ao e-mail cadastrado.')} className="text-xs font-bold text-tertiary hover:text-primary transition-colors">Esqueceu a senha?</button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-outline-variant" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-outline-variant outline-none" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-outline-variant hover:text-primary transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-1">
              <input type="checkbox" id="remember" className="w-5 h-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-sm font-medium text-on-surface-variant">Manter conectado por 30 dias</label>
            </div>

            <button type="submit" className="w-full medical-gradient text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2 group">
              Entrar como {loginRole === 'doctor' ? 'Médico' : 'Paciente'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-on-surface-variant font-medium">
              {loginRole === 'doctor' ? 'Novo clínico na CLINCOM ®?' : 'Ainda não possui conta?'} 
              <button onClick={onRegister} className="text-primary font-bold hover:underline underline-offset-4 decoration-2 ml-1 cursor-pointer">
                {loginRole === 'doctor' ? 'Solicitar Acesso' : 'Cadastre-se Agora'}
              </button>
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-outline font-bold opacity-50">
          <span>© 2024 CLINCOM ®</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="hover:text-primary transition-colors">CONFORMIDADE HIPAA</button>
            <button className="hover:text-primary transition-colors">POLÍTICA DE PRIVACIDADE</button>
            <button className="hover:text-primary transition-colors">STATUS DO SISTEMA</button>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

const RegisterScreen: React.FC<{ onBack: () => void, onSuccess: (profile: UserProfile) => void }> = ({ onBack, onSuccess }) => {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [signature, setSignature] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const profile: any = {
        uid: userCredential.user.uid,
        name: formData.get('name') as string,
        role: role,
        email: email,
        phone: formData.get('phone') as string,
        address: `${formData.get('street')}, ${formData.get('number')} - ${formData.get('neighbor')}, ${formData.get('city')}/${formData.get('state')} CEP: ${formData.get('zip')}`,
        createdAt: new Date().toISOString()
      };

      if (role === 'doctor') {
        profile.crm = formData.get('crm') as string;
        profile.rqe = formData.get('rqe') as string;
        profile.specialty = formData.get('specialty') as string;
        profile.signature = signature;
      } else {
        profile.cpf = formData.get('cpf') as string;
        profile.birthDate = formData.get('birthDate') as string;
        profile.vitals = { heartRate: 70, bloodPressure: "12/8", oxygen: 98, temperature: 36.5 };
        profile.reminders = ["Bem-vindo à CLINCOM ®!"];
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), profile);
      onSuccess(profile);
    } catch (err: any) {
      alert('Erro no cadastro: ' + (err.message || 'Erro desconhecido.'));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen flex"
    >
       <section className="hidden lg:flex lg:col-span-5 relative medical-gradient flex-col justify-between p-16 text-white w-[40%]">
        <div className="z-10">
          <div className="flex items-center space-x-3 mb-12 cursor-pointer" onClick={onBack}>
            <Leaf className="text-secondary-container w-10 h-10" />
            <span className="font-display text-3xl font-black tracking-tighter">CLINCOM ®</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6 mt-20">
            Uma abordagem restauradora para a excelência clínica.
          </h1>
          <p className="text-xl text-secondary-container leading-relaxed max-w-md">
            Experimente uma plataforma projetada para clareza, precisão e cuidado centrado no ser humano. Bem-vindo ao seu santuário digital.
          </p>
        </div>
        
        <div className="z-10 pb-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-3xl font-bold text-white">99.9%</span>
              <p className="text-xs text-secondary-container uppercase tracking-widest font-semibold">Disponibilidade</p>
            </div>
            <div className="space-y-2">
              <span className="text-3xl font-bold text-white">256-bit</span>
              <p className="text-xs text-secondary-container uppercase tracking-widest font-semibold">Criptografia AES</p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <img 
            className="w-full h-full object-cover grayscale mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaB-yB2XATi46wuSMsg3sXPIqMzLUr-cu3fqh_IWeaeV9bZgOXf-HF-1teV8DRH94EDIisJ2ypU4ael-dxEbC2dZppxG_fSLzTaWhhEM18UC5Y-rvQfUJAHPbrBVuQ-yLkzbATbl6f-6vN8a6PP_iYi5RNb5OazfWZvLCazdnJHf3wzy5y5NcP7dIxjqrca_0ysWgQNeDTgmjpycAbD3uUiAWWXvN0hVbZZA0F5DPMCI8HGeJQoJV6dgvBa-vuRG9A9QnLvSODkiJs" 
            alt="Clinic Background" 
          />
        </div>
      </section>

      <section className="flex-1 bg-surface flex flex-col items-center p-8 md:p-16 overflow-y-auto w-[60%]">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-[-4px] transition-transform">
              <ArrowRight className="w-5 h-5 rotate-180" />
              Voltar ao Login
            </button>
            <h2 className="text-4xl font-display font-extrabold text-on-surface tracking-tight mb-2">Criar Conta</h2>
            <p className="text-on-surface-variant text-lg">Junte-se à nossa comunidade de profissionais de saúde e pacientes.</p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-primary uppercase tracking-widest block font-display">Selecione seu Perfil</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`p-5 rounded-2xl transition-all border-2 text-center group ${role === 'patient' ? 'bg-secondary-container border-primary' : 'bg-surface-container-low border-transparent hover:border-outline-variant'}`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${role === 'patient' ? 'text-primary' : 'text-outline-variant'}`} />
                  <span className="block font-bold text-on-surface">Paciente</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-tight">Gerenciar minha saúde</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`p-5 rounded-2xl transition-all border-2 text-center group ${role === 'doctor' ? 'bg-secondary-container border-primary' : 'bg-surface-container-low border-transparent hover:border-outline-variant'}`}
                >
                  <Plus className={`w-8 h-8 mx-auto mb-2 ${role === 'doctor' ? 'text-primary' : 'text-outline-variant'}`} />
                  <span className="block font-bold text-on-surface">Médico</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-tight">Gestão de prontuários</span>
                </button>
              </div>
            </div>

            {/* Info Sections */}
            <div className="space-y-8">
              <SectionHeader icon={<Users />} title="Informações Pessoais" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nome Completo" name="name" placeholder="Ex: Maria Silva" />
                <FormField label="Telefone" name="phone" placeholder="(00) 00000-0000" />
                {role === 'doctor' ? (
                  <>
                    <FormField label="Especialidade" name="specialty" placeholder="Ex: Cardiologia" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="CRM" name="crm" placeholder="000000/UF" />
                      <FormField label="RQE (Opcional)" name="rqe" placeholder="00000" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Assinatura Digital (Upload)</label>
                      <div className="w-full h-24 px-4 rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white transition-all relative">
                        {signature ? (
                          <img src={signature} alt="Assinatura" className="h-16 object-contain" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5 text-primary" />
                            <span className="text-xs font-bold text-outline">Anexar imagem da sua assinatura</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </>
                ) : (
                  <FormField label="CPF" name="cpf" placeholder="000.000.000-00" />
                )}
                <FormField label="Data de Nascimento" name="birthDate" type="date" />
              </div>

              <SectionHeader icon={<Leaf />} title="Endereço Completo" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="CEP" name="zip" placeholder="00000-000" />
                <FormField label="Logradouro" name="street" placeholder="Ex: Rua das Flores" colSpan={2} />
                <FormField label="Número" name="number" placeholder="123" />
                <FormField label="Bairro" name="neighbor" placeholder="Ex: Jardim America" />
                <FormField label="Cidade" name="city" placeholder="Ex: São Paulo" />
                <FormField label="Estado" name="state" placeholder="SP" />
              </div>

              <SectionHeader icon={<PlayCircle />} title="Segurança" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="E-mail" name="email" placeholder="contato@exemplo.com" type="email" colSpan={2} />
                <FormField label="Criar Senha" name="password" placeholder="••••••••" type="password" />
                <FormField label="Confirmar Senha" name="confirmPassword" placeholder="••••••••" type="password" />
              </div>
            </div>

            <button type="submit" className="w-full py-5 medical-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              Finalizar Cadastro
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center space-x-2 pb-2 border-b border-outline-variant/20">
      <div className="text-primary w-5 h-5">{icon}</div>
      <h3 className="font-display font-bold text-primary">{title}</h3>
    </div>
  );
}

function FormField({ label, name, placeholder, type = "text", colSpan = 1, options, defaultValue }: { label: string, name?: string, placeholder?: string, type?: string, colSpan?: number, options?: { value: any, label: string }[], defaultValue?: any }) {
  return (
    <div className={`space-y-1.5 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <label className="text-xs font-bold text-on-surface-variant ml-1 uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea 
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full min-h-[100px] p-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-outline-variant outline-none resize-none"
        />
      ) : type === "select" ? (
        <select 
          name={name}
          defaultValue={defaultValue}
          className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
        >
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input 
          name={name}
          type={type} 
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-outline-variant outline-none"
        />
      )}
    </div>
  );
}

const Dashboard: React.FC<{ role: 'patient' | 'doctor', userProfile: UserProfile, onLogout: () => void, onToggleRole: () => void }> = ({ role, userProfile, onLogout, onToggleRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'patients' | 'reminders' | 'documents' | 'calendar' | 'settings' | 'support'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showEditExam, setShowEditExam] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamRequested, setEditExamRequested] = useState('');
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
  const [statusResponsible, setStatusResponsible] = useState('Dr. Julian Vance');
  const [statusObservation, setStatusObservation] = useState('');
  const [tempStatus, setTempStatus] = useState<string>('');
  const [isStatusConfirmed, setIsStatusConfirmed] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [tempVitals, setTempVitals] = useState<any>({ heartRate: '', bloodPressure: '', oxygen: '', temperature: '' });
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editAppDate, setEditAppDate] = useState('');
  const [editAppTime, setEditAppTime] = useState('');
  const [editAppStatus, setEditAppStatus] = useState<any>('Pendente');
  const [isProcedureConfirmed, setIsProcedureConfirmed] = useState(false);

  const availableHours = ["08:00", "09:00", "10:30", "11:00", "14:00", "15:30", "16:00", "17:30"];
  const appointmentStatuses = ["Pendente", "Aprovado", "Recusado", "Cancelado", "Finalizado", "Não Compareceu"];

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [doctorReminders, setDoctorReminders] = useState<any[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to Patients
    const qPatients = query(collection(db, 'users'), where('role', '==', 'patient'));
    const unsubPatients = onSnapshot(qPatients, (snap) => {
      setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Appointments
    const qApps = role === 'doctor' 
      ? collection(db, 'appointments') 
      : query(collection(db, 'appointments'), where('patientId', '==', auth.currentUser.uid));
    const unsubApps = onSnapshot(qApps, (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Documents
    const qDocs = role === 'doctor' 
      ? collection(db, 'documents') 
      : query(collection(db, 'documents'), where('userId', '==', auth.currentUser.uid));
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setDocuments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Doctor Reminders
    if (role === 'doctor') {
      const qRem = query(collection(db, 'doctor_reminders'), where('doctorId', '==', auth.currentUser.uid));
      const unsubRem = onSnapshot(qRem, (snap) => {
        setDoctorReminders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubPatients(); unsubApps(); unsubDocs(); unsubRem(); };
    }

    return () => { unsubPatients(); unsubApps(); unsubDocs(); };
  }, [role]);

  const me = role === 'patient' ? (patients.find(p => p.uid === auth.currentUser?.uid) || patients[0]) : null;

  const addPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatient = {
      id: Date.now(),
      name: formData.get('name') as string,
      age: parseInt(formData.get('age') as string),
      condition: formData.get('condition') as string,
      cpf: formData.get('cpf') as string || '000.000.000-00',
      address: formData.get('address') as string || 'Endereço não informado',
      phone: formData.get('phone') as string || '(00) 00000-0000',
      email: formData.get('email') as string || 'email@exemplo.com',
      status: 'Normal',
      image: `https://picsum.photos/seed/${Date.now()}/100/100`,
      vitals: { 
        heartRate: formData.get('bpm') || 70, 
        bloodPressure: formData.get('pressao') || '12/8', 
        oxygen: formData.get('spo2') || 98, 
        temperature: formData.get('temp') || 36.5 
      },
      reminders: []
    };
    setPatients([...patients, newPatient]);
    setShowAddPatient(false);
    alert('Paciente cadastrado com sucesso!');
  };

  const removePatient = (id: number) => {
    setPatientToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete !== null) {
      try {
        await deleteDoc(doc(db, 'users', patientToDelete.toString()));
        if (selectedPatient?.id === patientToDelete) {
          setShowPatientDetail(false);
          setSelectedPatient(null);
        }
        setShowDeleteConfirm(false);
        setPatientToDelete(null);
      } catch (err) {
        alert('Erro ao excluir paciente.');
      }
    }
  };

  const openPatientDetail = (patient: any) => {
    setSelectedPatient(patient);
    setTempStatus(patient.status);
    setTempVitals(patient.vitals);
    setStatusObservation('');
    setIsStatusConfirmed(false);
    setShowVitalsForm(false);
    setShowPatientDetail(true);
  };

  const updateVitals = async () => {
    if (!selectedPatient) return;
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), { vitals: tempVitals });
      setShowVitalsForm(false);
      alert('Sinais vitais atualizados com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar sinais vitais.');
    }
  };

  const updatePatientStatus = async () => {
    if (!selectedPatient) return;
    if (!statusResponsible.trim()) {
      alert('Por favor, informe o nome do responsável pela alteração.');
      return;
    }
    if (!isStatusConfirmed) {
      alert('Por favor, marque a caixa de confirmação.');
      return;
    }
    
    const updateInfo = {
      by: statusResponsible,
      at: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      reason: statusObservation
    };
    
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), { status: tempStatus, lastStatusUpdate: updateInfo });
      setIsStatusConfirmed(false);
      setStatusObservation('');
      alert('Status atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleRequestAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const formData = new FormData(e.currentTarget);
    const patientFormName = formData.get('patientName') as string;
    
    const newAppointment = {
      patientId: auth.currentUser.uid,
      patientName: patientFormName || (role === 'patient' ? userProfile.name : 'Paciente Solicitante'),
      doctorId: role === 'doctor' ? auth.currentUser.uid : 'SYSTEM_ASSIGNED',
      type: formData.get('type') as string || 'Consulta Geral',
      date: formData.get('date') as string || new Date().toLocaleDateString('pt-BR'),
      time: "A definir",
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };
    
    try {
      await addDoc(collection(db, 'appointments'), newAppointment);
      setShowNewAppointment(false);
      alert('Solicitação de agendamento enviada com sucesso!');
    } catch (err) {
      alert('Erro ao solicitar agendamento.');
    }
  };

  const addPatientReminder = async () => {
    if (!reminderText.trim() || !selectedPatient) return;
    
    const updatedReminders = [...(selectedPatient.reminders || []), reminderText];
    
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), { reminders: updatedReminders });
      setReminderText('');
    } catch (err) {
      alert('Erro ao adicionar lembrete.');
    }
  };

  const removePatientReminder = async (index: number) => {
    if (!selectedPatient) return;
    
    const updatedReminders = selectedPatient.reminders.filter((_: any, i: number) => i !== index);
    
    try {
      await updateDoc(doc(db, 'users', selectedPatient.id), { reminders: updatedReminders });
    } catch (err) {
      alert('Erro ao remover lembrete.');
    }
  };

  const removeDoctorReminder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'doctor_reminders', id));
    } catch (err) {
      alert('Erro ao remover lembrete.');
    }
  };

  const addDoctorReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const formData = new FormData(e.currentTarget);
    const newRem = {
      doctorId: auth.currentUser.uid,
      title: formData.get('title') as string,
      desc: formData.get('desc') as string,
      time: formData.get('time') as string || 'Hoje',
      category: 'Geral',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'doctor_reminders'), newRem);
      (e.target as HTMLFormElement).reset();
      alert('Lembrete adicionado!');
    } catch (err) {
      alert('Erro ao adicionar lembrete clínico.');
    }
  };

  const manageAppointment = async (id: string, status: 'Aprovado' | 'Recusado' | 'Cancelado') => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      alert(`Agendamento ${status} com sucesso!`);
    } catch (err) {
      alert('Erro ao atualizar agendamento.');
    }
  };

  const removeAppointment = async (id: string) => {
    if (confirm('Deseja remover este registro de agendamento permanentemente?')) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
        alert('Registro removido.');
      } catch (err) {
        alert('Erro ao remover agendamento.');
      }
    }
  };

  const openEditAppointment = (app: any) => {
    setSelectedAppointment(app);
    setEditAppDate(app.date);
    setEditAppTime(app.time === "A definir" ? "08:00" : app.time);
    setEditAppStatus(app.status);
    setShowEditAppointment(true);
  };

  const saveAppointmentEdit = async () => {
    if (!selectedAppointment) return;
    try {
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
        date: editAppDate,
        time: editAppTime,
        status: editAppStatus
      });
      setShowEditAppointment(false);
      alert('Agendamento atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao salvar agendamento.');
    }
  };

  const addExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const formData = new FormData(e.currentTarget);
    const requestedExams = formData.get('requestedExams') as string;
    const title = formData.get('title') as string;
    const patientId = formData.get('patientId') as string;
    const patientName = patients.find(p => p.id === patientId)?.name || 'Paciente';
    
    const newExam = {
      userId: patientId,
      title: title,
      meta: `${patientName} • ${requestedExams ? `Exames: ${requestedExams} • ` : ''}${userProfile.name} • ${new Date().toLocaleDateString('pt-BR')}`,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'documents'), newExam);
      setShowAddExam(false);
      alert('Pedido enviado instantaneamente para o portal do paciente!');
    } catch (err) {
      alert('Erro ao criar pedido de exame.');
    }
  };

  const openEditExam = (doc: any) => {
    setSelectedDocument(doc);
    setEditExamTitle(doc.title);
    // Extract requested exams from meta if possible
    const match = doc.meta.match(/Exames: (.*?) •/);
    setEditExamRequested(match ? match[1] : '');
    setShowEditExam(true);
  };

  const saveExamEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDocument) return;
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const requested = formData.get('requestedExams') as string;
    const patientId = formData.get('patientId') as string;
    const patientName = patients.find(p => p.id === patientId)?.name || 'Paciente';

    try {
      await updateDoc(doc(db, 'documents', selectedDocument.id), {
        title,
        userId: patientId,
        meta: `${patientName} • ${requested ? `Exames: ${requested} • ` : ''}${userProfile.name} • ${new Date().toLocaleDateString('pt-BR')}`
      });
      setShowEditExam(false);
      alert('Documento atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao salvar documento.');
    }
  };

  const removeExam = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este exame?')) {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (err) {
        alert('Erro ao excluir documento.');
      }
    }
  };

  const downloadDocPDF = (doc: any) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFillColor(38, 78, 60);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("CLINCOM ®", 105, 25, { align: "center" });
    
    // Content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text(doc.title, 20, 60);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 70);
    pdf.text(`Médico Responsável: ${userProfile.name}`, 20, 78);
    
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 85, 190, 85);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text("Detalhamento da Solicitação:", 20, 100);
    
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(doc.meta, 170);
    pdf.text(splitText, 20, 110);
    
    // Footer - Professional Info
    const footerY = 260;
    pdf.setDrawColor(230, 230, 230);
    pdf.line(40, footerY - 5, 170, footerY - 5);
    
    // Signature
    if (userProfile.signature) {
      try {
        pdf.addImage(userProfile.signature, 'PNG', 85, footerY - 25, 40, 20);
      } catch (e) {
        console.error("Erro ao carregar assinatura", e);
      }
    }

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(userProfile.name, 105, footerY, { align: "center" });
    
    const profDetails = `${userProfile.specialty || ''} - CRM: ${userProfile.crm || 'N/A'}${userProfile.rqe ? ` | RQE: ${userProfile.rqe}` : ''}`;
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(profDetails, 105, footerY + 5, { align: "center" });

    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text("Documento gerado digitalmente por CLINCOM ®", 105, 285, { align: "center" });
    
    pdf.save(`${doc.title.replace(/\s+/g, '_')}_CLINCOM.pdf`);
  };

  return (
    <div className="flex bg-surface min-h-screen">
      {/* Modals */}
      <AnimatePresence>
        {showEditAppointment && selectedAppointment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-primary">Ajustar Agendamento</h3>
                <p className="text-on-surface-variant font-medium">Defina a data e o horário final para o paciente <span className="text-primary font-bold">{selectedAppointment.patientName}</span>.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Data</label>
                    <input 
                      type="date" 
                      value={editAppDate}
                      onChange={(e) => setEditAppDate(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Hora</label>
                    <input 
                      type="time" 
                      value={editAppTime}
                      onChange={(e) => setEditAppTime(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest px-1">Mudar Status do Agendamento</p>
                  <div className="flex flex-wrap gap-2">
                    {appointmentStatuses.map(status => (
                      <button 
                        key={status}
                        onClick={() => setEditAppStatus(status)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider ${editAppStatus === status ? 'medical-gradient text-white shadow-md' : 'bg-surface-container-low text-primary hover:bg-surface-container-high'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest px-1">Opções Disponíveis de Horário</p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableHours.map(hour => (
                      <button 
                        key={hour}
                        onClick={() => setEditAppTime(hour)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${editAppTime === hour ? 'medical-gradient text-white shadow-md' : 'bg-surface-container-low text-primary hover:bg-surface-container-high'}`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowEditAppointment(false)} 
                  className="flex-1 py-4 rounded-2xl border border-outline-variant font-bold text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveAppointmentEdit} 
                  className="flex-1 py-4 medical-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl space-y-8 overflow-y-auto max-h-[90vh]">
              <h3 className="text-3xl font-display font-bold text-primary">Cadastro de Paciente</h3>
              <form onSubmit={addPatient} className="space-y-4">
                <FormField label="Nome Completo" name="name" placeholder="Ex: João da Silva" colSpan={2} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Idade" name="age" type="number" placeholder="Ex: 25" />
                  <FormField label="CPF" name="cpf" placeholder="000.000.000-00" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="E-mail" name="email" type="email" placeholder="email@exemplo.com" />
                  <FormField label="Telefone" name="phone" placeholder="(11) 99999-9999" />
                </div>
                <FormField label="Endereço Completo" name="address" placeholder="Rua, Número, Bairro, Cidade" colSpan={2} />
                <FormField label="Condição Médica / Observação" name="condition" placeholder="Ex: Hipertensão, Diabetes..." colSpan={2} />
                
                <div className="pt-4 border-t border-outline-variant/10">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Sinais Vitais Iniciais</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField label="BPM" name="bpm" placeholder="70" />
                    <FormField label="Pressão" name="pressao" placeholder="12/8" />
                    <FormField label="SPO2 %" name="spo2" placeholder="98" />
                    <FormField label="Temp °C" name="temp" placeholder="36.5" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddPatient(false)} className="flex-1 py-4 rounded-2xl border border-outline-variant font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 medical-gradient text-white rounded-2xl font-bold">Salvar Dados</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showPatientDetail && selectedPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3rem] p-0 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="relative h-48 medical-gradient flex items-center justify-center p-8 text-white">
                <button onClick={() => setShowPatientDetail(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-6">
                  <img src={selectedPatient.image} className="w-24 h-24 rounded-full border-4 border-white/30 shadow-xl object-cover" alt="Patient" />
                  <div>
                    <h3 className="text-3xl font-display font-black tracking-tight">{selectedPatient.name}</h3>
                    <p className="opacity-80 font-medium">{selectedPatient.age} anos • {selectedPatient.condition}</p>
                  </div>
                </div>
              </div>
              <div className="p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">CPF</p>
                    <p className="text-primary font-display font-bold">{selectedPatient.cpf || '123.456.789-00'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-primary font-display font-bold">{selectedPatient.email || 'paciente@exemplo.com'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Telefone</p>
                    <p className="text-primary font-display font-bold">{selectedPatient.phone || '(11) 98888-0000'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Responsável pela Alteração</p>
                    <input 
                      type="text" 
                      value={statusResponsible}
                      onChange={(e) => setStatusResponsible(e.target.value)}
                      placeholder="Nome do responsável"
                      className="w-full px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm mb-4 outline-none font-bold text-primary"
                    />
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Mudar Status</p>
                    <div className="flex gap-2 mb-4">
                      {['Normal', 'Estável', 'Alerta'].map(s => (
                        <button 
                          key={s}
                          onClick={() => { setTempStatus(s); setIsStatusConfirmed(false); }}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${tempStatus === s ? 'medical-gradient text-white shadow-md' : 'bg-surface-container-low text-outline hover:bg-surface-container-high'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {tempStatus !== selectedPatient.status && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Motivo / Observação</p>
                          <textarea 
                            value={statusObservation}
                            onChange={(e) => setStatusObservation(e.target.value)}
                            placeholder="Descreva o motivo desta alteração de status..."
                            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-xs outline-none font-medium text-primary resize-none h-24"
                          />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isStatusConfirmed}
                            onChange={(e) => setIsStatusConfirmed(e.target.checked)}
                            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all"
                          />
                          <span className="text-xs text-outline font-medium group-hover:text-primary transition-colors">
                            Estou ciente e confirmo a alteração para o status <span className="font-bold text-primary">{tempStatus}</span>
                          </span>
                        </label>
                        
                        <button 
                          onClick={updatePatientStatus}
                          disabled={!isStatusConfirmed}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isStatusConfirmed ? 'medical-gradient text-white shadow-lg active:scale-95' : 'bg-surface-container-high text-outline cursor-not-allowed opacity-50'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Concluir Alteração
                        </button>
                      </div>
                    )}
                    {selectedPatient.lastStatusUpdate && (
                      <div className="mt-4 p-4 bg-secondary-container/30 rounded-2xl border border-secondary-container/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Última Atualização</p>
                          <span className="text-[9px] font-bold text-primary/60">{selectedPatient.lastStatusUpdate.at}</span>
                        </div>
                        
                        {selectedPatient.lastStatusUpdate.reason && (
                          <div className="p-3 bg-white/50 rounded-xl border border-primary/5">
                            <p className="text-[10px] font-bold text-primary mb-1">Motivo:</p>
                            <p className="text-[11px] text-primary/80 italic leading-relaxed">"{selectedPatient.lastStatusUpdate.reason}"</p>
                          </div>
                        )}

                        <p className="text-[11px] text-primary/80 font-medium">
                          Alterado por <span className="font-bold underline">{selectedPatient.lastStatusUpdate.by}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Endereço Completo</p>
                  <p className="text-primary font-display font-bold leading-relaxed">{selectedPatient.address || 'Endereço não informado'}</p>
                </div>
                <div className="pt-6 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Sinais Vitais (Tempo Real)</p>
                    <button 
                      onClick={() => setShowVitalsForm(!showVitalsForm)}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                      {showVitalsForm ? 'Cancelar' : 'Atualizar Dados'}
                    </button>
                  </div>

                  {showVitalsForm ? (
                    <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-4 animate-in fade-in zoom-in-95">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-outline uppercase ml-1">Freq. Cardíaca (bpm)</label>
                          <input 
                            type="number" 
                            value={tempVitals.heartRate}
                            onChange={(e) => setTempVitals({...tempVitals, heartRate: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-outline-variant/20 outline-none font-bold text-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-outline uppercase ml-1">Pres. Arterial (mmHg)</label>
                          <input 
                            type="text" 
                            value={tempVitals.bloodPressure}
                            onChange={(e) => setTempVitals({...tempVitals, bloodPressure: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-outline-variant/20 outline-none font-bold text-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-outline uppercase ml-1">Saturação O₂ (%)</label>
                          <input 
                            type="number" 
                            value={tempVitals.oxygen}
                            onChange={(e) => setTempVitals({...tempVitals, oxygen: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-outline-variant/20 outline-none font-bold text-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-outline uppercase ml-1">Temperatura (°C)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={tempVitals.temperature}
                            onChange={(e) => setTempVitals({...tempVitals, temperature: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-outline-variant/20 outline-none font-bold text-primary"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={updateVitals}
                        className="w-full py-3 medical-gradient text-white rounded-xl font-bold text-xs shadow-md"
                      >
                        Salvar Sinais Vitais
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                        <Heart className="w-4 h-4 text-error mb-2" />
                        <p className="text-[9px] font-bold text-outline uppercase">BPM</p>
                        <p className="text-sm font-black text-primary">{selectedPatient.vitals?.heartRate || '--'} <span className="text-[8px] font-medium text-outline">bpm</span></p>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                        <Activity className="w-4 h-4 text-primary mb-2" />
                        <p className="text-[9px] font-bold text-outline uppercase">Pressão</p>
                        <p className="text-sm font-black text-primary">{selectedPatient.vitals?.bloodPressure || '--'} <span className="text-[8px] font-medium text-outline">mmHg</span></p>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                        <Droplets className="w-4 h-4 text-secondary mb-2" />
                        <p className="text-[9px] font-bold text-outline uppercase">SPO2</p>
                        <p className="text-sm font-black text-primary">{selectedPatient.vitals?.oxygen || '--'} <span className="text-[8px] font-medium text-outline">%</span></p>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                        <Zap className="w-4 h-4 text-tertiary mb-2" />
                        <p className="text-[9px] font-bold text-outline uppercase">Temp</p>
                        <p className="text-sm font-black text-primary">{selectedPatient.vitals?.temperature || '--'} <span className="text-[8px] font-medium text-outline">°C</span></p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-display font-bold text-primary">Progresso de Saúde Semanal</h4>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-primary uppercase">
                        <TrendingUp className="w-3 h-3" /> Saudável
                      </div>
                    </div>
                  </div>
                  <div className="h-[250px] w-full bg-surface-container-lowest p-4 rounded-[2rem] border border-outline-variant/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={healthData}>
                        <defs>
                          <linearGradient id="colorBpmModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#264e3c" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#264e3c" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                        <YAxis hide axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Area type="monotone" dataKey="bpm" stroke="#264e3c" strokeWidth={3} fillOpacity={1} fill="url(#colorBpmModal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Patient Specific Reminders */}
                <div className="pt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-display font-bold text-primary">Lembretes para {selectedPatient.name}</h4>
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={reminderText}
                        onChange={(e) => setReminderText(e.target.value)}
                        placeholder="Adicionar novo lembrete individual..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-outline-variant/20 outline-none text-sm font-medium focus:ring-2 focus:ring-primary"
                      />
                      <button 
                        onClick={addPatientReminder}
                        className="px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedPatient.reminders?.length > 0 ? (
                        selectedPatient.reminders.map((rem: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-outline-variant/10 group">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span className="text-sm font-medium text-primary">{rem}</span>
                            </div>
                            <button 
                              onClick={() => removePatientReminder(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-outline text-center py-4 italic">Nenhum lembrete definido para este paciente.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/10 flex flex-wrap gap-4">
                  <button 
                    onClick={() => {
                      setShowPatientDetail(false);
                      setShowNewAppointment(true);
                    }}
                    className="flex-1 min-w-[140px] py-4 bg-secondary text-primary rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" /> Agendar Consulta
                  </button>
                  <button onClick={() => alert('Abrindo chat com o paciente...')} className="flex-1 min-w-[140px] py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Iniciar Chat
                  </button>
                  <button onClick={() => removePatient(selectedPatient.id)} className="px-6 py-4 border border-error/30 text-error rounded-2xl font-bold hover:bg-error/5 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Remover
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-primary/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-display font-black text-primary">Confirmar Exclusão</h4>
                <p className="text-sm text-outline font-medium">Esta ação é irreversível e o paciente será removido permanentemente.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant font-bold text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-error text-white rounded-xl font-bold text-sm"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddExam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl space-y-8">
              <h3 className="text-3xl font-display font-bold text-primary">Solicitar Exame</h3>
              <form onSubmit={addExam} className="space-y-6">
                <div className="space-y-4">
                  <FormField 
                    label="Selecionar Paciente" 
                    name="patientId" 
                    type="select" 
                    options={patients.map(p => ({ value: p.id, label: p.name }))}
                  />
                  <FormField label="Título do Pedido" name="title" placeholder="Ex: Pedido de Exames Laboratoriais" />
                  <FormField 
                    label="Nomes dos Exames Solicitados" 
                    name="requestedExams" 
                    type="textarea" 
                    placeholder="Ex: Hemograma, Glicemia, Colesterol..." 
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Anexar Documento de Referência</label>
                    <div className="w-full h-14 px-4 rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex items-center justify-center gap-2 cursor-pointer hover:bg-white transition-all relative">
                      <Plus className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-outline">Clique para selecionar arquivo</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddExam(false)} className="flex-1 py-4 rounded-2xl border border-outline-variant font-bold text-on-surface-variant">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 medical-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Enviar ao Paciente</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showEditExam && selectedDocument && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl space-y-8">
              <h3 className="text-3xl font-display font-bold text-primary">Alterar Informações</h3>
              <form onSubmit={saveExamEdit} className="space-y-6">
                <div className="space-y-4">
                  <FormField 
                    label="Paciente Responsável" 
                    name="patientId" 
                    type="select" 
                    options={patients.map(p => ({ value: p.id, label: p.name }))}
                  />
                  <FormField label="Título do Pedido" name="title" placeholder="Ex: Pedido de Exames Laboratoriais" />
                  <FormField 
                    label="Nomes dos Exames Solicitados" 
                    name="requestedExams" 
                    type="textarea" 
                    placeholder="Ex: Hemograma, Glicemia, Colesterol..." 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowEditExam(false)} className="flex-1 py-4 rounded-2xl border border-outline-variant font-bold text-on-surface-variant">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 medical-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Salvar Alterações</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* New Appointment Modal Overlay */}
        {showNewAppointment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl space-y-8"
            >
              <form onSubmit={handleRequestAppointment} className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-display font-extrabold text-primary">Agendar Nova Consulta</h3>
                  <p className="text-on-surface-variant">Selecione o profissional e a data desejada para seu atendimento.</p>
                </div>
                <div className="space-y-4">
                  {role === 'doctor' && (
                    <FormField 
                      label="Paciente" 
                      name="patientName" 
                      type="select" 
                      defaultValue={selectedPatient?.name}
                      options={patients.map(p => ({ value: p.name, label: p.name }))} 
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Tipo de Especialidade" name="type" placeholder="Ex: Cardiologia" />
                    <FormField label="Data Preferencial" name="date" type="date" />
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                    <p className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-3">Disponibilidade Imediata</p>
                    <div className="flex items-center gap-3">
                      <img src="https://picsum.photos/seed/doc1/50/50" className="w-10 h-10 rounded-full" alt="Doc" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary">Dr. Julian Vance</p>
                        <p className="text-[10px] text-outline font-medium">Torácica • Disponível às 14:00</p>
                      </div>
                      <button type="button" className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold">Selecionar</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowNewAppointment(false)}
                    className="flex-1 py-4 rounded-2xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 medical-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Confirmar Solicitação
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface-container-low transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-outline-variant/10 flex flex-col p-6`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('overview')}>
            <span className="text-2xl font-display font-bold tracking-tighter text-primary">CLINCOM ®</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-outline">
              {role === 'doctor' ? 'Clinical Portal' : 'Patient Experience'}
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-outline">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<Activity />} label="Painel" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          {role === 'patient' && (
            <NavItem icon={<TrendingUp />} label="Acompanhamento" active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} />
          )}
          {role === 'doctor' && (
            <NavItem icon={<Users />} label="Meus Pacientes" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
          )}
          {role === 'doctor' && (
            <NavItem icon={<Bell />} label="Lembretes" active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} />
          )}
          <NavItem icon={<Calendar />} label="Agenda" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <NavItem icon={<FileText />} label="Documentos" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
          <NavItem icon={<HelpCircle />} label="Suporte" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-4">
          <button 
            onClick={() => setShowNewAppointment(true)}
            className="w-full py-4 medical-gradient text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            {role === 'doctor' ? 'Nova Cirurgia' : 'Nova Consulta'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-2xl shadow-sm cursor-pointer hover:bg-surface-container-lowest transition-colors group" onClick={() => setActiveTab('settings')}>
            <img 
              src={role === 'doctor' ? "https://lh3.googleusercontent.com/aida-public/AB6AXuD-0drOe2ybKDASw4Ja9TytOdMu66jKePeWNckPXj9THIbuPPOnSSLkgsWnX9NIr9nbOC3TDMOW60Uek5DPOeocNCYlw1BOGQfIzfh2RRz5JxVFi9drIVYvxyZJY0vR9RDle8fhQR3nVRwNl0iF7RVsyspknCETa6rrUv7bTGy6-SQ7fSi4V6hm2Se8ELpgieh0TqcJ435WEFvG0peqZbbhd-tCpkEoNTKPBh-_beFtVZNMqcLGiXFNCyZvjq3Fxxyz2GsbKcl6Ew9E" : "https://lh3.googleusercontent.com/aida-public/AB6AXuBiQZw8aL3Ip1mb1Mg1N3ji63kz7oaqxgb9-IYkj1A78cQradTDK_EEJYI7RMcUexeaeJA09PSSI1J4STJ1sLJcQ-ZOh13L4mPeF4CY86ya3nNJheMGtw2buGChGw628JXobICts-nvKgnP-UlVp1AcO_YEVXo_1QJxl5zlTn-dSSpVYw9VWWhYkjiuq3x34vOvSrFIhZCPOkRuCOj1EEoQuilt7nNmN957WMKoPxyCuGXqD1_v51-9quUlzBs3QmLLFa06FGIQB5zp"}
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-primary/10 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm text-primary truncate group-hover:text-primary/70 transition-colors">{role === 'doctor' ? 'Dr. Julian Vance' : 'Paciente Exemplo'}</p>
              {role === 'doctor' && (
                <p className="text-[10px] text-outline font-bold">CRM 123456-SP • RQE 98765</p>
              )}
              <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="text-[10px] text-error mt-1 hover:underline transition-colors font-bold uppercase tracking-wider">Sair do Portal</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-primary">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={role === 'doctor' ? "Buscar prontuários, relatórios ou agendas..." : "Buscar exames, receitas ou agendamentos..."}
                className="w-full bg-surface-container-low border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            <div className="hidden md:flex items-center gap-4">
               <button onClick={() => setActiveTab('overview')} className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              </button>
              <button onClick={() => setActiveTab('support')} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant/20 hidden md:block"></div>
            <div onClick={() => setActiveTab('settings')} className="flex items-center gap-2 cursor-pointer group">
              <span className="text-sm font-bold text-primary font-display group-hover:opacity-80 transition-opacity whitespace-nowrap">
                {role === 'doctor' ? 'Portal Clínico' : 'Meu Espaço'}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-sm">
                {userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-8 space-y-8 max-w-[1400px]">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-4xl font-display font-extrabold tracking-tight text-primary">
              Bem-vindo de volta, {userProfile.name.split(' ')[0]}.
            </h2>
            <p className="text-secondary font-medium mt-1">
              {role === 'doctor' 
                ? 'Você tem 8 consultas e 15 pacientes em acompanhamento ativo.' 
                : 'Sua jornada de recuperação e manutenção da saúde está em dia.'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Content */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Featured Card */}
                  <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/50">
                    <div className="flex-1 space-y-6">
                      <div className="inline-flex px-3 py-1 bg-secondary-container text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {role === 'doctor' ? 'CIRURGIA AGENDADA' : 'CONFIRMAÇÃO URGENTE'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-primary leading-tight">
                          {role === 'doctor' ? 'Procedimento Torácico #882' : 'Consulta Pré-Operatória'}
                        </h3>
                        <div className="mt-3 space-y-1">
                          <p className="text-on-surface-variant flex items-center text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            Terça-feira, 24 de Out • 09:30 AM
                          </p>
                          <p className="text-on-surface-variant flex items-center text-sm font-medium">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            CLINCOM ® Campus Principal, Sala 402
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2">
                        {!isProcedureConfirmed ? (
                          <button onClick={() => setIsProcedureConfirmed(true)} className="medical-gradient text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-md hover:shadow-xl transition-all active:scale-95">
                            Confirmar Procedimento
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-secondary-container text-primary px-6 py-4 rounded-2xl font-bold text-sm">
                            <CheckCircle2 className="w-5 h-5" /> Procedimento Confirmado
                          </div>
                        )}
                        <button onClick={() => setActiveTab('calendar')} className="bg-surface-container-low text-primary px-8 py-4 rounded-2xl font-bold text-sm hover:bg-surface-container-high transition-all">
                          Reagendar
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-64 h-48 rounded-[2rem] overflow-hidden relative group">
                      <img 
                        src="https://picsum.photos/seed/medical-clinic/800/600" 
                        alt="Clinic View" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-primary/10"></div>
                      <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20" onClick={() => setActiveTab('support')}>
                         <PlayCircle className="w-12 h-12 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Recent/Featured Patients (Doctor only) */}
                  {role === 'doctor' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <h3 className="text-xl font-display font-bold text-primary">Atividades Recentes</h3>
                        <button onClick={() => setActiveTab('patients')} className="text-primary text-xs font-bold hover:underline">Ver Todos</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {patients.slice(0, 3).map(p => (
                          <motion.div 
                            key={p.id}
                            whileHover={{ y: -4 }}
                            onClick={() => { setSelectedPatient(p); setShowPatientDetail(true); }}
                            className="bg-white p-5 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <img src={p.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-primary truncate">{p.name}</p>
                                <p className="text-[10px] text-outline font-medium uppercase tracking-tighter">{p.condition}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] bg-surface-container-low p-2 rounded-xl">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                p.status === 'Alerta' ? 'bg-error-container text-error' : 
                                p.status === 'Estável' ? 'bg-secondary-container text-primary' : 
                                'bg-primary-container text-primary'
                              }`}>
                                {p.status}
                              </span>
                              <span className="text-outline-variant font-medium">Há 2 horas</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* My Health Summary (Patient only) */}
                  {role === 'patient' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-display font-bold text-primary">Meus Sinais Vitais</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-primary">
                             <Activity className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Frequência</p>
                            <p className="text-xl font-display font-black text-primary">{me ? me.vitals.heartRate : 0} bpm</p>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-error-container/20 flex items-center justify-center text-error">
                             <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Pressão</p>
                            <p className="text-xl font-display font-black text-primary">{me ? me.vitals.bloodPressure : '0/0'} mmHg</p>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
                             <PlayCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Saturação</p>
                            <p className="text-xl font-display font-black text-primary">{me ? me.vitals.oxygen : 0}%</p>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-warning-container/20 flex items-center justify-center text-warning">
                             <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Temp.</p>
                            <p className="text-xl font-display font-black text-primary">{me ? me.vitals.temperature : 0}°C</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Content */}
                <div className="lg:col-span-4 space-y-8">
                  <section className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-display font-bold text-primary">Lembretes</h3>
                      {role === 'doctor' && (
                        <button onClick={() => setActiveTab('reminders')} className="text-primary text-xs font-bold hover:underline">Gerenciar</button>
                      )}
                    </div>
                    <div className="space-y-8">
                      {role === 'doctor' ? (
                        doctorReminders.slice(0, 3).map(rem => (
                          <div key={rem.id} className="relative group">
                            <ReminderItem 
                              icon={rem.icon} 
                              color={rem.category === 'Exame' ? "text-error" : "text-primary-container"} 
                              title={rem.title} 
                              desc={rem.desc} 
                              time={rem.time} 
                            />
                            <button 
                              onClick={() => removeDoctorReminder(rem.id)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-outline-variant hover:text-error transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        me?.reminders.map((rem: string, idx: number) => (
                          <ReminderItem 
                            key={idx}
                            icon={<CheckCircle2 />} 
                            color="text-primary" 
                            title="Lembrete" 
                            desc={rem} 
                            time="Ativo" 
                          />
                        ))
                      )}
                      {(role === 'doctor' ? doctorReminders.length === 0 : (me?.reminders.length || 0) === 0) && (
                        <p className="text-xs text-outline text-center py-4 italic">Nenhum lembrete pendente.</p>
                      )}
                    </div>
                  </section>

                  {role === 'doctor' && (
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-display font-bold text-primary">Alertas de Pacientes</h3>
                        <button onClick={() => setActiveTab('patients')} className="text-xs font-bold text-primary hover:underline">Ver Todos</button>
                      </div>
                      <div className="space-y-4">
                        <PatientAlert name="Maria Silva" alert="Glicose Elevada" color="bg-error" onClick={() => setActiveTab('patients')} />
                        <PatientAlert name="João Pereira" alert="BPM abaixo do normal" color="bg-warning" onClick={() => setActiveTab('patients')} />
                        <PatientAlert name="Ana Santos" alert="Novo prontuário enviado" color="bg-primary" onClick={() => setActiveTab('patients')} />
                      </div>
                    </section>
                  )}

                  <div className="relative rounded-[2.5rem] overflow-hidden p-8 text-white h-72 flex flex-col justify-end group shadow-xl cursor-pointer" onClick={() => setActiveTab('support')}>
                    <img 
                      src="https://picsum.photos/seed/doc-help/600/600" 
                      alt="Support" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
                    <div className="relative z-10 space-y-3">
                      <h4 className="text-2xl font-display font-bold leading-tight">Suporte Prioritário</h4>
                      <p className="text-sm text-secondary-container/90 font-medium italic">Fale com nossa equipe agora.</p>
                      <button className="bg-white text-primary px-6 py-2.5 rounded-2xl font-bold text-xs shadow-lg hover:bg-secondary-container transition-all">
                        Iniciar Chat
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tracking' && role === 'patient' && (
              <motion.div 
                key="tracking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <MetricDetailCard title="Freq. Cardíaca" value={me ? me.vitals.heartRate.toString() : '0'} unit="bpm" trend="Estável" color="primary" />
                   <MetricDetailCard title="Pressão Arterial" value={me ? me.vitals.bloodPressure : '0/0'} unit="mmHg" trend="Monitorada" color="secondary" />
                   <MetricDetailCard title="Saturação O2" value={me ? me.vitals.oxygen.toString() : '0'} unit="%" trend="Normal" color="tertiary" />
                   <MetricDetailCard title="Temperatura" value={me ? me.vitals.temperature.toString() : '0'} unit="°C" trend="Normal" color="primary" />
                </div>
                
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-3xl font-display font-extrabold text-primary">Análise de Performance</h3>
                      <p className="text-on-surface-variant">Seus dados são coletados via dispositivos sincronizados.</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Semanal</button>
                       <button className="px-4 py-2 bg-surface-container-low text-primary rounded-xl text-xs font-bold border border-outline-variant/10">Mensal</button>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} />
                        <Tooltip contentStyle={{borderRadius: '16px'}} />
                        <Line type="monotone" dataKey="steps" stroke="#264e3c" strokeWidth={5} dot={{ r: 6, fill: '#264e3c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 10 }} />
                        <Line type="monotone" dataKey="bpm" stroke="#ba1a1a" strokeWidth={5} dot={{ r: 6, fill: '#ba1a1a', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'patients' && role === 'doctor' && (
              <motion.div 
                key="patients"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-2xl font-display font-bold text-primary">Acompanhamento Ativo</h3>
                   <div className="flex gap-3">
                     <button className="bg-white border border-outline-variant/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        Filtros <ChevronRight className="w-4 h-4 rotate-90" />
                     </button>
                     <button onClick={() => setShowAddPatient(true)} className="medical-gradient text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                       <Plus className="w-4 h-4" /> Novo Paciente
                     </button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map(patient => (
                    <PatientCard 
                      key={patient.id} 
                      name={patient.name} 
                      age={patient.age} 
                      condition={patient.condition} 
                      status={patient.status} 
                      image={patient.image} 
                      onRemove={() => removePatient(patient.id)}
                      onClick={() => openPatientDetail(patient)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div 
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-display font-bold text-primary">Central de Arquivos</h3>
                  <div className="flex gap-4">
                    {role === 'doctor' && (
                      <button onClick={() => setShowAddExam(true)} className="medical-gradient text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Exame
                      </button>
                    )}
                    <button className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <Download className="w-4 h-4" /> Exportar Relatórios
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(role === 'patient' ? documents.filter(d => d.patientId === me?.id) : documents).map(doc => (
                    <DocItem 
                      key={doc.id} 
                      title={doc.title} 
                      meta={doc.meta} 
                      icon={doc.icon} 
                      status={doc.status} 
                      onRemove={role === 'doctor' ? () => removeExam(doc.id) : undefined}
                      onEdit={role === 'doctor' ? () => openEditExam(doc) : undefined}
                      onDownload={() => downloadDocPDF(doc)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reminders' && (
              <motion.div 
                key="reminders-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-6">
                    <h3 className="text-2xl font-display font-bold text-primary">Novo Lembrete</h3>
                    <form onSubmit={addDoctorReminder} className="space-y-4">
                      <FormField label="Título" name="title" placeholder="Ex: Conferir Exames" />
                      <FormField label="Descrição" name="desc" type="textarea" placeholder="Detalhes do lembrete..." />
                      <FormField label="Prazo/Hora" name="time" placeholder="Ex: Hoje às 18h" />
                      <button type="submit" className="w-full py-4 medical-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Adicionar
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-2xl font-display font-bold text-primary">Meus Lembretes</h3>
                    <span className="text-xs font-bold text-outline uppercase tracking-widest">{doctorReminders.length} Ativos</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorReminders.map(rem => (
                      <div key={rem.id} className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm relative group hover:shadow-md transition-all">
                        <button 
                          onClick={() => removeDoctorReminder(rem.id)}
                          className="absolute top-4 right-4 p-2 text-outline-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ReminderItem 
                          icon={rem.icon} 
                          color="text-primary" 
                          title={rem.title} 
                          desc={rem.desc} 
                          time={rem.time} 
                        />
                      </div>
                    ))}
                    {doctorReminders.length === 0 && (
                      <div className="md:col-span-2 py-20 text-center bg-surface-container-low rounded-[3.5rem] border border-dashed border-outline-variant/30">
                        <p className="text-outline font-display font-bold">Você não possui lembretes no momento.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 space-y-6">
                    <div className="flex justify-between items-center px-2 border-t border-outline-variant/10 pt-8">
                      <h3 className="text-2xl font-display font-bold text-primary">Lembretes de Pacientes</h3>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest leading-loose">Visualização Geral</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patients.filter(p => p.reminders?.length > 0).map(p => (
                        <div key={p.id} className="bg-secondary-container/20 p-6 rounded-[2rem] border border-secondary-container/30 space-y-4">
                          <div className="flex items-center gap-3">
                             <img src={p.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                             <span className="font-bold text-primary text-sm">{p.name}</span>
                          </div>
                          <div className="space-y-2">
                            {p.reminders.map((r: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-primary/70 bg-white/50 p-2 rounded-lg">
                                <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                                {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && role === 'doctor' && (
              <motion.div 
                key="calendar-doctor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-display font-extrabold text-primary">Solicitações de Agendamento</h3>
                    <p className="text-on-surface-variant font-medium">Gerencie as solicitações enviadas pelos seus pacientes.</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="bg-white border border-outline-variant/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        Exportar Agenda <Download className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {appointments.length === 0 ? (
                    <div className="p-20 text-center bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant/30">
                      <p className="text-outline font-display font-bold">Nenhuma solicitação pendente.</p>
                    </div>
                  ) : (
                    appointments.map(app => (
                      <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            app.status === 'Pendente' ? 'bg-secondary-container text-primary' : 
                            app.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Cancelado' ? 'bg-gray-100 text-gray-400' :
                            app.status === 'Finalizado' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Não Compareceu' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary font-display">{app.patientName}</p>
                            <p className="text-xs text-outline font-medium">{app.type} • {app.date} às {app.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 
                            app.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Cancelado' ? 'bg-gray-100 text-gray-500' :
                            app.status === 'Finalizado' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Não Compareceu' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {app.status === 'Pendente' && (
                              <>
                                <button 
                                  onClick={() => manageAppointment(app.id, 'Aprovado')}
                                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/10"
                                  title="Aprovar"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => manageAppointment(app.id, 'Recusado')}
                                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/10"
                                  title="Recusar"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => openEditAppointment(app)}
                              className="p-2 bg-surface-container-high text-primary rounded-xl hover:bg-primary/10 transition-colors"
                              title="Configurar Agendamento"
                            >
                              <Settings className="w-5 h-5" />
                            </button>

                            <button 
                              onClick={() => removeAppointment(app.id)}
                              className="p-2 text-outline-variant hover:text-error transition-colors"
                              title="Remover Registro"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && role === 'patient' && (
              <motion.div 
                key="calendar-patient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[3rem] p-12 border border-outline-variant/10 text-center space-y-6">
                  <div className="w-20 h-20 bg-secondary-container rounded-3xl mx-auto flex items-center justify-center text-primary">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-display font-extrabold text-primary">Central de Agendamentos</h3>
                  <p className="max-w-md mx-auto text-on-surface-variant font-medium">Gerencie suas consultas e solicitações. Você pode cancelar ou solicitar novos horários a qualquer momento.</p>
                  <button onClick={() => setShowNewAppointment(true)} className="medical-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">Nova Solicitação</button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-display font-bold text-primary px-4">Meus Agendamentos</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {(role === 'patient' ? appointments.filter(a => a.patientName === me?.name) : appointments).map(app => (
                      <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            app.status === 'Pendente' ? 'bg-secondary-container text-primary' : 
                            app.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Cancelado' ? 'bg-gray-100 text-gray-400' :
                            app.status === 'Finalizado' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Não Compareceu' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary font-display">{app.type}</p>
                            <p className="text-xs text-outline font-medium">Dr. Julian Vance • {app.date} às {app.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 
                            app.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Cancelado' ? 'bg-gray-100 text-gray-500' :
                            app.status === 'Finalizado' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Não Compareceu' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </div>
                          
                          {app.status !== 'Cancelado' && app.status !== 'Recusado' && (
                            <button 
                              onClick={() => manageAppointment(app.id, 'Cancelado')}
                              className="text-xs font-bold text-error hover:underline uppercase tracking-widest px-4"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'settings' || activeTab === 'support') && (
              <motion.div 
                key="misc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-container-low rounded-[3rem] p-12 border border-outline-variant/10 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
              >
                {activeTab === 'settings' ? <Settings className="w-16 h-16 text-primary/30" /> : <HelpCircle className="w-16 h-16 text-primary/30" />}
                <h3 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">{activeTab === 'settings' ? 'Configurações do Portal' : 'Central de Ajuda'}</h3>
                <p className="text-on-surface-variant max-w-sm">Esta seção em breve trará mais controles sobre sua experiência no CLINCOM ®.</p>
                <button onClick={() => setActiveTab('overview')} className="text-primary font-bold hover:underline">Voltar para o Início</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const PatientCard: React.FC<{ name: string, age: number, condition: string, status: string, image: string, onRemove?: () => void, onClick?: () => void }> = ({ name, age, condition, status, image, onRemove, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-1 relative"
    >
      <div className="flex items-center gap-4 mb-4">
        <img src={image} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/5 shadow-sm" />
        <div>
          <h4 className="font-display font-bold text-primary group-hover:text-primary-container transition-colors">{name}</h4>
          <p className="text-xs text-outline font-medium">{age} anos • {condition}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status === 'Alerta' ? 'bg-error-container text-error animate-pulse' : 'bg-secondary-container text-primary'}`}>
          {status}
        </span>
        <div className="flex items-center gap-2">
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 text-outline-variant hover:text-error transition-colors"
              title="Remover Paciente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

function PatientAlert({ name, alert, color, onClick }: { name: string, alert: string, color: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/5 hover:border-primary/20 cursor-pointer transition-all group">
      <div className={`w-2 h-2 rounded-full ${color} group-hover:scale-125 transition-transform`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-primary truncate group-hover:text-primary-container">{name}</p>
        <p className="text-[10px] text-outline font-medium">{alert}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-outline-variant group-hover:text-primary transition-transform group-hover:translate-x-1" />
    </div>
  );
}

function MetricDetailCard({ title, value, unit, trend, color }: { title: string, value: string, unit: string, trend: string, color: 'primary' | 'secondary' | 'tertiary' }) {
  const colors = {
    primary: 'bg-primary-container text-white',
    secondary: 'bg-secondary-container text-primary',
    tertiary: 'bg-tertiary-container text-white'
  };
  return (
    <div className={`${colors[color]} p-8 rounded-[2.5rem] shadow-lg`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-display font-black tracking-tighter">{value}</span>
        <span className="text-sm font-bold opacity-60">{unit}</span>
      </div>
      <div className="mt-4 inline-flex px-3 py-1 bg-black/10 rounded-full text-[10px] font-bold">
        {trend}
      </div>
    </div>
  );
}

// --- Utils ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-white/50 hover:text-primary font-medium'}`}>
      <div className={active ? 'text-primary' : 'text-outline-variant'}>{icon}</div>
      <span className="font-display tracking-tight">{label}</span>
    </button>
  );
}

function MetricCard({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: string, unit: string, color: string }) {
  return (
    <div className={`${color} p-6 rounded-[2rem] space-y-4 shadow-sm`}>
      <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-display font-black">
          {value} <span className="text-sm font-medium opacity-60">{unit}</span>
        </p>
      </div>
    </div>
  );
}

const DocItem: React.FC<{ 
  title: string, 
  meta: string, 
  icon: React.ReactNode, 
  status?: string, 
  onRemove?: () => void,
  onEdit?: () => void,
  onDownload?: () => void
}> = ({ title, meta, icon, status, onRemove, onEdit, onDownload }) => {
  return (
    <div className="flex items-center p-5 bg-surface-container-low hover:bg-white transition-all rounded-[1.5rem] cursor-pointer group shadow-sm hover:shadow-md border border-transparent hover:border-outline-variant/10">
      <div className="w-12 h-12 rounded-2xl bg-white border border-outline-variant/10 flex items-center justify-center text-primary shadow-inner mr-4 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-primary truncate">{title}</h4>
        <p className="text-xs text-outline font-medium tracking-tight mt-0.5">{meta}</p>
      </div>
      <div className="flex items-center gap-2">
        {status && (
          <span className="px-3 py-1 bg-secondary-container text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mr-2">
            {status}
          </span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 text-outline-variant hover:text-primary transition-colors"
              title="Editar Informações"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 text-outline-variant hover:text-error transition-colors"
              title="Excluir Documento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
          className="p-2 bg-white rounded-xl shadow-sm border border-outline-variant/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
        >
          <Download className="w-4 h-4" /> PDF
        </button>
      </div>
    </div>
  );
};

const ReminderItem: React.FC<{ icon: React.ReactNode, color: string, title: string, desc: string, time: string, faded?: boolean }> = ({ icon, color, title, desc, time, faded = false }) => {
  return (
    <div className={`flex gap-4 ${faded ? 'opacity-50' : ''}`}>
      <div className="relative">
        <div className={`w-1 h-full rounded-full bg-current ${color.split(' ')[1]}`}></div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className={color}>{icon}</div>
          <h5 className="font-display font-bold text-primary text-sm">{title}</h5>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed font-medium">{desc}</p>
        <span className="text-[10px] font-bold uppercase tracking-tighter text-outline mt-2 block">{time}</span>
      </div>
    </div>
  );
}

