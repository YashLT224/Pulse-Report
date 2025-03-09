import { thunk } from "redux-thunk"
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    authReducer: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(thunk), // Add Thunk middleware

});
export default store