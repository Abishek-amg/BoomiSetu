import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
    const [lands, setLands] = useState([]);
    
    useEffect(() => {
        const fetchLands = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/lands`);
                const data = await res.json();
                setLands(data);
            } catch (err) {
                console.error("Failed to fetch lands", err);
            }
        };
        fetchLands();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'Payment' || status === 'Acquisition Completion') return '#10b981'; // emerald
        if (status === 'Legal Verification' || status === 'Approval') return '#f59e0b'; // amber
        return '#3b82f6'; // blue
    };

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-none">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">GIS Land Map</h1>
                    <p className="text-slate-500 mt-1">Geospatial overview of land acquisition parcels</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                        <Layers size={18} /> Satellite View
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
                <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    
                    {lands.map((land) => (
                        <React.Fragment key={land.id}>
                            <Marker position={[land.latitude, land.longitude]}>
                                <Popup>
                                    <div className="font-sans">
                                        <div className="font-bold text-slate-800 text-base">{land.id}</div>
                                        <div className="text-sm text-slate-600 mb-2">{land.address}</div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{backgroundColor: getStatusColor(land.status)}}>
                                                {land.status}
                                            </span>
                                            {land.delay_days > 0 && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                                                    Delayed {land.delay_days}d
                                                </span>
                                            )}
                                        </div>
                                        <Link to={`/land/${land.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                                            View Details &rarr;
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                            <Circle 
                                center={[land.latitude, land.longitude]} 
                                radius={land.area_sqm / 2} // visual representation
                                pathOptions={{ 
                                    color: getStatusColor(land.status), 
                                    fillColor: getStatusColor(land.status), 
                                    fillOpacity: 0.2,
                                    weight: 2
                                }} 
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapView;
