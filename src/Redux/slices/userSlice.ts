import { createSlice } from '@reduxjs/toolkit';

const loadLocalUserProfile = () => {
    try {
        const serializedState = localStorage.getItem('userProfile');
        return serializedState ? JSON.parse(serializedState) : null;
    } catch (_err) {
        return null;
    }
};

const initialState = {
    userProfile: loadLocalUserProfile(),
    isLoading: true,
    error: null
};

const authSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
            state.isLoading = false;
            localStorage.setItem('userProfile', JSON.stringify(action.payload)); // Save to localStorage
        },
        stopLoader: state => {
            state.isLoading = false; // Stop loader when we have data
        },
        clearUserProfile: state => {
            state.isLoading = true;
            state.userProfile = null;
            localStorage.removeItem('userProfile'); // Remove from localStorage
        }
    }
});

export const {
    setUserProfile,
    clearUserProfile,
    stopLoader
} = authSlice.actions;
export default authSlice.reducer;
