import { useCallback, useState } from 'react';
import { Loader, SelectField } from '@aws-amplify/ui-react';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';
import { formTypes } from '../../data/forms';
import Modal from '../../components/Modal';
import {
    ModalButton,
    CheckboxContainer,
    CheckboxLabel,
    CheckboxInput,
    Heading,
    FormItemContainer,
    AccessBadge,
    FormsTable,
    FormRow,
    FormName,
    FormAccess
} from './style';

const LIMIT = 10; // Number of items to display per page

const PendingApprovals = () => {
    const { client } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null); // selected user to update
    const [selectedForms, setSelectedForms] = useState([]);
    const [formAccessTypes, setFormAccessTypes] = useState({}); // store access type (Read/Write/Update) for each form

    // fetch function for usePagination
    const fetchStaffMembers = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                access: 'none',
                nextToken: token,
                limit,
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
                `${item.userName}${item.allowedForms?.length ? ' ✅' : ''}`
        },
        { key: 'phoneNumber', header: 'Phone Number' },
        {
            key: 'allowedForms',
            header: 'Allowed Forms',
            render: (item: any) => {
                if (!item.allowedForms?.length) return 'None 🚫';

                return (
                    <FormsTable>
                        {item.allowedForms.map((formAccess: string) => {
                            const [formLabel, accessType] = formAccess.split(
                                '#'
                            );
                            const formName =
                                formTypes.find(f => f.label === formLabel)
                                    ?.name || formLabel;
                            return (
                                <FormRow key={formAccess}>
                                    <FormName>{formName}</FormName>
                                    <FormAccess>
                                        <AccessBadge
                                            type={
                                                (accessType || 'READ') as
                                                    | 'READ'
                                                    | 'WRITE'
                                                    | 'UPDATE'
                                            }
                                        >
                                            {(accessType === 'UPDATE'
                                                ? 'BOTH'
                                                : accessType) || 'READ'}
                                        </AccessBadge>
                                    </FormAccess>
                                </FormRow>
                            );
                        })}
                    </FormsTable>
                );
            }
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: any) =>
                new Date(item.createdAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            
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

    const handleEdit = item => {
        setSelectedItem(item);
        setSelectedForms(item.allowedForms || []); // Initialize with current values

        // Initialize formAccessTypes based on the allowedForms and their corresponding access types
        const initialFormAccessTypes: Record<string, string> = {};
        (item.allowedForms || []).forEach((form: string) => {
            const [formName, accessType] = form.split('#');
            initialFormAccessTypes[formName] = accessType || 'READ';
        });
        setFormAccessTypes(initialFormAccessTypes);

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (formLabel: string) => {
        // Initialize the default access type if not already set
        if (!formAccessTypes[formLabel]) {
            setFormAccessTypes(prev => ({
                ...prev,
                [formLabel]: 'READ'
            }));
        }

        // Check if the formLabel includes any access type
        const formWithAccess = selectedForms.find(form =>
            form.startsWith(formLabel)
        );

        if (!formWithAccess) {
            // If the form is not already selected, add it with the default access type
            setSelectedForms(prevSelectedForms => [
                ...prevSelectedForms,
                `${formLabel}#READ`
            ]);
        } else {
            // If the form is selected, remove it when unticked
            setSelectedForms(prevSelectedForms =>
                prevSelectedForms.filter(form => !form.startsWith(formLabel))
            );
        }
    };

    const handleAccessTypeChange = (
        formLabel: string,
        newAccessType: string
    ) => {
        // Update the access type of the form
        setFormAccessTypes(prev => ({
            ...prev,
            [formLabel]: newAccessType
        }));

        // Update the form with the new access type
        setSelectedForms(prevSelectedForms => {
            const updatedForms = prevSelectedForms.filter(
                form => form !== formLabel && !form.startsWith(`${formLabel}#`)
            );
            updatedForms.push(`${formLabel}#${newAccessType}`);
            return updatedForms;
        });
    };

    const accessGrantedHandler = (form, selectedForms) => {
        return selectedForms.some(formWithAccess =>
            formWithAccess.startsWith(form.label)
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
                    heading={'Pending Approvals'}
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
                    heading={`User: ${selectedItem['userName']}`}
                >
                    <div>
                        <Heading>Allowed Forms: </Heading>
                        {formTypes.map(form => (
                            <FormItemContainer key={form.id}>
                                <CheckboxContainer>
                                    <CheckboxLabel>
                                        <CheckboxInput
                                            type="checkbox"
                                            checked={selectedForms.some(
                                                formWithAccess =>
                                                    formWithAccess.startsWith(
                                                        form.label
                                                    )
                                            )}
                                            onChange={() =>
                                                handleFormChange(form.label)
                                            }
                                        />
                                        {form.name}
                                    </CheckboxLabel>
                                </CheckboxContainer>
                                {accessGrantedHandler(form, selectedForms) && (
                                    <div className="mb-8px">
                                        <Heading>
                                            {form.name} Access Type
                                        </Heading>
                                        <SelectField
                                            label=""
                                            value={
                                                formAccessTypes[form.label] ||
                                                'READ'
                                            }
                                            onChange={e =>
                                                handleAccessTypeChange(
                                                    form.label,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="READ">Read</option>
                                            <option value="WRITE">Write</option>
                                            <option value="UPDATE">
                                                Both
                                            </option>
                                        </SelectField>
                                    </div>
                                )}
                            </FormItemContainer>
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

export default PendingApprovals;
