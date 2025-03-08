import { thunk } from "redux-thunk"
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterslice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(thunk), // Add Thunk middleware

});
export default store