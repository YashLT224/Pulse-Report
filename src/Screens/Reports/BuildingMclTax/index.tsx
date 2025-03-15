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
const heading = 'Building MCL Tax';
const idField='formId';

type Form = Schema['Form']['type'];

const BuildingMCLTax = () => {
    const { userProfile, client } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [isUpdateMode, setUpdateMode] = useState(false);


    // Define columns for the People | Party list
    const itemsColumns = [
     
      {
          key: 'buildingMclTax_buildingName',
          header: 'Building Name'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'buildingMclTax_buildingTax',
          header: 'Building Tax'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
        key: 'buildingMclTax_dueDate',
        header: 'Due Date'
        // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
    },
      {
          key: 'buildingMclTax_taxType',
          header: 'Tax Type'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
      {
          key: 'buildingMclTax_status',
          header: 'Status'
          // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
      },
    
    {
      key: 'buildingMclTax_paidDate',
      header: 'Paid On'
      // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
  },
  {
    key: 'buildingMclTax_documentFileNo',
    header: 'Document File No.'
    // render: (item: Entity) => new Date(item.createdAt).toLocaleString()
},
{
    key: 'createdAt',
    header: 'Created At',
    render: (item: Form) => new Date(item.createdAt).toLocaleString()
},
  ];

     // fetch function for usePagination
     const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                formType: 'buildingMclTax#active',
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

const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  

const addNewItemHandler = () => {
    setUpdateMode(false);
    setIsModalOpen(true);
    setSelectedItem({
        buildingMclTax_buildingName: '',
        buildingMclTax_buildingTax: 0,
        buildingMclTax_dueDate: formatDateForInput(new Date()),
        buildingMclTax_taxType: '',
        buildingMclTax_status: 'pending',
        buildingMclTax_paidDate: formatDateForInput(new Date()),
        buildingMclTax_documentFileNo: '',
    });
};


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = () => {
        setSelectedItem(item);
        setUpdateMode(true);
        setIsModalOpen(true);
    };

    const onEdit = async (editedForm: Form) => {
        const { createdAt, updatedAt, ...expenseForm } = editedForm;
        if (isUpdateMode) {
            const params: any = {
                ...expenseForm,
                updatedAt: new Date().toISOString(),
                updatedById: userProfile.userId
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
                formType: 'buildingMclTax#active',
                state: 'active',
                createdById: userProfile.userId
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

    const updateField = (value: any, key: string,ismultiValue=false) => {
        if(!ismultiValue){
            setSelectedItem((prev: any) => ({ ...prev, [key]: value }));
        }
        else{
            let keys= key.split('#')
            let values= value.split('#')
            setSelectedItem((prev: any) => ({ ...prev, [keys[0]]: values[0],[keys[1]]: values[1] }));
        }
    }

 
    const isSubmitDisabled =
    !selectedItem.buildingMclTax_buildingName ||
    !selectedItem.buildingMclTax_taxType ||
    selectedItem.buildingMclTax_buildingTax === '' ||
    !selectedItem.buildingMclTax_status ||
    !selectedItem.buildingMclTax_documentFileNo;
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
                                placeholder="buildingName"
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
                                placeholder="buildingTax"
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
                                placeholder="dueDate"
                                isRequired={true}
                                value={selectedItem.buildingMclTax_dueDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'buildingMclTax_dueDate'
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
                                placeholder="taxType"
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
                                    updateField(e.target.value, 'buildingMclTax_status')
                                }
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </SelectField>
                        </div>
                        <div className="mb-8px">
                            <Heading>Paid Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Payment"
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
                                value={selectedItem.buildingMclTax_documentFileNo}
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
  )
}

export default BuildingMCLTax
