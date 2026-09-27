import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    Map as MapIcon, 
    LogOut, 
    Mic,
    Bell,
    Globe
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [language, setLanguage] = useState('EN');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleVoice = () => {
        setIsVoiceActive(!isVoiceActive);
        if (!isVoiceActive) {
            // Mock Voice Activation
            const msg = new SpeechSynthesisUtterance("Voice assistant activated. How can I help you?");
            window.speechSynthesis.speak(msg);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50">
                        B
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        BhoomiSetu
                    </span>
                </div>

                <div className="px-6 pb-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        {user?.role} Portal
                    </div>
                    <div className="text-sm font-medium mt-1 truncate">
                        Welcome, {user?.name}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    
                    {(user?.role === 'Survey Officer' || user?.role === 'Revenue Officer' || user?.role === 'Admin') && (
                        <Link to="/map" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                            <MapIcon size={20} />
                            GIS Map
                        </Link>
                    )}

                    {user?.role === 'Survey Officer' && (
                        <Link to="/capture" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                            <FileText size={20} />
                            Field Data Capture
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <div className="flex-1"></div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleVoice}
                            className={`p-2 rounded-full transition-colors ${isVoiceActive ? 'bg-blue-100 text-blue-600 animate-pulse' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="Toggle Voice Assistant"
                        >
                            <Mic size={20} />
                        </button>
                        
                        <button 
                            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
                            className="flex items-center gap-1 p-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors"
                        >
                            <Globe size={18} />
                            {language}
                        </button>
                        
                        <div className="relative">
                            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                                <Bell size={20} />
                            </button>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50 relative z-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
