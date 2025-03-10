import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { useDispatch, useSelector } from 'react-redux';
import Home from '../Screens/Home';
import UserList from '../Screens/UserList';
import PendingApprovals from '../Screens/PendingApprovals';
import AddUser from '../Screens/AddUser';
import Alerts from '../Screens/Alerts';
import ProtectedRoute from './protectedRoute';
import { setUserProfile } from '../Redux/slices/userSlice';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const AppRoutes = () => {
    const dispatch = useDispatch();
    const { user } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );

    useEffect(() => {
        if (!user?.userId || userProfile) return;

        const fetchUserProfile = async () => {
            try {
                const result = await client.models.UserProfile.get({
                    userId: user.userId
                });
                if (result.data) {
                    dispatch(setUserProfile(result.data));
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, [user.userId, userProfile, dispatch]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route
                path="/pending-approvals"
                element={
                    <ProtectedRoute
                        element={<PendingApprovals />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/user-list"
                element={
                    <ProtectedRoute
                        element={<UserList />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/add-user"
                element={
                    <ProtectedRoute
                        element={<AddUser />}
                        requiredRole="admin"
                    />
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
