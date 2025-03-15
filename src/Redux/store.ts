import { thunk } from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/userSlice';
import adminControlReducer from './slices/adminControlSlice';
import globalSlice from './slices/globalDataSlice';

const store = configureStore({
    reducer: {
        authReducer,
        adminControlReducer,
        globalReducer: globalSlice
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk) // Add Thunk middleware
});

export default store;
export type AppDispatch = typeof store.dispatch;
