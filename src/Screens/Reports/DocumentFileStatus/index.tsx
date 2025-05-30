import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import SelectSearch from 'react-select-search';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import { formatDateForInput } from '../../../utils/helpers';
import {documentFileStatus_itemsColumns as itemsColumns} from '../../../data/forms'


const LIMIT = 10; // Number of items to display per page
const heading = 'Document File Status';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = 'documentFileStatus';
const DocumentFileStatus = () => {
    const { userProfile, client,isAdmin,formAccess } = useAuth();
    const accessType=isAdmin?'update': formAccess[FORM_TYPE]?.toLowerCase()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

 

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
            documentFileStatus_inDate_outDate: formatDateForInput(new Date()),
            documentFileStatus_fileName: '',
            documentFileStatus_documentName: '',
            documentFileStatus_year: '',
            documentFileStatus_window: '',
            documentFileStatus_documentType: '',
            documentFileStatus_fileNo: '',
            // Expiration Date is optional for Document File Status
            // expirationDate: formatDateForInput(new Date()),
            documentFileStatus_receivedFrom_givenById:  userProfile?.userId,
            documentFileStatus_receivedFrom_givenByName: userProfile?.userName,
            documentFileStatus_receivedBy_givenToId: '',
            documentFileStatus_receivedBy_givenToName: '',
            documentFileStatus_remarks: '',
            documentFileStatus_status: 'in'
        });
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
            expirationDate,
            GSI1PK,
            GSI1SK_Metric,
            ...restForm
        } = editedForm;

        // Check if we need to create a new record instead of updating
        const hasStatusChanged =
            isUpdateMode && // It's an update but status changed
            items.find(item => item[idField] === editedForm[idField])
                ?.documentFileStatus_status !==
                editedForm.documentFileStatus_status;
        const shouldCreateNewRecord = !isUpdateMode || hasStatusChanged; // It's a new record or status has changed

        if (shouldCreateNewRecord) {
            // Create a new record params
            const newParams: any = {
                ...restForm,
                [idField]: ulid(),
                createdAt: new Date().toISOString(),
                formType: `${FORM_TYPE}#active`,
                state: 'active',
                createdBy: userProfile.userId,
                createdByName:userProfile.userName,
                expirationDate: expirationDate || null,
                hasExpiration: expirationDate ? 'yes#active' : null
            };
            // Update record params
            const updatedParams: any = {
                [idField]: editedForm[idField],
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName:userProfile.userName,
                documentFileStatus_statusChangeDate: new Date().toISOString()
            };
            const promises = [
                client.models.Form.create(newParams),
                ...(hasStatusChanged
                    ? [client.models.Form.update(updatedParams)]
                    : [])
            ];

            initiateLoding();

            Promise.all(promises)
                .then(() => {
                    refreshList();
                })
                .catch(error => {
                    console.error(`Failed to create ${heading}:`, error);
                    stopLoding();
                });
        } else {
            // Update existing record
            const params: any = {
                ...restForm,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName:userProfile.userName,
                expirationDate: expirationDate || null,
                hasExpiration: expirationDate ? 'yes#active' : null
            };
            updateItem(editedForm);

            client.models.Form.update(params).catch(error => {
                console.error(`Failed to update ${heading}:`, error);
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

    console.log(selectedItem)
    const isSubmitDisabled =
        !selectedItem.documentFileStatus_status ||
        !selectedItem.documentFileStatus_inDate_outDate ||
        !selectedItem.documentFileStatus_fileName ||
        // !selectedItem.documentFileStatus_documentName ||
        !selectedItem.documentFileStatus_year ||
        !selectedItem.documentFileStatus_window ||
        !selectedItem.documentFileStatus_documentType ||
        !selectedItem.documentFileStatus_fileNo ||
        !selectedItem.documentFileStatus_receivedFrom_givenById ||
        !selectedItem.documentFileStatus_receivedFrom_givenByName ||
        !selectedItem.documentFileStatus_receivedBy_givenToId ||
        !selectedItem.documentFileStatus_receivedBy_givenToName ||
        !selectedItem.documentFileStatus_remarks;

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
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                    haveEditAccess={accessType==='update'}
                    addNewEntryAccess={accessType!=='read'}
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
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>Status</Heading>
                            <SelectField
                                disabled={
                                    !!selectedItem.documentFileStatus_statusChangeDate
                                }
                                label=""
                                value={selectedItem.documentFileStatus_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_status'
                                    )
                                }
                            >
                                <option value="in">In File</option>
                                <option value="out" disabled={!isUpdateMode}>
                                    Out File
                                </option>
                            </SelectField>
                        </div>

                        <div className="mb-8px">
                            <Heading>In Date / Out Date<span className='textRed'>*</span></Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="In Date / Out Date"
                                isRequired={true}
                                value={
                                    selectedItem.documentFileStatus_inDate_outDate
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_inDate_outDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>File Name<span className='textRed'>*</span></Heading>
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

                        {/* <div className="mb-8px">
                            <Heading>Document Name</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Document Name"
                                isRequired={true}
                                value={
                                    selectedItem.documentFileStatus_documentName
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_documentName'
                                    )
                                }
                            />
                        </div> */}

                        <div className="mb-8px">
                            <Heading>File Year<span className='textRed'>*</span></Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Year"
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
                            <Heading>Window Name<span className='textRed'>*</span></Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Window Name"
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
                            <Heading>Document Type<span className='textRed'>*</span></Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Document Type"
                                isRequired={true}
                                value={
                                    selectedItem.documentFileStatus_documentType
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'documentFileStatus_documentType'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>File No.<span className='textRed'>*</span></Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="File No."
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
                            <Heading>Date Expiry<span className='textRed'>*</span></Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Date Expiry"
                                // isRequired={true}
                                value={selectedItem.expirationDate}
                                min={formatDateForInput(new Date())}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expirationDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px selectSearch">
                            <Heading>Received From / Given By<span className='textRed'>*</span></Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            {/* <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.documentFileStatus_receivedFrom_givenByName}#${selectedItem.documentFileStatus_receivedFrom_givenById}`}
                                // name="Person Name"
                                placeholder="Received From / Given By"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'documentFileStatus_receivedFrom_givenByName#documentFileStatus_receivedFrom_givenById',
                                        true
                                    );
                                }}
                            /> */}
                              <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Received From / Given By"
                                // isRequired={true}
                                value={selectedItem.documentFileStatus_receivedFrom_givenByName}
                                 
                            />
                        </div>

                        <div className="mb-8px selectSearch">
                            <Heading>Received By / Given To<span className='textRed'>*</span></Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.documentFileStatus_receivedBy_givenToName}#${selectedItem.documentFileStatus_receivedBy_givenToId}`}
                                // name="Person Name"
                                placeholder="Received By / Given To"
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
                            <Heading>Remarks<span className='textRed'>*</span></Heading>
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
    );
};

export default DocumentFileStatus;
