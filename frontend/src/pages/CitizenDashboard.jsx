import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MapPin, Search, ChevronRight, Activity, Clock, CheckCircle, FileText } from 'lucide-react';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/lands/user/${user.id}`);
                const data = await res.json();
                setLands(data);
            } catch (err) {
                console.error("Failed to fetch lands", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLands();
    }, [user.id]);

    const getStatusColor = (status) => {
        if (status === 'Payment' || status === 'Acquisition Completion') return 'bg-emerald-100 text-emerald-700';
        if (status === 'Legal Verification' || status === 'Approval') return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Properties</h1>
                    <p className="text-slate-500 mt-1">Track land acquisition status and compensation</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Land ID..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading your properties...</div>
            ) : lands.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <MapPin className="mx-auto text-slate-300 mb-3" size={48} />
                    <h3 className="text-lg font-medium text-slate-700">No properties found</h3>
                    <p className="text-slate-500">You don't have any land acquisition records linked to this mobile number.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lands.map((land) => (
                        <Link to={`/land/${land.id}`} key={land.id} className="block group">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover-lift relative overflow-hidden h-full flex flex-col">
                                {/* Decorator */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                        ID: {land.id}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(land.status)}`}>
                                        {land.status}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{land.address}</h3>
                                <p className="text-sm text-slate-500 mb-6 flex-1">{land.area_sqm} sq.m</p>

                                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center text-slate-500 gap-2"><Activity size={16}/> Tracker</span>
                                        <span className="font-medium text-slate-700">Active</span>
                                    </div>
                                    {land.delay_days > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center text-red-500 gap-2"><Clock size={16}/> Delay</span>
                                            <span className="font-medium text-red-600">{land.delay_days} days</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center text-blue-600 font-medium text-sm mt-auto group-hover:text-blue-700 transition-colors">
                                    View Full Details <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CitizenDashboard;
