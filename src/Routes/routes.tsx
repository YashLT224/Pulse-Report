import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { useDispatch } from 'react-redux';
import Home from '../Screens/Home';
import UserList from '../Screens/UserListScreen';
import PendingApprovals from '../Screens/PendingApprovals';
import AddEntity from '../Screens/AddEntity';
import Alerts from '../Screens/Alerts';
import ProtectedRoute from './protectedRoute';
import { setUserProfile, stopLoader } from '../Redux/slices/userSlice';
import { Schema } from '../../amplify/data/resource';
import ExpenseReport from '../Screens/Reports/ExpenseReport/index';
import VechileReport from '../Screens/Reports/VechileReport/index';
import VechileInsurance from '../Screens/Reports/VechileInsurance/index';
import BuildingInsurance from '../Screens/Reports/BuildingInsurance/index';
import BuildingMclTax from '../Screens/Reports/BuildingMclTax/index';
import DocumentFileStatus from '../Screens/Reports/DocumentFileStatus/index';
import Todolist from '../Screens/Reports/todolistReport/index';
import Requirements from '../Screens/Reports/Requirements/index';
import Dispatch from '../Screens/Reports/Dispatch/index';
import Performance from '../Screens/Reports/Performance/index';

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
                        element={<AddEntity type="PEOPLE" />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/add-party"
                element={
                    <ProtectedRoute
                        element={<AddEntity type="PARTY" />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/expense-report"
                element={
                    <ProtectedRoute
                        element={<ExpenseReport />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/vechile-insurance"
                element={
                    <ProtectedRoute
                        element={<VechileInsurance />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/vechile-report"
                element={
                    <ProtectedRoute
                        element={<VechileReport />}
                        requiredRole="admin"
                    />
                }
            />
            <Route
                path="/building-insurance"
                element={
                    <ProtectedRoute
                        element={<BuildingInsurance />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/building-mcl-tax"
                element={
                    <ProtectedRoute
                        element={<BuildingMclTax />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/document"
                element={
                    <ProtectedRoute
                        element={<DocumentFileStatus />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/todo-list"
                element={
                    <ProtectedRoute
                        element={<Todolist />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/requirements"
                element={
                    <ProtectedRoute
                        element={<Requirements />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/dispatch-instructions"
                element={
                    <ProtectedRoute
                        element={<Dispatch />}
                        requiredRole="admin"
                    />
                }
            />

            <Route
                path="/performance"
                element={
                    <ProtectedRoute
                        element={<Performance />}
                        requiredRole="admin"
                    />
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
