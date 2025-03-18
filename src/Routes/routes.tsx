import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../Redux/store';
import useAuth from '../Hooks/useAuth';
import Home from '../Screens/Home';
import UserList from '../Screens/UserListScreen';
import PendingApprovals from '../Screens/PendingApprovals';
import AddEntity from '../Screens/AddEntity';
import Alerts from '../Screens/Alerts';
import ProtectedRoute from './protectedRoute';
import { setUserProfile, stopLoader } from '../Redux/slices/userSlice';
import { fetchPeople, fetchParties } from '../Redux/slices/globalDataSlice';
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
import 'react-select-search/style.css';

const AppRoutes = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, client } = useAuth();

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
        dispatch(fetchPeople());
        dispatch(fetchParties());
    }, [
        user.userId,
        dispatch,
        client.models.UserProfile,
        client.models.People,
        client.models.Party
    ]);

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
                        requiredFormId="expenseReport"
                    />
                }
            />

            <Route
                path="/vechile-insurance"
                element={
                    <ProtectedRoute
                        element={<VechileInsurance />}
                        requiredFormId="vehicleInsurance"
                    />
                }
            />

            <Route
                path="/vechile-report"
                element={
                    <ProtectedRoute
                        element={<VechileReport />}
                        requiredFormId="vehicleReport"
                    />
                }
            />
            <Route
                path="/building-insurance"
                element={
                    <ProtectedRoute
                        element={<BuildingInsurance />}
                        requiredFormId="buildingInsurance"
                    />
                }
            />

            <Route
                path="/building-mcl-tax"
                element={
                    <ProtectedRoute
                        element={<BuildingMclTax />}
                        requiredFormId="buildingMclTax"
                    />
                }
            />

            <Route
                path="/document"
                element={
                    <ProtectedRoute
                        element={<DocumentFileStatus />}
                        requiredFormId="documentFileStatus"
                    />
                }
            />

            <Route
                path="/todo-list"
                element={
                    <ProtectedRoute
                        element={<Todolist />}
                        requiredFormId="toDoList"
                    />
                }
            />

            <Route
                path="/requirements"
                element={
                    <ProtectedRoute
                        element={<Requirements />}
                        requiredFormId="requirement"
                    />
                }
            />

            <Route
                path="/dispatch-instructions"
                element={
                    <ProtectedRoute
                        element={<Dispatch />}
                        requiredFormId="dispatchInstructions"
                    />
                }
            />

            <Route
                path="/performance"
                element={
                    <ProtectedRoute
                        element={<Performance />}
                        requiredFormId="salesManPerformance"
                    />
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
