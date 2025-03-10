import { thunk } from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/userSlice';
import adminControlReducer from './slices/adminControlSlice';

const store = configureStore({
    reducer: {
        authReducer,
        adminControlReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk) // Add Thunk middleware
});

export default store;
