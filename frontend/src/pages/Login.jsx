import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Key, MapPin } from 'lucide-react';

const SEED_ACCOUNTS = [
    { role: 'Citizen', mobile: '9000000001', otp: '1234' },
    { role: 'Land Owner', mobile: '9000000002', otp: '1234' },
    { role: 'Survey Officer', mobile: '9000000003', otp: '1234' },
    { role: 'Revenue Officer', mobile: '9000000004', otp: '1234' },
    { role: 'Admin', mobile: '9000000005', otp: '1234' }
];

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e?.preventDefault();
        setError('');
        setIsLoading(true);
        
        const res = await login(mobile, otp);
        setIsLoading(false);
        
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.error || 'Login failed');
        }
    };

    const fillTestCredentials = (account) => {
        setMobile(account.mobile);
        setOtp(account.otp);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="z-10 w-full max-w-4xl flex flex-col md:flex-row gap-8 px-4">
                
                {/* Brand / Info Section */}
                <div className="flex-1 text-white flex flex-col justify-center animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <MapPin className="text-white" size={24} />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">BhoomiSetu</h1>
                    </div>
                    <p className="text-xl text-slate-300 font-light mb-8 max-w-md">
                        Real-Time National Land Acquisition & Management System
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Shield className="text-blue-400" size={20} />
                            <span>Unified Land Identity</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <Smartphone className="text-emerald-400" size={20} />
                            <span>Transparent Tracking</span>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md">
                    <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Welcome Back</h2>
                        
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
                                    <input 
                                        type="text" 
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter mobile number"
                                        maxLength="10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">OTP</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Key size={18} />
                                    </span>
                                    <input 
                                        type="password" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter 4-digit OTP"
                                        maxLength="4"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover-lift flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Login Securely'}
                            </button>
                        </form>

                        {/* Test Accounts Segment */}
                        <div className="mt-8 pt-6 border-t border-slate-200/60">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="flex-1 h-px bg-slate-200"></span>
                                Test Accounts (Hackathon)
                                <span className="flex-1 h-px bg-slate-200"></span>
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {SEED_ACCOUNTS.map((acc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => fillTestCredentials(acc)}
                                        className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white/50 hover:bg-white hover:border-blue-300 hover:text-blue-700 transition-colors text-slate-600 font-medium text-left truncate"
                                        title={`Login as ${acc.role}`}
                                    >
                                        {acc.role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Login;
