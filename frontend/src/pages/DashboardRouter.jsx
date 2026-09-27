import React from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import OfficerDashboard from './OfficerDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'Citizen' || user?.role === 'Land Owner') {
        return <CitizenDashboard />;
    } else if (user?.role === 'Admin') {
        return <AdminDashboard />;
    } else {
        // Survey Officer, Revenue Officer
        return <OfficerDashboard />;
    }
};

export default DashboardRouter;
