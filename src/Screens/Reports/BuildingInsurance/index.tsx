import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import SelectSearch from 'react-select-search';
import { ModalButton, Heading } from '../../../style';

const LIMIT = 10; // Number of items to display per page
const heading = 'Building Insurance';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = 'buildingInsurance';


const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const getNextYearExpirationDate = () => {
    const today = new Date();
    const nextYear = new Date(today);
    
    // Add one year
    nextYear.setFullYear(today.getFullYear() + 1);
    
    // Subtract one day
    nextYear.setDate(nextYear.getDate() - 1);
    
    return formatDateForInput(nextYear);
  };

  

const BuildingInsurance = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    // Define columns for the People | Party list
    const itemsColumns = [
        {
            key: 'buildingInsurance_buildingName',
            header: 'Building Name'
        },
        {
            key: 'buildingInsurance_insuranceDate',
            header: 'Insurance Date'
        },
        {
            key: 'buildingInsurance_insureAmount',
            header: 'Insure Amount'
        },
        {
            key: 'buildingInsurance_insuranceAmount',
            header: 'Insurance Amount'
        },

        {
            key: 'expirationDate',
            header: 'Due Date'
        },
        {
            key: 'buildingInsurance_status',
            header: 'Status',
            render: (item) =>(<div style={{color:item.buildingInsurance_status==='PAID'?'green':'red'}}>{item.buildingInsurance_status}</div>)
            
        },
        {
            key: 'buildingInsurance_documentNo',
            header: 'Document No.'
        },
        {
            key: 'buildingInsurance_markToName',
            header: 'Mark To'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
        }
    ];

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
        refreshList
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm as any,
        idField
    });

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            buildingInsurance_buildingName: '',
            buildingInsurance_insureAmount: 0,
            buildingInsurance_insuranceAmount: 0,
            buildingInsurance_insuranceDate: formatDateForInput(new Date()),
            buildingInsurance_markToName: '',
            buildingInsurance_markToId: '',
            buildingInsurance_status: 'PENDING',
            expirationDate:getNextYearExpirationDate(),
            buildingInsurance_documentNo:''
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
                updatedBy: userProfile.userId
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
        !selectedItem.buildingInsurance_buildingName ||
        !selectedItem.buildingInsurance_markToName ||
        !selectedItem.buildingInsurance_markToId ||
        selectedItem.buildingInsurance_insureAmount === '' ||
        selectedItem.buildingInsurance_insuranceAmount === '' ||
        (selectedItem.buildingInsurance_status==='PAID'&& !selectedItem.buildingInsurance_documentNo?.trim());

        

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
                        <div className="mb-8px">
                            <Heading>Building Name</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Building Name"
                                value={
                                    selectedItem.buildingInsurance_buildingName
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_buildingName'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Insure Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Insure Date"
                                isRequired={true}
                                value={
                                    selectedItem.buildingInsurance_insuranceDate
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_insuranceDate'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Insure Amount</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insure Amount"
                                isRequired={true}
                                value={
                                    selectedItem.buildingInsurance_insureAmount
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_insureAmount'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Insurance Amount</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Amount"
                                isRequired={true}
                                value={
                                    selectedItem.buildingInsurance_insuranceAmount
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_insuranceAmount'
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
                            <Heading>Status</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.buildingMclTax_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_status'
                                    )
                                }
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </SelectField>
                        </div>

                        <div className="mb-8px">
                            <Heading>Document No.</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Due Date"
                                isRequired={true}
                                value={selectedItem.buildingInsurance_documentNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingInsurance_documentNo'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px selectSearch">
                            <Heading>Mark To</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.buildingInsurance_markToName}#${selectedItem.buildingInsurance_markToId}`}
                                // name="Person Name"
                                placeholder="Mark To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'buildingInsurance_markToName#buildingInsurance_markToId',
                                        true
                                    );
                                }}
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
