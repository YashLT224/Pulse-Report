import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { useDispatch } from 'react-redux';
import Home from '../Screens/Home';
import UserList from '../Screens/UserList';
import PendingApprovals from '../Screens/PendingApprovals';
import AddPeople from '../Screens/AddPeople';
import Alerts from '../Screens/Alerts';
import ProtectedRoute from './protectedRoute';
import { setUserProfile, stopLoader } from '../Redux/slices/userSlice';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const AppRoutes = () => {
    const dispatch = useDispatch();
    const { user } = useAuthenticator();

    useEffect(() => {
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
                dispatch(stopLoader());
            }
        };

        fetchUserProfile();
    }, [user.userId, dispatch]);

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
                path="/staff-members"
                element={
                    <ProtectedRoute
                        element={<UserList />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/add-people"
                element={
                    <ProtectedRoute
                        element={<AddPeople />}
                        requiredRole="admin"
                    />
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
