import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userProfile: null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    }
  }
});

export const { setUserProfile, clearUserProfile } = authSlice.actions;
export default authSlice.reducer;