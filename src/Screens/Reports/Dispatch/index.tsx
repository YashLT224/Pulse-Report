import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input, TextAreaField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import SelectSearch from 'react-select-search';
import { ModalButton, Heading } from '../../../style';

const LIMIT = 10; // Number of items to display per page
const heading = 'Dispatch Instructions';
const idField = 'formId';
type Form = Schema['Form']['type'];

const BuildingInsurance = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const partyList = useSelector((state: any) => state.globalReducer.parties);
    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );
    // Define columns for the People | Party list
    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
        },
        {
            key: 'dispatchInstructions_partyName',
            header: 'Party Name'
        },
        {
            key: 'dispatchInstructions_instructions',
            header: 'Instructions'
        },
        {
            key: 'dispatchInstructions_responsiblePersonName',
            header: 'Responsible Person'
        },
        {
            key: 'dispatchInstructions_remarks',
            header: 'Remarks'
        }
    ];

    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                formType: 'dispatchInstructions#active',
                nextToken: token,
                limit,
                sortDirection: 'DESC'
            };
            const response = await client.models.Form.listFormByType(params);
            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form]
    );

    // Use the usePagination hook
    const {
        items,
        isLoading,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        initiateLoding,
        updateItem,
        refreshList
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm as any,
        idField
    });

    const formatDateForInput = date => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            dispatchInstructions_partyName: '',
            dispatchInstructions_instructions: '',
            dispatchInstructions_responsiblePersonName: '',
            dispatchInstructions_remarks: ''
        });
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setUpdateMode(true);
        setIsModalOpen(true);
    };
    const onEdit = async (editedForm: Form) => {
        const {
            createdAt,
            updatedAt,
            hasExpiration,
            formType,
            state,
            createdBy,
            ...expenseForm
        } = editedForm;
        if (isUpdateMode) {
            const params: any = {
                ...expenseForm,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId
            };
            updateItem(editedForm);

            client.models.Form.update(params).catch(error => {
                console.error(`Failed to update ${heading}:`, error);
            });
        } else {
            const params: any = {
                ...expenseForm,
                [idField]: ulid(),
                createdAt: new Date().toISOString(),
                formType: 'dispatchInstructions#active',
                state: 'active',
                createdBy: userProfile.userId
            };
            initiateLoding();
            client.models.Form.create(params)
                .then(() => {
                    refreshList();
                })
                .catch(error => {
                    console.error(`Failed to create ${heading}:`, error);
                });
        }
    };

    const handleSave = () => {
        if (!selectedItem) return;
        onEdit(selectedItem as Form);
        setIsModalOpen(false);
    };

    const updateField = (value: any, key: string, ismultiValue = false) => {
        if (!ismultiValue) {
            setSelectedItem((prev: any) => ({ ...prev, [key]: value }));
        } else {
            const keys = key.split('#');
            const values = value.split('#');
            setSelectedItem((prev: any) => ({
                ...prev,
                [keys[0]]: values[0],
                [keys[1]]: values[1]
            }));
        }
    };
    const isSubmitDisabled =
        !selectedItem.dispatchInstructions_partyName ||
        !selectedItem.dispatchInstructions_instructions ||
        !selectedItem.dispatchInstructions_responsiblePersonName ||
        !selectedItem.dispatchInstructions_remarks;

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
                <UserListItems
                    heading={heading}
                    items={items}
                    columns={itemsColumns}
                    addNewEntryAccess={true}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                />
                {/* Pagination Controls */}
                <PaginationControls
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                />
            </div>

            {isModalOpen && (
                <Modal heading={heading} isUpdateMode={isUpdateMode}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px selectSearch">
                            <Heading>Party Name</Heading>
                            <SelectSearch
                                search={true}
                                options={partyList}
                                value={`${selectedItem.dispatchInstructions_partyName}#${selectedItem.dispatchInstructions_partyId}`}
                                // name="Person Name"
                                placeholder="Mark To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'dispatchInstructions_partyName#dispatchInstructions_partyId',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Instructions</Heading>
                            <TextAreaField
                                descriptiveText="Enter Instructions"
                                placeholder="Enter Instructions"
                                value={
                                  selectedItem.dispatchInstructions_instructions
                              }
                              onChange={e =>
                                  updateField(
                                      e.target.value,
                                      'dispatchInstructions_instructions'
                                  )
                              }
                                rows={10}
                            />
                        </div>
                        <div className="mb-8px selectSearch">
                            <Heading>Responsible person</Heading>
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.dispatchInstructions_responsiblePersonId}#${selectedItem.dispatchInstructions_responsiblePersonName}`}
                                placeholder="Mark To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'dispatchInstructions_responsiblePersonId#dispatchInstructions_responsiblePersonName',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Remarks</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Remarks"
                                isRequired={true}
                                value={
                                    selectedItem.dispatchInstructions_remarks
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'dispatchInstructions_remarks'
                                    )
                                }
                            />
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '15px'
                            }}
                        >
                            <ModalButton
                                type="submit"
                                disabled={isSubmitDisabled}
                            >
                                {isUpdateMode ? 'Update' : 'Save'}
                            </ModalButton>
                            <ModalButton onClick={handleCloseModal}>
                                Cancel
                            </ModalButton>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export default BuildingInsurance;
