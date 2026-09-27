import React, { useEffect, useState } from 'react';
import { BarChart, Users, MapPin, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, delayed: 0 });

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/lands`);
                const data = await res.json();
                
                const completed = data.filter(l => l.status === 'Acquisition Completion').length;
                const active = data.length - completed;
                const delayed = data.filter(l => l.delay_days > 0).length;
                
                setStats({ total: data.length, completed, active, delayed });
            } catch (err) {
                console.error("Failed to fetch", err);
            }
        };
        fetchLands();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
                    <p className="text-slate-500 mt-1">National Land Acquisition Overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <MapPin size={24} />
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Total Parcels</div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <Activity size={24} />
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{stats.active}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Active Acquisitions</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{stats.completed}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Completed</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4">
                        <BarChart size={24} />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{stats.delayed}</div>
                    <div className="text-sm font-medium text-red-500 mt-1">Delayed SLA</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                    <BarChart size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Advanced Analytics Dashboard (Placeholder)</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
