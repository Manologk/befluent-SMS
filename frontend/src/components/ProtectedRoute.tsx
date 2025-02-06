import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // You might want to show a loading spinner here
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        const redirectPath = `/${user.role.toLowerCase()}panel`;
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};
