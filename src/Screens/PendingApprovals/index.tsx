import { useCallback } from 'react';
import { Loader } from '@aws-amplify/ui-react';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';
import { formTypes, formLabelMap } from '../../data/forms';

const LIMIT = 10; // Number of items to display per page

const PendingApprovals = () => {
    const { client } = useAuth();

    // fetch function for usePagination
    const fetchStaffMembers = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                access: 'none',
                nextToken: token,
                limit,
                // filter: { allowedForms: { size: { eq: 0 } } },
                sortDirection: 'DESC'
            };
            const response = await client.models.UserProfile.listByAccess(
                params
            );

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

    // Define columns for the user list
    const userColumns = [
        {
            key: 'userName',
            header: 'Name',
            render: (item: any) =>
                `${item.userName}${item.allowedForms?.length ? ' 🟢' : ''}`
        },
        { key: 'phoneNumber', header: 'Phone Number' },
        {
            key: 'allowedForms',
            header: 'Allowed Forms',
            render: (item: any) =>
                item.allowedForms
                    ?.map((label: string) => formLabelMap[label] || label)
                    .join(', ') || 'None 🚫'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: item =>
                item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
        }
    ];

    const onEdit = (editedUser: any) => {
        const { userId, allowedForms = [] } = editedUser;

        updateItem(editedUser);

        const params: any = {
            userId,
            allowedForms,
            access: !editedUser.allowedForms?.length ? 'none' : null
        };

        client.models.UserProfile.update(params).catch(error => {
            console.error('Failed to update user profile:', error);
        });
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
                    heading={'Pending Approvals'}
                    items={staffMembers}
                    onEdit={onEdit}
                    columns={userColumns}
                    editableFields={[
                        {
                            key: 'allowedForms',
                            label: 'Allowed Forms',
                            type: 'checkbox',
                            options: formTypes
                        }
                    ]}
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

export default PendingApprovals;
