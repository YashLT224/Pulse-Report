import { useState, useEffect } from 'react';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';

const UserList = () => {
    const { client } = useAuth();
    const [staffMembers, setStaffMembers] = useState<any>([]);

    useEffect(() => {
        client.models.UserProfile.listByRole({ role: 'staff' }).then(members =>
            setStaffMembers(members.data)
        );
    }, [client.models.UserProfile]);

    const onEdit = (editedUser: any) => {
        const { userId, allowedForms = [] } = editedUser;

        client.models.UserProfile.update({ userId, allowedForms }).catch(
            error => {
                console.error('Failed to update user profile:', error);
            }
        );

        setStaffMembers((prevMembers: any[]) =>
            prevMembers.map(member =>
                member.userId === userId ? editedUser : member
            )
        );
    };

    return (
        <div>
            <UserListItems
                heading={'Staff Members'}
                staffMembers={staffMembers}
                onEdit={onEdit}
            />
        </div>
    );
};

export default UserList;
