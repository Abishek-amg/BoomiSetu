import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, Clock, ChevronRight, Filter } from 'lucide-react';

const OfficerDashboard = () => {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/lands`);
                const data = await res.json();
                setLands(data);
            } catch (err) {
                console.error("Failed to fetch lands", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLands();
    }, []);

    // Simple Risk Logic for Copilot
    const getRiskLevel = (land) => {
        if (land.risk_score > 50 || land.delay_days > 14) return 'High';
        if (land.risk_score > 20 || land.delay_days > 5) return 'Medium';
        return 'Low';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Officer Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage land acquisitions and view AI risk flags</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                        <Filter size={16} /> Filter
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search ID, Owner..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Smart Alerts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={24} />
                        <h3 className="text-lg font-semibold">High Risk Cases</h3>
                    </div>
                    <p className="text-red-100 text-sm mb-4">Requires immediate escalation</p>
                    <div className="text-4xl font-bold">
                        {lands.filter(l => getRiskLevel(l) === 'High').length}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={24} />
                        <h3 className="text-lg font-semibold">Delayed Cases</h3>
                    </div>
                    <p className="text-amber-100 text-sm mb-4">SLA breached &gt; 5 days</p>
                    <div className="text-4xl font-bold">
                        {lands.filter(l => l.delay_days > 5).length}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Search size={24} />
                        <h3 className="text-lg font-semibold">Pending Verification</h3>
                    </div>
                    <p className="text-blue-100 text-sm mb-4">Documents awaiting review</p>
                    <div className="text-4xl font-bold">
                        {lands.filter(l => l.status === 'Document Verification' || l.status === 'Legal Verification').length}
                    </div>
                </div>
            </div>

            {/* Case List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Active Cases</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold">Land ID</th>
                                <th className="px-6 py-4 font-semibold">Owner</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Current Stage</th>
                                <th className="px-6 py-4 font-semibold">AI Risk</th>
                                <th className="px-6 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Loading cases...</td></tr>
                            ) : lands.map((land) => (
                                <tr key={land.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{land.id}</div>
                                        {land.delay_days > 0 && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><Clock size={12}/> Delayed {land.delay_days}d</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{land.owner_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 truncate max-w-[200px]">{land.address}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {land.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRiskLevel(land) === 'High' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                <AlertTriangle size={12} /> High
                                            </span>
                                        ) : getRiskLevel(land) === 'Medium' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Medium
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                Low
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/land/${land.id}`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                            Review <ChevronRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboard;
