import { useCallback, useState } from 'react';
import { Loader,SelectField } from '@aws-amplify/ui-react';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';
import { formTypes, formLabelMap } from '../../data/forms';
import Modal from '../../components/Modal';

import {
    ModalButton,
    CheckboxContainer,
    CheckboxLabel,
    CheckboxInput,Heading
} from './style';

const LIMIT = 10; // Number of items to display per page

const UserList = () => {
    const { client } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null); // selected user to update
    const [selectedForms, setSelectedForms] = useState([]);
    // fetch function for usePagination
    const fetchStaffMembers = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                role: 'staff',
                nextToken: token,
                limit,
                sortDirection: 'DESC'
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

    // Define columns for the user list
    const userColumns = [
        {
            key: 'userName',
            header: 'Name',
            render: (item: any) => `${item.userName}`
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
            key: 'status',
            header: 'Status',
            render: (item: any) =><div style={{color: item.status==='active'?'green':'red'}}>
           { item.status==='active'? 'Active':`InActive 🚫`}
            </div>
            
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: any) =>
                item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
        }
    ];

    const onEdit = (editedUser: any) => {
        const { userId, allowedForms = [] ,status} = editedUser;
        updateItem(editedUser);

        const params: any = {
            userId,
            allowedForms,
            access: !editedUser.allowedForms?.length ? 'none' : null,
            status
        };

        client.models.UserProfile.update(params).catch(error => {
            console.error('Failed to update user profile:', error);
        });
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setSelectedForms(item.allowedForms); // Initialize with current values
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = formLabel => {
        setSelectedForms(
            prevSelectedForms =>
                prevSelectedForms.includes(formLabel)
                    ? prevSelectedForms.filter(form => form !== formLabel) // Deselect
                    : [...prevSelectedForms, formLabel] // Select
        );
    };

    const handleSave = () => {
        if (!selectedItem) return;
        onEdit({ ...selectedItem, allowedForms: selectedForms });
        setIsModalOpen(false);
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
                    items={staffMembers}
                    columns={userColumns}
                    handleEdit={handleEdit}
                />
            </div>
            {/* Pagination Controls */}
            <PaginationControls
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
            />

            {isModalOpen && selectedItem && (
                <Modal
                onCloseHandler={handleCloseModal}
                heading={`User: ${selectedItem['userName']}`}>
                     <div className="mb-8px">
                            <Heading>Status: </Heading>
                            <SelectField
                                label=""
                                value={selectedItem.status}
                                onChange={e =>
                                    setSelectedItem((prev)=>({...prev,status:  e.target.value})
                                    )
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </SelectField>
                        </div>
                    <div>
                    <Heading>Allowed Forms: </Heading>
                    {formTypes.map(form => (
                        <CheckboxContainer key={form.id}>
                            <CheckboxLabel>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={selectedForms.includes(form.label)}
                                    onChange={() =>
                                        handleFormChange(form.label)
                                    }
                                />
                                {form.name}
                            </CheckboxLabel>
                        </CheckboxContainer>
                    ))}
                    </div>
                    

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '15px'
                        }}
                    >
                        <ModalButton onClick={handleSave}>Save</ModalButton>
                        <ModalButton onClick={handleCloseModal}>
                            Cancel
                        </ModalButton>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default UserList;
