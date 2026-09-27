import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock checking local storage
        const storedUser = localStorage.getItem('bhoomisetu_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (mobile, otp) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp })
            });
            const data = await res.json();
            
            if (res.ok) {
                setUser(data.user);
                localStorage.setItem('bhoomisetu_user', JSON.stringify(data.user));
                localStorage.setItem('bhoomisetu_token', data.token);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('bhoomisetu_user');
        localStorage.removeItem('bhoomisetu_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
