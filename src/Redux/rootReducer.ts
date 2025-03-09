import { combineReducers } from 'redux';
import authReducer from './reducers/';
export default combineReducers({
    authReducer: authReducer,
  });
  