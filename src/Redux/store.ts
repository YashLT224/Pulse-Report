// import { createStore,applyMiddleware } from "redux"
// import { composeWithDevTools } from '@redux-devtools/extension';

// import rootReducer from './rootReducer'


//  const store=createStore(rootReducer,composeWithDevTools(applyMiddleware(thunk)));
//  export default store


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