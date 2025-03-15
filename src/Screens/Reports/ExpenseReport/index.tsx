import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ulid } from 'ulid';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import SelectSearch from 'react-select-search';

const LIMIT = 10; // Number of items to display per page
const heading = 'Requirements';
const idField='formId';


const ExpenseReport = () => {
  const { client } = useAuth();

  const personsList = useSelector(
    (state: any) => state.globalReducer.persons
);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [isUpdateMode, setUpdateMode] = useState(false);
    // Define columns for the People | Party list
    const itemsColumns = [
      {
          key: 'createdAt',
          header: 'Created At'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'personName',
          header: 'Person Name'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'workAssign',
          header: 'Work Assign'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'balanceBF',
          header: 'Balance B/F'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'payment',
          header: 'Payment'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
        key: 'expense',
        header: 'Expense'
        // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
    },
    {
      key: 'balance',
      header: 'Balance'
      // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
  },
  {
    key: 'remarks',
    header: 'Remarks'
    // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
}
  ];

  useEffect(()=>{

  },[])
  // fetch function for usePagination
    const fetchEntity = useCallback(
        async (limit: number, token?: string) => {
            // const params: any = {
            //     entityType,
            //     nextToken: token,
            //     limit,
            //     sortDirection: 'ASC'
            // };
            // const response = await model[listfuncName](params);

            return {
                data:[],
                nextToken:  null
            };
        },
        []
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
    } = usePagination<Entity>({
        limit: LIMIT,
        fetchFn: fetchEntity,
        idField
    });

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            personName:'',
            workAssign:'',
            balanceBF:0,
            payment:0,
            balance:0,
            expense:0,
            remarks:''
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = () => {};
    const handleSave = () => {
        if (!selectedItem) return;
        // onEdit(selectedItem as Entity);
        setIsModalOpen(false);
    };

    const updateField = (value: any, key: string) => {
        // setSelectedItem((prev: any) => ({ ...prev, [key]: value }));
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
                <UserListItems<Entity>
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
                            <SelectSearch
                             search ={true} options={personsList} value={selectedItem.personName} name="person name" placeholder="Choose person" />


                            {/* <Input
                                variation="quiet"
                                size="small"
                                placeholder={'person Name'}
                                value={selectedItem.personName}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        type === 'PEOPLE'
                                            ? 'personName'
                                            : 'partyName'
                                    )
                                }
                            /> */}
                        </div>
                        <div className="mb-8px">
                            <Heading>Work Assign</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="workAssign"
                                value={selectedItem.workAssign}
                                onChange={e =>
                                    updateField(e.target.value, 'phoneNumber')
                                }
                            />
                        </div>
                      
                            <div className="mb-8px">
                                <Heading>Balance B/F</Heading>
                                <Input
                                    type="number"
                                    variation="quiet"
                                    size="small"
                                    placeholder="balance b/f"
                                    isRequired={true}
                                    value={selectedItem.balanceBF}
                                    onChange={e =>
                                        updateField(
                                            e.target.value,
                                            'designation'
                                        )
                                    }
                                />
                            </div>

                            <div className="mb-8px">
                                <Heading>Payment</Heading>
                                <Input
                                    type="number"
                                    variation="quiet"
                                    size="small"
                                    placeholder="payment"
                                    isRequired={true}
                                    value={selectedItem.payment}
                                    onChange={e =>
                                        updateField(
                                            e.target.value,
                                            'designation'
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
                                    placeholder="expense"
                                    isRequired={true}
                                    value={selectedItem.expense}
                                    onChange={e =>
                                        updateField(
                                            e.target.value,
                                            'designation'
                                        )
                                    }
                                />
                            </div>

                            <div className="mb-8px">
                                <Heading>Balance</Heading>
                                <Input
                                    type="number"
                                    variation="quiet"
                                    size="small"
                                    placeholder="balance"
                                    isRequired={true}
                                    value={selectedItem.balance}
                                    onChange={e =>
                                        updateField(
                                            e.target.value,
                                            'designation'
                                        )
                                    }
                                />
                            </div>

                            <div className="mb-8px">
                            <Heading>Remarks</Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder={'remarks'}
                                value={selectedItem.remarks}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        type === 'PEOPLE'
                                            ? 'personName'
                                            : 'partyName'
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
                                // disabled={
                                //     `${selectedItem.phoneNumber}`.length !== 10
                                // }
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
  )
}

export default ExpenseReport
