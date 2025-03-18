import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from '@aws-amplify/ui-react';

const ProtectedRoute = ({
    element,
    requiredRole = null,
    requiredFormId = ''
}) => {
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
    const isLoading = useSelector((state: any) => state.authReducer.isLoading);
    const userProfileRole = userProfile?.role;
    const allowedForms = userProfile?.allowedForms || [];

    // Show loading indicator while checking permissions
    if (isLoading) {
        return (
            <div className="flexCenter">
                <Loader
                    height={'80px'}
                    size="large"
                    emptyColor="#007aff"
                    filledColor="white"
                />
            </div>
        );
    }

    // Allow access if role matches
    if (requiredRole) {
        if (userProfileRole === requiredRole) {
            return element;
        }
    }

    if (requiredFormId) {
        if (allowedForms.includes(requiredFormId)) {
            return element;
        }
    }

    // Redirect if not authorized
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
