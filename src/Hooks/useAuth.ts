import {  useSelector } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
export const client = generateClient<Schema>();

const useAuth = () => {
    const { user } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
  return {user,userProfile,client}
}

export default useAuth
