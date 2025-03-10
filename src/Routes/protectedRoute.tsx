import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from '@aws-amplify/ui-react'

const ProtectedRoute = ({ element, requiredRole }) => {
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
    const isLoading = useSelector((state: any) => state.authReducer.isLoading);
    const Role = userProfile?.role;

    // Show loading indicator while checking permissions
    if (isLoading) {
        return <div className='flexCenter'>
        <Loader
        height={'80px'}
        size="large"
        emptyColor="#007aff"
        filledColor="white"
      />
      </div>
    }

    // Allow access if role matches
    if (userProfile && Role === requiredRole) {
        return element;
    }

    // Redirect if not authorized
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
