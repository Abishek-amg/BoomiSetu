import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, MapPin, WifiOff, Wifi, Save, UploadCloud } from 'lucide-react';

const FieldCapture = () => {
    const { user } = useAuth();
    const [landId, setLandId] = useState('');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check local storage for pending syncs
        const saved = JSON.parse(localStorage.getItem('bhoomi_offline_data') || '[]');
        setPendingSync(saved.length);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    alert('Error getting location: ' + err.message);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const dataPayload = {
            id: Date.now().toString(),
            landId,
            notes,
            location,
            officerId: user.id,
            timestamp: new Date().toISOString()
        };

        if (isOnline) {
            // Sync immediately
            try {
                await fetch('http://localhost:5000/api/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, data: [dataPayload] })
                });
                alert('Data captured and synced successfully!');
                resetForm();
            } catch (err) {
                saveOffline(dataPayload);
            }
        } else {
            // Save offline
            saveOffline(dataPayload);
        }
    };

    const saveOffline = (payload) => {
        const saved = JSON.parse(localStorage.getItem('bhoomi_offline_data') || '[]');
        saved.push(payload);
        localStorage.setItem('bhoomi_offline_data', JSON.stringify(saved));
        setPendingSync(saved.length);
        alert('Saved offline. Will sync when connection is restored.');
        resetForm();
    };

    const syncPending = async () => {
        if (!isOnline) return;
        
        const saved = JSON.parse(localStorage.getItem('bhoomi_offline_data') || '[]');
        if (saved.length === 0) return;

        try {
            await fetch('http://localhost:5000/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, data: saved })
            });
            localStorage.setItem('bhoomi_offline_data', '[]');
            setPendingSync(0);
            alert('Offline data synced successfully!');
        } catch (err) {
            alert('Failed to sync. Server might be down.');
        }
    };

    const resetForm = () => {
        setLandId('');
        setNotes('');
        setLocation(null);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Field Data Capture</h1>
                    <p className="text-slate-500 mt-1">Record on-site survey details (Offline Capable)</p>
                </div>
                <div className="flex items-center gap-4">
                    {pendingSync > 0 && (
                        <button 
                            onClick={syncPending}
                            disabled={!isOnline}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isOnline ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            <UploadCloud size={18} /> Sync {pendingSync} Pending
                        </button>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        {isOnline ? 'Online' : 'Offline Mode'}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Unified Land ID</label>
                        <input 
                            type="text" 
                            required
                            value={landId}
                            onChange={(e) => setLandId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                            placeholder="e.g. LAND-IND-001"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <Camera size={32} />
                            </div>
                            <span className="font-medium">Capture Geo-Tagged Photo</span>
                            <span className="text-xs text-slate-400 mt-1">Tap to open camera</span>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-600 bg-slate-50">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-500">
                                <MapPin size={32} />
                            </div>
                            {location ? (
                                <div className="text-center">
                                    <div className="font-semibold text-emerald-600 mb-1">GPS Locked</div>
                                    <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">
                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={getLocation}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                                >
                                    Capture GPS Coordinates
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Survey Notes</label>
                        <textarea 
                            rows="4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
                            placeholder="Enter any discrepancies, boundary issues, or physical verification details..."
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover-lift flex justify-center items-center gap-2 text-lg"
                    >
                        <Save size={20} />
                        {isOnline ? 'Submit Survey Data' : 'Save Offline Locally'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FieldCapture;
