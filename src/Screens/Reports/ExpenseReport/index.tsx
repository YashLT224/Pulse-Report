import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { ulid } from 'ulid';
import { Loader, Input } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import SelectSearch from 'react-select-search';

const LIMIT = 10; // Number of items to display per page
const heading = 'Expense Report';
const idField = 'formId';
const FORM_TYPE = 'expenseReport';

type Form = Schema['Form']['type'];

const ExpenseReport = () => {
    const { userProfile, client } = useAuth();

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
        },
        {
            key: 'expenseReport_personName',
            header: 'Person Name'
        },
        {
            key: 'expenseReport_workAssign',
            header: 'Work Assign'
        },
        {
            key: 'expenseReport_balanceBF',
            header: 'Balance B/F'
        },
        {
            key: 'expenseReport_payment',
            header: 'Payment'
        },
        {
            key: 'expenseReport_expense',
            header: 'Expense'
        },
        {
            key: 'expenseReport_balance',
            header: 'Balance'
        },
        {
            key: 'expenseReport_remarks',
            header: 'Remarks'
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
            expenseReport_personId: '',
            expenseReport_personName: '',
            expenseReport_workAssign: '',
            expenseReport_balanceBF: 0,
            expenseReport_payment: 0,
            expenseReport_balance: 0,
            expenseReport_expense: 0,
            expenseReport_remarks: ''
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
        const { createdAt, updatedAt, ...restForm } = editedForm;
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
        !selectedItem.expenseReport_personId ||
        !selectedItem.expenseReport_personName ||
        !selectedItem.expenseReport_workAssign ||
        selectedItem.expenseReport_balanceBF === '' ||
        selectedItem.expenseReport_payment === '' ||
        selectedItem.expenseReport_expense === '' ||
        selectedItem.expenseReport_balance === '' ||
        !selectedItem.expenseReport_remarks;
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
                <UserListItems<Form>
                    heading={heading}
                    items={items}
                    columns={itemsColumns}
                    addNewEntryAccess={true}
                    addNewItemHandler={addNewItemHandler}
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

            {isModalOpen && (
                <Modal heading={heading} isUpdateMode={isUpdateMode}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px selectSearch">
                            <Heading>Person Name</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.expenseReport_personName}#${selectedItem.expenseReport_personId}`}
                                // name="Person Name"
                                placeholder="Choose Person"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'expenseReport_personName#expenseReport_personId',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Work Assign</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="WorkAssign"
                                value={selectedItem.expenseReport_workAssign}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expenseReport_workAssign'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Payment(Petty Cash)</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Payment"
                                isRequired={true}
                                value={selectedItem.expenseReport_payment}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expenseReport_payment'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Expense</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Expense"
                                isRequired={true}
                                value={selectedItem.expenseReport_expense}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expenseReport_expense'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Balance B/F</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Balance b/f"
                                isRequired={true}
                                value={selectedItem.expenseReport_balanceBF}
                                // onChange={e =>
                                //     updateField(
                                //         e.target.value,
                                //         'expenseReport_balanceBF'
                                //     )
                                // }
                            />
                        </div>

                       

                       

                        <div className="mb-8px">
                            <Heading>Balance C/F</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Balance"
                                isRequired={true}
                                value={selectedItem.expenseReport_balanceBF+(selectedItem.expenseReport_payment - selectedItem.expenseReport_expense)}
                                // onChange={e =>
                                //     updateField(
                                //         e.target.value,
                                //         'expenseReport_balance'
                                //     )
                                // }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Remarks</Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder={'Remarks'}
                                value={selectedItem.expenseReport_remarks}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expenseReport_remarks'
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

export default ExpenseReport;
