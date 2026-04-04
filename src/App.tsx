/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  Mail, 
  Phone, 
  Search, 
  Globe, 
  Users, 
  TrendingUp, 
  Calendar, 
  Layout, 
  ArrowRight, 
  Menu, 
  X,
  CheckCircle2,
  Lock,
  LogOut,
  Trash2,
  ExternalLink,
  Database,
  Zap,
  MessageSquare,
  Clock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/src/lib/utils";
import { 
  db, 
  auth, 
  signInWithGoogle, 
  submitContactForm,
  logBooking,
  handleFirestoreError,
  OperationType
} from "@/src/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocFromServer
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

// --- Constants ---
const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91", name: "India" },
  { code: "+1", label: "🇺🇸 +1", name: "USA/Canada" },
  { code: "+44", label: "🇬🇧 +44", name: "UK" },
  { code: "+971", label: "🇦🇪 +971", name: "UAE" },
  { code: "+61", label: "🇦🇺 +61", name: "Australia" },
  { code: "+65", label: "🇸🇬 +65", name: "Singapore" },
  { code: "+49", label: "🇩🇪 +49", name: "Germany" },
  { code: "+33", label: "🇫🇷 +33", name: "France" },
  { code: "+81", label: "🇯🇵 +81", name: "Japan" },
  { code: "+86", label: "🇨🇳 +86", name: "China" },
  { code: "+7", label: "🇷🇺 +7", name: "Russia" },
  { code: "+55", label: "🇧🇷 +55", name: "Brazil" },
  { code: "+27", label: "🇿🇦 +27", name: "South Africa" },
  { code: "+39", label: "🇮🇹 +39", name: "Italy" },
  { code: "+34", label: "🇪🇸 +34", name: "Spain" },
  { code: "+52", label: "🇲🇽 +52", name: "Mexico" },
  { code: "+62", label: "🇮🇩 +62", name: "Indonesia" },
  { code: "+90", label: "🇹🇷 +90", name: "Turkey" },
  { code: "+82", label: "🇰🇷 +82", name: "South Korea" },
  { code: "+966", label: "🇸🇦 +966", name: "Saudi Arabia" },
  { code: "+20", label: "🇪🇬 +20", name: "Egypt" },
  { code: "+234", label: "🇳🇬 +234", name: "Nigeria" },
  { code: "+92", label: "🇵🇰 +92", name: "Pakistan" },
  { code: "+880", label: "🇧🇩 +880", name: "Bangladesh" },
  { code: "+84", label: "🇻🇳 +84", name: "Vietnam" },
  { code: "+66", label: "🇹🇭 +66", name: "Thailand" },
  { code: "+63", label: "🇵🇭 +63", name: "Philippines" },
  { code: "+60", label: "🇲🇾 +60", name: "Malaysia" },
  { code: "+31", label: "🇳🇱 +31", name: "Netherlands" },
  { code: "+41", label: "🇨🇭 +41", name: "Switzerland" },
  { code: "+46", label: "🇸🇪 +46", name: "Sweden" },
  { code: "+47", label: "🇳🇴 +47", name: "Norway" },
  { code: "+45", label: "🇩🇰 +45", name: "Denmark" },
  { code: "+358", label: "🇫🇮 +358", name: "Finland" },
  { code: "+353", label: "🇮🇪 +353", name: "Ireland" },
  { code: "+32", label: "🇧🇪 +32", name: "Belgium" },
  { code: "+43", label: "🇦🇹 +43", name: "Austria" },
  { code: "+30", label: "🇬🇷 +30", name: "Greece" },
  { code: "+351", label: "🇵🇹 +351", name: "Portugal" },
  { code: "+420", label: "🇨🇿 +420", name: "Czech Republic" },
  { code: "+48", label: "🇵🇱 +48", name: "Poland" },
  { code: "+36", label: "🇭🇺 +36", name: "Hungary" },
  { code: "+40", label: "🇷🇴 +40", name: "Romania" },
  { code: "+380", label: "🇺🇦 +380", name: "Ukraine" },
  { code: "+972", label: "🇮🇱 +972", name: "Israel" },
  { code: "+964", label: "🇮🇶 +964", name: "Iraq" },
  { code: "+98", label: "🇮🇷 +98", name: "Iran" },
  { code: "+93", label: "🇦🇫 +93", name: "Afghanistan" },
  { code: "+94", label: "🇱🇰 +94", name: "Sri Lanka" },
  { code: "+977", label: "🇳🇵 +977", name: "Nepal" },
  { code: "+95", label: "🇲🇲 +95", name: "Myanmar" },
  { code: "+855", label: "🇰🇭 +855", name: "Cambodia" },
  { code: "+856", label: "🇱🇦 +856", name: "Laos" },
  { code: "+960", label: "🇲🇻 +960", name: "Maldives" },
  { code: "+212", label: "🇲🇦 +212", name: "Morocco" },
  { code: "+213", label: "🇩🇿 +213", name: "Algeria" },
  { code: "+216", label: "🇹🇳 +216", name: "Tunisia" },
  { code: "+218", label: "🇱🇾 +218", name: "Libya" },
  { code: "+249", label: "🇸🇩 +249", name: "Sudan" },
  { code: "+251", label: "🇪🇹 +251", name: "Ethiopia" },
  { code: "+254", label: "🇰🇪 +254", name: "Kenya" },
  { code: "+255", label: "🇹🇿 +255", name: "Tanzania" },
  { code: "+256", label: "🇺🇬 +256", name: "Uganda" },
  { code: "+233", label: "🇬🇭 +233", name: "Ghana" },
  { code: "+225", label: "🇨🇮 +225", name: "Ivory Coast" },
  { code: "+221", label: "🇸🇳 +221", name: "Senegal" },
  { code: "+263", label: "🇿🇼 +263", name: "Zimbabwe" },
  { code: "+260", label: "🇿🇲 +260", name: "Zambia" },
  { code: "+258", label: "🇲🇿 +258", name: "Mozambique" },
  { code: "+244", label: "🇦🇴 +244", name: "Angola" },
  { code: "+264", label: "🇳🇦 +264", name: "Namibia" },
  { code: "+267", label: "🇧🇼 +267", name: "Botswana" },
  { code: "+230", label: "🇲🇺 +230", name: "Mauritius" },
  { code: "+54", label: "🇦🇷 +54", name: "Argentina" },
  { code: "+56", label: "🇨🇱 +56", name: "Chile" },
  { code: "+57", label: "🇨🇴 +57", name: "Colombia" },
  { code: "+51", label: "🇵🇪 +51", name: "Peru" },
  { code: "+58", label: "🇻🇪 +58", name: "Venezuela" },
  { code: "+593", label: "🇪🇨 +593", name: "Ecuador" },
  { code: "+591", label: "🇧🇴 +591", name: "Bolivia" },
  { code: "+595", label: "🇵🇾 +595", name: "Paraguay" },
  { code: "+598", label: "🇺🇾 +598", name: "Uruguay" },
  { code: "+506", label: "🇨🇷 +506", name: "Costa Rica" },
  { code: "+507", label: "🇵🇦 +507", name: "Panama" },
  { code: "+502", label: "🇬🇹 +502", name: "Guatemala" },
  { code: "+503", label: "🇸🇻 +503", name: "El Salvador" },
  { code: "+504", label: "🇭🇳 +504", name: "Honduras" },
  { code: "+505", label: "🇳🇮 +505", name: "Nicaragua" },
  { code: "+53", label: "🇨🇺 +53", name: "Cuba" },
  { code: "+1-809", label: "🇩🇴 +1-809", name: "Dominican Republic" },
  { code: "+509", label: "🇭🇹 +509", name: "Haiti" },
  { code: "+1-876", label: "🇯🇲 +1-876", name: "Jamaica" },
  { code: "+1-242", label: "🇧🇸 +1-242", name: "Bahamas" },
  { code: "+1-246", label: "🇧🇧 +1-246", name: "Barbados" },
  { code: "+1-868", label: "🇹🇹 +1-868", name: "Trinidad and Tobago" },
  { code: "+64", label: "🇳🇿 +64", name: "New Zealand" },
  { code: "+679", label: "🇫🇯 +679", name: "Fiji" },
  { code: "+675", label: "🇵🇬 +675", name: "Papua New Guinea" },
];

