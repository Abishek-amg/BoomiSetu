import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import LandDetail from './pages/LandDetail';
import FieldCapture from './pages/FieldCapture';
import MapView from './pages/MapView';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<DashboardRouter />} />
                        <Route path="/land/:id" element={<LandDetail />} />
                        
                        <Route 
                            path="/capture" 
                            element={
                                <ProtectedRoute roles={['Survey Officer']}>
                                    <FieldCapture />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/map" 
                            element={
                                <ProtectedRoute roles={['Survey Officer', 'Revenue Officer', 'Admin']}>
                                    <MapView />
                                </ProtectedRoute>
                            } 
                        />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
