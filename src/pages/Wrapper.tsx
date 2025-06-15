import supabase from '@/helpers/supabaseClient';
import React, { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const Wrapper = ({ children }: { children: ReactNode }) => {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setAuthenticated(!!session);
        };

        checkAuth();
    }, []);

    // Show loading while auth status is being determined
    if (authenticated === null) {
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise render the protected children
    return <>{children}</>;
};

export default Wrapper;