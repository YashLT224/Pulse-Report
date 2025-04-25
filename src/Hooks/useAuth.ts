import { useSelector } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

export const client = generateClient<Schema>();

const useAuth = () => {
    const { user } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
    const isAdmin = userProfile?.role === 'admin';
    const formAccess =userProfile?.allowedForms.reduce((acc, form) => {
        const [formName, accessType] = form.split('#');
        acc[formName] = accessType || 'read'; // Default to 'read' if there's no access type
        return acc;
    }, {});
    return { user, userProfile,isAdmin,formAccess, client };
};

export default useAuth;
