import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userProfile: {},
    isLoading: true,
    error: null
};

const authSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
            state.isLoading=false;
            localStorage.setItem('userProfile', JSON.stringify(action.payload)); // Save to localStorage
        },
        stopLoader: state => {
            state.isLoading=false; // Stop loader when we have data
        },
        clearUserProfile: state => {
            state.isLoading=false;
            state.userProfile = null;
            localStorage.removeItem('userProfile'); // Remove from localStorage
        }
    }
});

export const { setUserProfile, clearUserProfile ,stopLoader} = authSlice.actions;
export default authSlice.reducer;
