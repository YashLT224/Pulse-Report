import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import {buildingMclTax_itemsColumns as itemsColumns} from '../../../data/forms'


const LIMIT = 10; // Number of items to display per page
const heading = 'Building MCL Tax';
const idField = 'formId';
const FORM_TYPE = 'buildingMclTax';

type Form = Schema['Form']['type'];

const BuildingMCLTax = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    // Define columns for the People | Party list
  

    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                formType: `${FORM_TYPE}#active`,
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
        refreshList,
        stopLoding
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm as any,
        idField
    });

    const formatDateForInput = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            buildingMclTax_buildingName: '',
            buildingMclTax_buildingTax: 0,
            expirationDate: formatDateForInput(new Date()),
            buildingMclTax_taxType: '',
            buildingMclTax_status: 'PENDING',
            buildingMclTax_paidDate: formatDateForInput(new Date()),
            buildingMclTax_documentFileNo: ''
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
            ...restForm
        } = editedForm;
        if (isUpdateMode) {
            const params: any = {
                ...restForm,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName:userProfile.userName,
            };
            updateItem(editedForm);

            client.models.Form.update(params).catch(error => {
                console.error(`Failed to update ${heading}:`, error);
            });
        } else {
            const params: any = {
                ...restForm,
                [idField]: ulid(),
                hasExpiration: 'yes#active',
                createdAt: new Date().toISOString(),
                formType: `${FORM_TYPE}#active`,
                state: 'active',
                createdBy: userProfile.userId,
                createdByName:userProfile.userName
            };
            initiateLoding();
            client.models.Form.create(params)
                .then(() => {
                    refreshList();
                })
                .catch(error => {
                    console.error(`Failed to create ${heading}:`, error);
                    stopLoding();
                });
        }
    };

    const handleSave = () => {
        if (!selectedItem) return;
        onEdit(selectedItem as Form);
        setIsModalOpen(false);
    };

    const updateField = (value: any, key: string, isMultiValue = false) => {
        if (!isMultiValue) {
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
        !selectedItem.buildingMclTax_buildingName ||
        !selectedItem.buildingMclTax_taxType ||
        selectedItem.buildingMclTax_buildingTax === '' ||
        !selectedItem.buildingMclTax_status ||
        !selectedItem.buildingMclTax_documentFileNo ||
        !selectedItem.expirationDate;

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
                <Modal 
                onCloseHandler={handleCloseModal}
                heading={heading} isUpdateMode={isUpdateMode}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>Building Name</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Building Name"
                                value={selectedItem.buildingMclTax_buildingName}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_buildingName'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Balance Tax</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Building Tax"
                                isRequired={true}
                                value={selectedItem.buildingMclTax_buildingTax}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_buildingTax'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Due Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Due Date"
                                isRequired={true}
                                value={selectedItem.expirationDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expirationDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Tax Type</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Tax Type"
                                isRequired={true}
                                value={selectedItem.buildingMclTax_taxType}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_taxType'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Status</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.buildingMclTax_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_status'
                                    )
                                }
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </SelectField>
                        </div>
                        <div className="mb-8px">
                            <Heading>Paid Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Payment"
                                max={formatDateForInput(new Date())}
                                isRequired={true}
                                value={selectedItem.buildingMclTax_paidDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_paidDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Document File No</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Balance"
                                isRequired={true}
                                value={
                                    selectedItem.buildingMclTax_documentFileNo
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_documentFileNo'
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

export default BuildingMCLTax;
