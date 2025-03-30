import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input,SelectField } from '@aws-amplify/ui-react';
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
const heading = 'Document File Status';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = ' documentFileStatus';
const DocumentFileStatus = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    const itemsColumns = [
      {
        key: 'createdAt',
        header: 'Created At',
        render: (item: Form) => new Date(item.createdAt).toLocaleString()
    },
        {
            key: 'documentFileStatus_inDate_outDate',
            header: 'In Date/ Out Date'
        },
        {
            key: 'documentFileStatus_fileName',
            header: 'File Name'
        },

        {
            key: 'documentFileStatus_documentName',
            header: 'Document Name'
        },
        {
            key: 'documentFileStatus_year',
            header: 'Year'
        },

        {
            key: 'documentFileStatus_window',
            header: 'Window'
        },
        {
            key: 'documentFileStatus_documentType',
            header: 'Document Type'
        },

        {
            key: 'documentFileStatus_fileNo',
            header: 'File No'
        },
        {
          key: 'documentFileStatus_status',
          header: 'Status'
      },
        {
          key: 'expirationDate',
          header: 'Date Expiry'
      },
        {
            key: 'documentFileStatus_receivedFrom_givenByName',
            header: 'Received From/ Given By'
        },
        {
            key: 'documentFileStatus_receivedBy_givenToName',
            header: 'Received By/ Given To'
        },
        {
            key: 'documentFileStatus_remarks',
            header: 'remarks'
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



  const addNewItemHandler = () => {
    setUpdateMode(false);
    setIsModalOpen(true);
    setSelectedItem({
      documentFileStatus_inDate_outDate:  formatDateForInput(new Date()),
      documentFileStatus_fileName: '',
      documentFileStatus_documentName:'',
      documentFileStatus_year:'',
      documentFileStatus_window:'',
      documentFileStatus_documentType:'',
      documentFileStatus_fileNo:'',
      expirationDate: formatDateForInput(new Date()),
      documentFileStatus_receivedFrom_givenById: '',
        documentFileStatus_receivedFrom_givenByName: '',
        documentFileStatus_receivedBy_givenToId: '',
        documentFileStatus_receivedBy_givenToName: '',
        documentFileStatus_remarks: '',
        documentFileStatus_status:'in'
    });
};


const handleAddItem = () => {
  setSelectedItem(prev => ({
      ...prev,
      requirements_itemList: [
          ...prev.requirements_itemList,
          { itemName: '', itemQuantity: 0, itemPrice: 0 }
      ]
  }));
};




    // Update a specific item in the list
    const handleItemChange = (index, field, value) => {
      setSelectedItem(prev => {
          const updatedItems = [...prev.requirements_itemList];
          updatedItems[index] = {
              ...updatedItems[index],
              [field]: value
          };
          return {
              ...prev,
              requirements_itemList: updatedItems
          };
      });
  };


      // Remove an item from the list
      const handleRemoveItem = (index: number) => {
        setSelectedItem(prev => ({
            ...prev,
            requirements_itemList: prev.requirements_itemList.filter(
                (_, i) => i !== index
            )
        }));
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
        hasExpiration,
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

const isSubmitDisabled =false
// !selectedItem.requirements_demandFromId ||
// !selectedItem.requirements_demandFromName ||
// !selectedItem.requirements_responsiblePersonId ||
// !selectedItem.requirements_responsiblePersonName ||
// !selectedItem.requirements_remarks ||
// !selectedItem.expirationDate ||
// !selectedItem.requirements_itemList.length;


    return <>
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
                    onCloseHander={handleCloseModal}
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>



                    <div className="mb-8px">
                            <Heading>In Date/ Out Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Deadline"
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
                            <Heading>File Name</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="File Name"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_fileName}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_fileName'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Document Name</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Document Name"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_documentName}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_documentName'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Year</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Document Name"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_year}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_year'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Window</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Window"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_window}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_window'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Document Type</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Document Type"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_documentType}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_documentType'
                                    )
                                }
                            />
                        </div>


                        <div className="mb-8px">
                            <Heading>File No</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="File No"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_fileNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_fileNo'
                                    )
                                }
                            />
                        </div>


                        <div className="mb-8px">
                            <Heading>File No</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="File No"
                                isRequired={true}
                                value={selectedItem.documentFileStatus_fileNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_fileNo'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Status</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.documentFileStatus_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_status'
                                    )
                                }
                            >
                                <option value="in">In</option>
                                <option value="out">Out</option>
                            </SelectField>
                        </div>

                        <div className="mb-8px">
                            <Heading>Date Expiry</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Deadline"
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

                        <div className="mb-8px selectSearch">
                            <Heading>Received From/ Given By</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.documentFileStatus_receivedFrom_givenByName}#${selectedItem.documentFileStatus_receivedFrom_givenById}`}
                                // name="Person Name"
                                placeholder="Responsible Person"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'documentFileStatus_receivedFrom_givenByName#documentFileStatus_receivedFrom_givenById',
                                        true
                                    );
                                }}
                            />
                        </div>

                        <div className="mb-8px selectSearch">
                            <Heading>Received By/ Given To</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.documentFileStatus_receivedBy_givenToName}#${selectedItem.documentFileStatus_receivedBy_givenToId}`}
                                // name="Person Name"
                                placeholder="Received By/ Given To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'documentFileStatus_receivedBy_givenToName#documentFileStatus_receivedBy_givenToId',
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
                                value={selectedItem.documentFileStatus_remarks}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_remarks'
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
};

export default DocumentFileStatus;
