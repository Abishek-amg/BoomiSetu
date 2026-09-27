import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, Check, FileCheck, Shield, ChevronRight } from 'lucide-react';

const WORKFLOW_STAGES = [
    'Land Identification',
    'Survey',
    'Ownership Verification',
    'Document Verification',
    'Legal Verification',
    'Approval',
    'Compensation',
    'Payment',
    'Acquisition Completion'
];

const LandDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLandData();
    }, [id]);

    const fetchLandData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/lands/${id}`);
            const data = await res.json();
            setLand(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceStage = async (nextStage) => {
        try {
            await fetch(`http://localhost:5000/api/lands/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStage, userId: user.id })
            });
            fetchLandData(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!land) return <div className="p-8 text-center text-red-500">Land not found</div>;

    const currentStageIndex = WORKFLOW_STAGES.indexOf(land.status);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-mono font-bold tracking-wider">
                                {land.id}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                                {land.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{land.address}</h1>
                        <p className="text-slate-500 text-lg flex items-center gap-2">
                            Owner: <span className="font-semibold text-slate-700">{land.owner_name}</span> 
                            ({land.owner_mobile})
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-slate-500 font-medium">Total Area</div>
                        <div className="text-3xl font-bold text-slate-800">{land.area_sqm} <span className="text-lg font-medium text-slate-500">sq.m</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Stepper */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <ActivityIcon /> Acquisition Pipeline
                        </h2>
                        
                        <div className="space-y-4">
                            {WORKFLOW_STAGES.map((stage, index) => {
                                const isCompleted = index < currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                const isPending = index > currentStageIndex;
                                
                                return (
                                    <div key={stage} className={`flex items-start gap-4 ${isPending ? 'opacity-50' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                                                {isCompleted ? <Check size={16} /> : index + 1}
                                            </div>
                                            {index < WORKFLOW_STAGES.length - 1 && (
                                                <div className={`w-1 h-12 -my-2 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6 pt-1">
                                            <h3 className={`text-lg font-semibold ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>{stage}</h3>
                                            
                                            {isCurrent && (
                                                <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                                                    <span className="text-sm text-blue-800 font-medium">Currently in progress</span>
                                                    {(user.role === 'Revenue Officer' || user.role === 'Admin') && index < WORKFLOW_STAGES.length - 1 && (
                                                        <button 
                                                            onClick={() => handleAdvanceStage(WORKFLOW_STAGES[index + 1])}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            Approve & Advance <ChevronRight size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Docs & Logs */}
                <div className="space-y-6">
                    {/* Documents Vault */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield className="text-blue-500" /> Secure Vault
                        </h2>
                        
                        <div className="space-y-3">
                            {land.documents?.map(doc => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className={`p-2 rounded-lg ${doc.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 truncate">{doc.title}</div>
                                        <div className="text-xs text-slate-500">{doc.type}</div>
                                    </div>
                                    {doc.verified ? (
                                        <CheckCircle size={18} className="text-emerald-500" />
                                    ) : (
                                        <Clock size={18} className="text-amber-500" />
                                    )}
                                </div>
                            ))}
                            {(!land.documents || land.documents.length === 0) && (
                                <div className="text-sm text-slate-500 text-center py-4">No documents uploaded</div>
                            )}
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileCheck className="text-emerald-500" /> Audit Trail
                        </h2>
                        
                        <div className="space-y-4">
                            {land.audit_logs?.map((log, i) => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-300 shrink-0"></div>
                                    <div>
                                        <p className="text-slate-800 font-medium">{log.action}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">by {log.user_name} • {new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {(!land.audit_logs || land.audit_logs.length === 0) && (
                                <div className="text-sm text-slate-500 text-center py-4">No activity yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;

export default LandDetail;
