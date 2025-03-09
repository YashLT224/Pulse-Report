import {Navigate } from 'react-router-dom'
import { useSelector } from "react-redux";
const ProtectedRoute = ({ element, requiredRole }) => {
    const userProfile = useSelector((state) => state.authReducer.userProfile);
    const isLoading = useSelector((state) => state.authReducer.isLoading);
    const Role= userProfile?.role
    
    // Show loading indicator while checking permissions
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    // Allow access if role matches
    if (userProfile && Role === requiredRole) {
      return element;
    }
    
    // Redirect if not authorized
    return <Navigate to="/" replace />;
  };

  export default ProtectedRoute