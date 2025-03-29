import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input } from '@aws-amplify/ui-react';
import SelectSearch from 'react-select-search';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import { formatDateForInput } from '../../../utils/helpers';

const LIMIT = 10; // Number of items to display per page
const heading = 'Sales Man Performance';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = 'salesManPerformance';

const SalesManPerformance = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);
    const [filters,setFilters]=useState({
        date:new Date().toISOString().slice(0, 7)
    })

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    const handleAddItem = () => {
        setSelectedItem(prev => ({
            ...prev,
            salesManPerformance_skus: [
                ...prev.salesManPerformance_skus,
                { sku: 0, target: 0 }
            ]
        }));
    };

    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString().split(',')?.[0]
        },
        {
            key: 'salesManPerformance_salesManName',
            header: 'Sales Man'
        },
        {
            key: 'salesManPerformance_salary',
            header: 'Salary'
        },
        {
            key: 'salesManPerformance_expense',
            header: 'Expense'
        },
        {
            key: 'salesManPerformance_totalExpense',
            header: 'Total Expense',
            render: (item: Form) =>
                item.salesManPerformance_salary +
                item.salesManPerformance_expense
        },
        {
            key: 'salesManPerformance_salesInRupees',
            header: 'Sales In Rupees'
        },
        {
            key: 'salesManPerformance_salesInKgs',
            header: 'Sales In Kgs'
        },
        {
            key: 'salesManPerformance_skus',
            header: 'SKUs - (Targets)',
            render: (item: Form) => (
                <ul>
                    {item.salesManPerformance_skus.map((req, index) => (
                        <li key={index}>
                            ₹{req.sku} - (₹{req.target})
                        </li>
                    ))}
                </ul>
            )
        },
        {
            key: 'salesManPerformance_totalSales',
            header: 'Total',
            render: (item: Form) => {
                const totalSales = item.salesManPerformance_skus.reduce(
                    (acc: number, curr: { sku: number; target: number }) =>
                        acc + curr.sku,
                    0
                );
                return <span>₹{totalSales}</span>;
            }
        },
        {
            key: 'salesManPerformance_avarage_Expence_Amount',
            header: 'Avg. Exp. Amount',
            render: (item: Form) =>
                (((item.salesManPerformance_salary +
                    item.salesManPerformance_expense) /
                    item.salesManPerformance_salesInRupees) *
                100).toFixed(2)
        },
        {
            key: 'salesManPerformance_avarage_Expence_Weight',
            header: 'Avg. Exp. Weight',
            render: (item: Form) =>{
                 const totalSales = item.salesManPerformance_skus.reduce(
                    (acc: number, curr: { sku: number; target: number }) =>
                        acc + curr.sku,
                    0
                )
                  return (
                        ((item.salesManPerformance_salary +
                            item.salesManPerformance_expense) /
                        totalSales).toFixed(2)
                    );
            }
                 ,
           
          
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
        refreshList,
        stopLoding
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm,
        idField
    });

    console.log(selectedItem.salesManPerformance_skus)


    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            salesManPerformance_salesManName: '',
            salesManPerformance_salesManId: '',
            salesManPerformance_salary: 0,
            salesManPerformance_expense: 0,
            salesManPerformance_salesInRupees: 0,
            salesManPerformance_salesInKgs: 0,
            salesManPerformance_skus: [{sku:0,target:0}]
        });
    };

    // Update a specific item in the list
    const handleItemChange = (index, field, value) => {
        setSelectedItem(prev => {
            const updatedItems = [...prev.salesManPerformance_skus];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value
            };
            return {
                ...prev,
                salesManPerformance_skus: updatedItems
            };
        });
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



    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (item: Form) => {
        setSelectedItem(item);
        setUpdateMode(true);
        setIsModalOpen(true);
    };

    const onEdit = async (editedForm: Form) => {
        const {
            createdAt,
            updatedAt,
            formType,
            state,
            createdBy,
            updatedBy,
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
                    stopLoding();
                });
        }
    };

    const isSubmitDisabled = false;
    // !selectedItem.requirements_demandFromId ||
    // !selectedItem.requirements_demandFromName ||
    // !selectedItem.requirements_responsiblePersonId ||
    // !selectedItem.requirements_responsiblePersonName ||
    // !selectedItem.requirements_remarks ||
    // !selectedItem.expirationDate ||
    // !selectedItem.requirements_itemList.length;

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
                     
                >
                    {/* Filters */}
                     <div style={{width:'180px'}} className="mb-8px">
                            <Input
                               
                                    type="month"
                                variation="quiet"
                                size="small"
                                placeholder="Deadline"
                                isRequired={true}
                                value={filters.date}
                                onChange={e =>
                                    setFilters((prev)=>({...prev,date: e.target.value})
                                      
                                    )
                                }
                            />
                        </div>
                </UserListItems>
                <PaginationControls
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                />
            </div>

            {isModalOpen && (
                <Modal
                    onCloseHander={handleCloseModal}
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>
                        <div className="mb-8px selectSearch">
                            <Heading>Sales Man</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.salesManPerformance_salesManName}#${selectedItem.salesManPerformance_salesManId}`}
                                // name="Person Name"
                                placeholder="Demand From"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'salesManPerformance_salesManName#salesManPerformance_salesManId',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Salary</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Salary"
                                isRequired={true}
                                value={selectedItem.salesManPerformance_salary}
                                onChange={e =>
                                    updateField(
                                        +e.target.value,
                                        'salesManPerformance_salary'
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
                                value={selectedItem.salesManPerformance_expense}
                                onChange={e =>
                                    updateField(
                                        +e.target.value,
                                        'salesManPerformance_expense'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Total Expense</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Total Expense"
                                isRequired={true}
                                value={
                                    selectedItem.salesManPerformance_salary +
                                    selectedItem.salesManPerformance_expense
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Sales in Rupees</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Sales in Rupees"
                                isRequired={true}
                                value={
                                    selectedItem.salesManPerformance_salesInRupees
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'salesManPerformance_salesInRupees'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Sales in kgs</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Sales in kgs"
                                isRequired={true}
                                value={
                                    selectedItem.salesManPerformance_salesInKgs
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'salesManPerformance_salesInKgs'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Add Sku's</Heading>
                            {selectedItem.salesManPerformance_skus?.map(
                                (item, index) => (
                                    <div
                                        style={{
                                            border: '0px solid #666',
                                            borderRadius: '12px',
                                            marginBottom: '6px',
                                            padding: '6px'
                                        }}
                                        key={index}
                                    >
                                        <Heading
                                            style={{ width: '100%' }}
                                            className="flexbox-between"
                                        >
                                            <span>sku {index + 1}</span>
                                            <span
                                                style={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    handleRemoveItem(index)
                                                }
                                            >
                                                {' '}
                                                Ⓧ
                                            </span>
                                        </Heading>
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                borderTop: '1px solid #666'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '50%',
                                                    borderRight:
                                                        '1px solid #666'
                                                }}
                                                className="mb-8px"
                                            >
                                                <Heading
                                                    style={{
                                                        margin:
                                                            '6px 0px 12px 0px',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    sku
                                                </Heading>
                                                <Input
                                                    type="number"
                                                    variation="quiet"
                                                    size="small"
                                                    placeholder="sku"
                                                    isRequired={true}
                                                    value={item.sku}
                                                    onChange={e =>
                                                        handleItemChange(
                                                            index,
                                                            'sku',
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div
                                                style={{ width: '50%' }}
                                                className="mb-8px"
                                            >
                                                <Heading
                                                    style={{
                                                        margin:
                                                            '6px 0px 12px 0px',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    target
                                                </Heading>
                                                <Input
                                                    type="number"
                                                    variation="quiet"
                                                    size="small"
                                                    placeholder="target"
                                                    isRequired={true}
                                                    value={item.target}
                                                    onChange={e =>
                                                        handleItemChange(
                                                            index,
                                                            'target',
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            <ModalButton onClick={handleAddItem}>
                                + Add Requirement
                            </ModalButton>
                        </div>

                        <div className="mb-8px">
                            <Heading>Total</Heading>
                            <Input
                                  type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Total"
                                isRequired={true}
                                value={selectedItem?.salesManPerformance_skus?.reduce(
                                    (
                                        acc: number,
                                        curr: { sku: number; target: number }
                                    ) => acc + curr.sku,
                                    0
                                )}
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Averge Expense Amount</Heading>
                            <Input
                                 type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Averge Expense Amount"
                                isRequired={true}
                                value={
                                    (((selectedItem.salesManPerformance_salary +
                                        selectedItem.salesManPerformance_expense) /
                                        selectedItem.salesManPerformance_salesInRupees) *
                                    100).toFixed(2)
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Averge Expense Weight</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Averge Expense Weight"
                                isRequired={true}
                                value={
                                    (( selectedItem.salesManPerformance_salary +
                                        selectedItem.salesManPerformance_expense) /
                                    selectedItem?.salesManPerformance_skus?.reduce(
                                        (
                                            acc: number,
                                            curr: {
                                                sku: number;
                                                target: number;
                                            }
                                        ) => acc + curr.sku,
                                        0
                                    )).toFixed(2)
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

export default SalesManPerformance;
