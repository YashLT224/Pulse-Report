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

const LIMIT = 10; // Number of items to display per page
const heading = 'Requirements';
const idField='formId';
const ExpenseReport = () => {
  const { client } = useAuth();

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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = () => {};


 
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
        </>
  )
}

export default ExpenseReport
