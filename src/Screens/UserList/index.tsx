import { useCallback } from 'react';
import { Loader } from '@aws-amplify/ui-react';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';

const LIMIT = 5; // Number of items to display per page

const UserList = () => {
    const { client } = useAuth();

    // fetch function for usePagination
    const fetchStaffMembers = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                role: 'staff',
                nextToken: token,
                limit
            };
            const response = await client.models.UserProfile.listByRole(params);

            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.UserProfile]
    );

    // Use the usePagination hook
    const {
        items: staffMembers,
        isLoading,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        updateItem
    } = usePagination({
        limit: LIMIT,
        fetchFn: fetchStaffMembers,
        idField: 'userId'
    });

    const onEdit = (editedUser: any) => {
        const { userId, allowedForms = [] } = editedUser;

        updateItem(editedUser);

        client.models.UserProfile.update({ userId, allowedForms }).catch(
            error => {
                console.error('Failed to update user profile:', error);
            }
        );
    };

    return (
        <>
            <div style={{ position: 'relative' }}>
                {/* Loader overlay */}
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 10
                        }}
                    >
                        <Loader
                            height={'80px'}
                            size="large"
                            emptyColor="#007aff"
                            filledColor="white"
                        />
                    </div>
                )}

                {/* User List Items */}
                <UserListItems
                    heading={'Staff Members'}
                    staffMembers={staffMembers}
                    onEdit={onEdit}
                />
            </div>
            {/* Pagination Controls */}
            <PaginationControls
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
            />
        </>
    );
};

export default UserList;
