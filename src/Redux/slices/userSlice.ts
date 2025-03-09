import { createSlice } from '@reduxjs/toolkit';

const loadUserProfile = () => {
    try {
        const serializedState = localStorage.getItem('userProfile');
        return serializedState ? JSON.parse(serializedState) : null;
    } catch (_err) {
        return null;
    }
};

const initialState = {
    userProfile: loadUserProfile(), // Load from localStorage
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
            localStorage.setItem('userProfile', JSON.stringify(action.payload)); // Save to localStorage
        },
        clearUserProfile: state => {
            state.userProfile = null;
            localStorage.removeItem('userProfile'); // Remove from localStorage
        }
    }
});

export const { setUserProfile, clearUserProfile } = authSlice.actions;
export default authSlice.reducer;