// --- Types ---
interface ContactFormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  clinicType: string;
  message: string;
}

interface Submission extends ContactFormData {
  id: string;
  createdAt: any;
}

// --- Components ---

const Navbar = ({ onAdminClick, onBookClick, user }: { onAdminClick: () => void, onBookClick: () => void, user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-black/80 backdrop-blur-md border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-2xl font-black tracking-tighter text-brand-white">ASHI</span>
            <div className="h-1.5 w-1.5 bg-brand-gold rounded-full mt-3" />
          </div>
          <div className="hidden lg:flex items-center gap-8 ml-8 border-l pl-8 border-brand-gray">
            <a href="tel:+919877392623" className="text-[11px] font-black hover:text-brand-gold transition-colors uppercase tracking-[0.2em] text-gray-500">+91 98773 92623</a>
            <a href="mailto:ashypyi@gmail.com" className="text-[11px] font-black hover:text-brand-gold transition-colors uppercase tracking-[0.2em] text-gray-500">ashypyi@gmail.com</a>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-[13px] font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold transition-colors">Services</a>
          <a href="#about" className="text-[13px] font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold transition-colors">About</a>
          <a href="#contact" className="text-[13px] font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold transition-colors">Contact</a>
          <button 
            onClick={onBookClick}
            className="px-6 py-2 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all rounded-full"
          >
            Book a Call
          </button>
          <button 
            onClick={onAdminClick}
            className="p-2 text-gray-500 hover:text-brand-white transition-all"
          >
            <Lock size={16} className={user ? "text-brand-gold" : ""} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-brand-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 w-full bg-brand-black border-b border-brand-gray p-8 flex flex-col gap-6 md:hidden shadow-xl"
          >
            <a href="#services" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold">Services</a>
            <a href="#about" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold">About</a>
            <a href="#contact" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-brand-white hover:text-brand-gold">Contact</a>
            <button 
              onClick={() => { onBookClick(); setIsOpen(false); }}
              className="w-full py-4 bg-brand-gold text-black text-sm font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all rounded-full"
            >
              Book a Call
            </button>
            <div className="pt-6 border-t border-brand-gray flex flex-col gap-4">
              <a href="tel:+919877392623" className="text-sm font-bold text-brand-gold">+91 98773 92623</a>
              <a href="mailto:ashypyi@gmail.com" className="text-sm font-bold text-brand-gold">ashypyi@gmail.com</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ServiceCard = ({ icon: Icon, title, description, delay, tag }: { icon: any, title: string, description: string, delay: number, tag?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-10 bg-brand-gray border border-brand-gray rounded-[2.5rem] hover:border-brand-gold/50 hover:shadow-2xl hover:shadow-brand-gold/5 transition-all duration-500 group relative overflow-hidden"
  >
    {tag && (
      <div className="absolute top-6 right-6 px-3 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full">
        {tag}
      </div>
    )}
    <div className="w-14 h-14 bg-brand-black rounded-2xl flex items-center justify-center text-brand-white mb-8 group-hover:bg-brand-gold group-hover:text-black transition-all duration-500">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase leading-none text-brand-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-base font-medium">{description}</p>
    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
      Learn More <ArrowRight size={12} />
    </div>
  </motion.div>
);

const BookingPage = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Backend integration: Listen for Calendly events
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled') {
          console.log("Event Scheduled:", e.data.payload);
          logBooking(e.data.payload);
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-brand-black flex flex-col overflow-y-auto"
    >
      <header className="h-20 bg-brand-black/80 backdrop-blur-md border-b border-brand-gray px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-tighter uppercase">Book a Free Call</span>
          <span className="px-3 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full">20 MINS</span>
        </div>
        <button onClick={onClose} className="p-2 bg-brand-gold text-black rounded-full hover:bg-brand-red hover:text-white transition-all">
          <X size={20} />
        </button>
      </header>

      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
              Let's <span className="text-brand-gold">Connect.</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">
              Select a time that works for you. We'll discuss your clinic's growth and how we can help you retain more patients.
            </p>
          </div>

          <div className="bg-brand-gray rounded-[3rem] border border-brand-gray overflow-hidden shadow-2xl">
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/anmolaujla2702/new-meeting?hide_event_type_details=1&hide_gdpr_banner=1" 
              style={{ minWidth: '320px', height: '700px' }} 
            />
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-brand-gray/50 rounded-3xl border border-brand-gray">
              <Clock className="text-brand-gold mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">20 Minutes</h4>
              <p className="text-xs text-gray-500">Quick discovery call to understand your needs.</p>
            </div>
            <div className="p-8 bg-brand-gray/50 rounded-3xl border border-brand-gray">
              <Zap className="text-brand-gold mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">Strategy First</h4>
              <p className="text-xs text-gray-500">No fluff, just a clear roadmap for your growth.</p>
            </div>
            <div className="p-8 bg-brand-gray/50 rounded-3xl border border-brand-gray">
              <CheckCircle2 className="text-brand-gold mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">Expert Advice</h4>
              <p className="text-xs text-gray-500">Direct conversation with our healthcare marketing experts.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-12 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} ASHI AGENCY • ALL RIGHTS RESERVED
      </footer>
    </motion.div>
  );
};

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is admin (this matches firestore.rules)
        const isAdminEmail = currentUser.email === "anmolaujla2702@gmail.com";
        setIsAdmin(isAdminEmail);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Submission[];
      setSubmissions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "submissions");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    const path = `submissions/${id}`;
    try {
      const confirmed = window.confirm("Are you sure you want to delete this submission? This action cannot be undone.");
      if (confirmed) {
        await deleteDoc(doc(db, "submissions", id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Auth Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain Not Authorized: Please add ${window.location.hostname} to your Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setAuthError(error.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-brand-gray text-brand-gold rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-gray">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 text-brand-white">Admin Access</h2>
          <p className="text-gray-400 mb-8">Please sign in with your authorized Google account to access the dashboard.</p>
          
          {authError && (
            <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red text-sm font-medium">
              {authError}
            </div>
          )}

          <button 
            onClick={handleSignIn}
            disabled={authLoading}
            className={cn(
              "w-full py-4 bg-brand-gold text-black font-bold rounded-2xl hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-3",
              authLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign in with Google"
            )}
          </button>
          <button onClick={onClose} className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-brand-white transition-colors">
            Back to Website
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-red/20">
            <X size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 text-brand-white">Access Denied</h2>
          <p className="text-gray-400 mb-8">Your account is not authorized to view this dashboard.</p>
          <button 
            onClick={() => signOut(auth)}
            className="w-full py-4 bg-brand-gold text-black font-bold rounded-2xl hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-3"
          >
            Sign Out
          </button>
          <button onClick={onClose} className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-brand-white transition-colors">
            Back to Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-brand-black flex flex-col text-brand-white">
      <header className="h-20 bg-brand-gray border-b border-brand-gray px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-tighter">ASHI ADMIN</span>
          <span className="px-3 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full">Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={user.photoURL || ""} alt="User" className="w-8 h-8 rounded-full border border-brand-gold" />
            <span className="text-sm font-bold hidden md:block">{user.displayName}</span>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-gray-400 hover:text-brand-red transition-colors"
          >
            <LogOut size={20} />
          </button>
          <button onClick={onClose} className="p-2 bg-brand-gold text-black rounded-full hover:bg-brand-red hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Submissions</h1>
              <p className="text-gray-400 font-medium">Manage all incoming leads from your website.</p>
            </div>
            <div className="bg-brand-gray px-4 py-2 rounded-xl border border-brand-gray text-sm font-bold text-brand-gold">
              Total: {submissions.length}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center bg-brand-gray rounded-[2rem] border border-dashed border-brand-gray">
              <p className="text-gray-500 font-bold uppercase tracking-widest">No submissions yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {submissions.map((sub) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-gray p-8 rounded-[2rem] border border-brand-gray shadow-sm hover:border-brand-gold/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                          {sub.clinicType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {sub.createdAt?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-brand-white">{sub.name}</h3>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium mb-6">
                        <a href={`mailto:${sub.email}`} className="flex items-center gap-2 hover:text-brand-gold">
                          <Mail size={14} />
                          {sub.email}
                        </a>
                        <a href={`tel:${sub.countryCode}${sub.phone}`} className="flex items-center gap-2 hover:text-brand-gold">
                          <Phone size={14} />
                          {sub.countryCode} {sub.phone}
                        </a>
                      </div>
                      <p className="text-gray-300 leading-relaxed bg-brand-black p-6 rounded-2xl italic border border-brand-gray">
                        "{sub.message}"
                      </p>
                    </div>
                    <div className="flex md:flex-col justify-end gap-3">
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-3 text-gray-500 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                      <a 
                        href={`mailto:${sub.email}`}
                        className="p-3 text-gray-500 hover:text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();
  const [submitted, setSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactForm(data);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-white font-sans selection:bg-brand-gold selection:text-black">
      <Navbar 
        onAdminClick={() => setShowAdmin(true)} 
        onBookClick={() => setShowBooking(true)}
        user={user} 
      />

      <AnimatePresence>
        {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showBooking && <BookingPage onClose={() => setShowBooking(false)} />}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 bg-brand-black pt-24">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl"
          >
            <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.8] mb-12 text-brand-white uppercase">
              We are a <br />
              creative agency <br />
              for <span className="text-brand-gold">healthcare.</span>
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mt-20">
              <p className="text-2xl text-gray-400 max-w-2xl leading-tight font-medium">
                From small local clinics to large corporations, we help <span className="text-brand-gold">Dermatologists</span>, <span className="text-brand-gold">Dentists</span>, and <span className="text-brand-gold">Gynecologists</span> retain their patients through bespoke digital strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <button 
                  onClick={() => setShowBooking(true)}
                  className="px-12 py-6 bg-brand-gold text-black text-sm font-bold uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all flex items-center gap-4 group rounded-full"
                >
                  Book a Call
                  <Calendar size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <a 
                  href="#contact" 
                  className="px-12 py-6 border border-brand-gray text-brand-white text-sm font-bold uppercase tracking-widest hover:bg-brand-gray transition-all flex items-center gap-4 group rounded-full"
                >
                  Get in Touch
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-brand-black border-y border-brand-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-tight mb-8 text-brand-white">
                Working with <span className="text-brand-gold">15+ clinics</span> across India.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-10">
                Our specialized approach ensures that your clinic doesn't just attract new patients, but <span className="text-brand-red font-bold">keeps them</span> for the long term.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-black">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-white">Proven Retention Strategies</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div className="p-10 bg-brand-gray rounded-[2rem] shadow-sm border border-brand-gray">
                <p className="text-6xl font-black text-brand-white mb-4 tracking-tighter">15+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Active Clinics</p>
              </div>
              <div className="p-10 bg-brand-gray rounded-[2rem] shadow-sm border border-brand-gray">
                <p className="text-6xl font-black text-brand-gold mb-4 tracking-tighter">45%</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Avg. Retention Boost</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 px-6 bg-brand-black text-brand-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="aspect-square bg-brand-gray rounded-[3rem] overflow-hidden border border-brand-gray">
                <img 
                  src="https://picsum.photos/seed/healthcare-agency/1000/1000" 
                  alt="Agency" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-gold rounded-[3rem] p-10 flex flex-col justify-end text-black hidden md:flex shadow-2xl">
                <p className="text-5xl font-black tracking-tighter leading-none mb-2">45%</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Avg. Retention Boost</p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-brand-gold mb-8">Who we are</h2>
              <h3 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10 uppercase">
                Bespoke <br />
                <span className="text-brand-gold">strategies</span> <br />
                for growth.
              </h3>
              <p className="text-xl text-gray-400 leading-relaxed font-medium mb-12">
                ASHI is a specialized marketing agency that bridges the gap between clinical excellence and patient loyalty. We don't just build brands; we build relationships that last.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-white mb-4">Our Mission</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">To empower healthcare specialists with data-driven growth.</p>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-white mb-4">Our Vision</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">To become the global standard for patient retention marketing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 px-6 bg-brand-black relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--color-brand-gray) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 mb-32 items-end">
            <div className="max-w-3xl">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-brand-gold mb-6 flex items-center gap-3">
                <Zap size={14} /> Expertise
              </h2>
              <p className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-brand-white uppercase">
                <span className="text-brand-red">No fluff.</span> <br />
                Just <span className="text-brand-gold">Results.</span>
              </p>
            </div>
            <div className="max-w-md">
              <p className="text-xl text-gray-400 font-medium leading-tight mb-8">
                We focus on clear messaging and strategic implementation to turn visitors into customers. No vanity metrics, just growth.
              </p>
              <div className="h-1 w-20 bg-brand-gold" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
            <ServiceCard 
              icon={Users} 
              title="Patient Retention" 
              description="Our specialty. We implement automated systems and loyalty programs that keep your patients coming back for life."
              delay={0.1}
              tag="Core"
            />
            <ServiceCard 
              icon={TrendingUp} 
              title="Marketing Strategy" 
              description="Data-driven marketing plans tailored for dermatologists, dentists, and gynecologists. Clear messaging that converts."
              delay={0.2}
            />
            <ServiceCard 
              icon={Mail} 
              title="Email Marketing" 
              description="Automated patient journeys and newsletters that nurture relationships and drive repeat appointments."
              delay={0.3}
              tag="New"
            />
            <ServiceCard 
              icon={Database} 
              title="CRM Systems" 
              description="Custom CRM setups to manage patient data efficiently and automate follow-ups. Turn visitors into customers."
              delay={0.4}
              tag="New"
            />
            <ServiceCard 
              icon={Search} 
              title="SEO Optimization" 
              description="Dominate local search results. We ensure your clinic is the first one patients find in your area. Results oriented."
              delay={0.5}
            />
            <ServiceCard 
              icon={Instagram} 
              title="Social Presence" 
              description="Building a professional and engaging social presence that builds trust before the first visit."
              delay={0.6}
            />
            <ServiceCard 
              icon={Calendar} 
              title="Plan Campaigns" 
              description="Strategic seasonal and service-specific campaigns to boost appointments during peak times."
              delay={0.7}
            />
            <ServiceCard 
              icon={Layout} 
              title="Website Design" 
              description="High-converting, mobile-first websites designed specifically for healthcare conversion. Clear messaging."
              delay={0.8}
            />
            <ServiceCard 
              icon={MessageSquare} 
              title="Clear Messaging" 
              description="We refine your brand voice to ensure your value proposition is understood instantly by every patient."
              delay={0.9}
            />
          </div>

          {/* Process Section */}
          <div className="border-t border-brand-gray pt-40">
            <div className="mb-24">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-brand-gold mb-6">Our Process</h2>
              <p className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-brand-white uppercase">
                How we <span className="text-brand-red">turn</span> <br />
                visitors into <br />
                <span className="text-brand-gold">customers.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-12">
              {[
                { step: "01", title: "Audit", desc: "We analyze your current digital presence and patient flow." },
                { step: "02", title: "Strategy", desc: "We develop a bespoke plan focused on clear messaging." },
                { step: "03", title: "Execute", desc: "We implement the strategy with zero fluff, just results." },
                { step: "04", title: "Optimize", desc: "We continuously refine to maximize patient retention." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <span className="text-8xl font-black text-brand-gray/30 absolute -top-12 -left-4 z-0">{item.step}</span>
                  <div className="relative z-10">
                    <h4 className="text-xl font-black uppercase mb-4 tracking-tight text-brand-white">{item.title}</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-40 bg-brand-gray rounded-[3rem] p-12 md:p-24 text-center text-brand-white relative overflow-hidden border border-brand-gray"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase leading-none">
                Ready for <br />
                <span className="text-brand-red">real results?</span>
              </h3>
              <p className="text-xl text-gray-400 font-medium mb-12 leading-relaxed">
                Stop settling for vanity metrics. Let's build a strategy that actually turns visitors into loyal patients. No fluff, just growth.
              </p>
              <button 
                onClick={() => setShowBooking(true)}
                className="inline-flex items-center gap-4 px-12 py-6 bg-brand-gold text-black text-sm font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all rounded-full group"
              >
                Book Your Strategy Call
                <Calendar size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-6 bg-brand-black border-t border-brand-gray">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32">
            <div>
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter mb-10 text-brand-white">Contact</h2>
              <p className="text-2xl text-gray-400 mb-16 leading-relaxed font-medium">
                Would you like to get in touch and make some cool stuff with us? 
                Just leave us some details and we'll contact you as soon as we can.
              </p>
              
              <div className="space-y-12">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 rounded-2xl bg-brand-gray flex items-center justify-center text-brand-gold border border-brand-gray">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Email Us</p>
                    <a href="mailto:ashypyi@gmail.com" className="text-2xl font-black hover:text-brand-gold transition-colors tracking-tight text-brand-white">ashypyi@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gray flex items-center justify-center text-brand-gold border border-brand-gray">
                    <Phone size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Call Us</p>
                    <a href="tel:+919877392623" className="text-2xl font-black hover:text-brand-gold transition-colors tracking-tight text-brand-white">+91 98773 92623</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-gray p-12 md:p-16 rounded-[3rem] border border-brand-gray">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-24 h-24 bg-brand-gold text-black rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-4xl font-black tracking-tight mb-4 text-brand-white">Message Sent!</h3>
                  <p className="text-gray-400 font-medium">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Name</label>
                      <input 
                        {...register("name", { required: true })}
                        placeholder="Dr. John Doe"
                        className="w-full px-8 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all font-medium text-brand-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
                      <input 
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                        placeholder="john@clinic.com"
                        className="w-full px-8 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all font-medium text-brand-white"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Phone Number</label>
                      <div className="flex gap-3">
                        <div className="relative w-32 shrink-0">
                          <select 
                            {...register("countryCode", { required: true })}
                            className="w-full px-4 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all font-bold text-xs appearance-none text-brand-white"
                          >
                            {COUNTRY_CODES.map(country => (
                              <option key={country.code} value={country.code}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <ArrowRight size={12} className="rotate-90" />
                          </div>
                        </div>
                        <input 
                          {...register("phone", { required: true })}
                          placeholder="98773 92623"
                          className="flex-1 px-8 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all font-medium text-brand-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Clinic Type</label>
                      <div className="relative">
                        <select 
                          {...register("clinicType")}
                          className="w-full px-8 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all appearance-none font-bold text-sm text-brand-white"
                        >
                          <option value="dermatology">Dermatology</option>
                          <option value="dentistry">Dentistry</option>
                          <option value="gynecology">Gynecology</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <ArrowRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Message</label>
                    <textarea 
                      {...register("message", { required: true })}
                      placeholder="Tell us about your clinic..."
                      rows={5}
                      className="w-full px-8 py-5 bg-brand-black border border-brand-gray rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold transition-all resize-none font-medium text-brand-white"
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-6 bg-brand-gold text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-brand-red hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-black/5"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowRight size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 bg-brand-black text-brand-white border-t border-brand-gray">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
            <div className="max-w-md">
              <span className="text-5xl font-black tracking-tighter mb-8 block">ASHI</span>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                Redefining healthcare marketing through patient-centric growth and retention strategies. Specialized for modern specialists.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-24">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10">Links</h4>
                <ul className="space-y-6">
                  <li><a href="#" className="text-sm font-bold hover:text-brand-gold transition-colors uppercase tracking-widest">Home</a></li>
                  <li><a href="#services" className="text-sm font-bold hover:text-brand-gold transition-colors uppercase tracking-widest">Services</a></li>
                  <li><a href="#contact" className="text-sm font-bold hover:text-brand-gold transition-colors uppercase tracking-widest">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10">Contact</h4>
                <ul className="space-y-6">
                  <li><a href="mailto:ashypyi@gmail.com" className="text-sm font-bold hover:text-brand-gold transition-colors uppercase tracking-widest">Email Us</a></li>
                  <li><a href="tel:+919877392623" className="text-sm font-bold hover:text-brand-gold transition-colors uppercase tracking-widest">+91 98773 92623</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-brand-gray flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
            <p>© 2026 ASHI Agency. All rights reserved.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
