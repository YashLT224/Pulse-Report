import { useState ,useEffect} from 'react';
import UserListItems from '../../components/UserList'

import useAuth from '../../Hooks/useAuth'
const UserList = () => {
    const {user,client}=useAuth()
    const [staffMembers, setStaffMembers] = useState<any>([]);

    useEffect(() => {
        client.models.UserProfile.listByRole({ role: "staff" }).then(members =>
            setStaffMembers(members.data)
        );
    }, [user.userId]);

    return (
        <div>
            <UserListItems staffMembers={staffMembers} Heading={'Staff Members'}/>
        </div>
    );
};

export default UserList;
