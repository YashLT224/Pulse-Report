import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { useDispatch } from 'react-redux';
import Home from '../Screens/Home';
import Staff from '../Screens/Staff';
import ProtectedRoute from './protectedRoute';
import { setUserProfile } from '../Redux/slices/userSlice';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const AppRoutes = () => {
    const { user } = useAuthenticator();
    const dispatch = useDispatch();

    useEffect(() => {
        // Only run the effect if userId exists
        if (user?.userId) {
            const fetchUserProfile = async () => {
                try {
                    const result = await client.models.UserProfile.list({
                        filter: { userId: { eq: user.userId } }
                    });
                    if (result.data && result.data.length > 0) {
                        dispatch(setUserProfile(result.data[0]));
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            };

            fetchUserProfile();
        }
    }, [user?.userId, dispatch]);

    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/staff"
                    element={
                        <ProtectedRoute
                            element={<Staff />}
                            requiredRole="admin"
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default AppRoutes;
