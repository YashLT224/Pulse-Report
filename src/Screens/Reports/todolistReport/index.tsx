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
import { ModalButton, Heading } from '../../../style';
import SelectSearch from 'react-select-search';
import { toDoList_itemsColumns as itemsColumns } from '../../../data/forms';

const LIMIT = 10; // Number of items to display per page
const heading = 'Todo List';
const idField = 'formId';
const FORM_TYPE = 'toDoList';

type Form = Schema['Form']['type'];

const ToDoList = () => {
    const { userProfile, client, isAdmin, formAccess } = useAuth();
    const accessType = isAdmin
        ? 'update'
        : formAccess[FORM_TYPE]?.toLowerCase();
    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all'
    });
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyItems, setHistoryItems] = useState<Form[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                formType: `${FORM_TYPE}#active`,
                nextToken: token,
                limit,
                sortDirection: 'DESC',
                ...(!isAdmin && {
                    formType: undefined,
                    GSI3PK: `${FORM_TYPE}#${userProfile.userId}#active`
                })
            };
            if (filters.status !== 'all') {
                delete params.formType;
                params[isAdmin ? 'GSI1PK' : 'GSI4PK'] = `${FORM_TYPE}#${
                    !isAdmin ? `${userProfile.userId}#` : ''
                }${filters.status}#active`;
            }

            const response =
                filters.status === 'all'
                    ? await client.models.Form[
                          isAdmin ? 'listFormByType' : 'listByGSI3'
                      ](params)
                    : await client.models.Form[
                          isAdmin ? 'listByGSI1' : 'listByGSI4'
                      ](params);

            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form, filters.status, isAdmin, userProfile.userId]
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
        stopLoding,
        updateItem,
        refreshList
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
            toDoList_assignName: '',
            toDoList_assignId: '',
            toDoList_jointAssignName: '',
            toDoList_jointAssignId: '',
            toDoList_jointWork: 'yes',
            toDoList_work: '',
            expirationDate: formatDateForInput(new Date()),
            toDoList_reportToName: '',
            toDoList_reportToId: '',
            toDoList_workStatus: 'pending',
            toDoList_nextDate: formatDateForInput(new Date()),
            toDoList_remarks: ''
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
        if (editedForm.toDoList_jointWork !== 'yes') {
            editedForm.toDoList_jointAssignId = null;
            editedForm.toDoList_jointAssignName = null;
        }

        const {
            createdAt,
            updatedAt,
            hasExpiration,
            formType,
            state,
            createdBy,
            updatedBy,
            expirationDate,
            ...restForm
        } = editedForm;

        const originalItem = items.find(
            item => item[idField] === editedForm[idField]
        );

        const formId = ulid();
        const GSI1PK = `${FORM_TYPE}#${restForm.toDoList_workStatus}#active`;
        const GSI1SK_Metric = Date.now();
        const GSI2PK = originalItem?.GSI2PK || `${FORM_TYPE}#${formId}`;
        const GSI2SK = new Date().toISOString();
        const GSI3PK = `${FORM_TYPE}#${userProfile.userId}#active`;
        const GSI3SK = new Date().toISOString();
        const GSI4PK = `${FORM_TYPE}#${userProfile.userId}#${restForm.toDoList_workStatus}#active`;
        const GSI4SK = new Date().toISOString();

        // Check if we need to create a new record instead of updating
        const hasStatusChanged =
            isUpdateMode && // It's an update but status changed
            originalItem?.toDoList_workStatus !==
                editedForm.toDoList_workStatus;
        const shouldCreateNewRecord = !isUpdateMode || hasStatusChanged; // It's a new record or status has changed

        if (shouldCreateNewRecord) {
            // Create a new record params
            const newParams: any = {
                ...restForm,
                [idField]: formId,
                createdAt: new Date().toISOString(),
                formType: `${FORM_TYPE}#active`,
                state: 'active',
                createdBy: userProfile.userId,
                createdByName: userProfile.userName,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName: userProfile.userName,
                expirationDate: editedForm.expirationDate || null,
                hasExpiration: editedForm.expirationDate ? 'yes#active' : null,
                GSI1PK,
                GSI1SK_Metric,
                GSI2PK,
                GSI2SK,
                GSI3PK,
                GSI3SK,
                GSI4PK,
                GSI4SK,
                ...(hasStatusChanged && {
                    toDoList_originalId:
                        originalItem?.toDoList_originalId ||
                        originalItem?.[idField],
                    toDoList_workStatusChangeFrom:
                        originalItem?.toDoList_workStatus
                })
            };
            // Update record params
            const updatedParams: any = {
                [idField]: editedForm[idField],
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName: userProfile.userName,
                toDoList_workStatusChangeTo: editedForm.toDoList_workStatus,
                toDoList_workStatusChangeDate: new Date().toISOString(),
                toDoList_workStatusChangeBy: userProfile.userId,
                toDoList_workStatusChangeByName: userProfile.userName,
                state: 'inactive',
                formType: `${FORM_TYPE}#inactive`,
                GSI1PK: `${FORM_TYPE}#${originalItem?.toDoList_workStatus}#inactive`,
                GSI3PK: `${FORM_TYPE}#${userProfile.userId}#inactive`,
                GSI4PK: `${FORM_TYPE}#${userProfile.userId}#${originalItem?.toDoList_workStatus}#inactive`,
                hasExpiration: null
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
                updatedByName: userProfile.userName,
                expirationDate: editedForm.expirationDate || null,
                hasExpiration: editedForm.expirationDate ? 'yes#active' : null
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

    const isSubmitDisabled =
        !selectedItem.toDoList_assignName ||
        !selectedItem.toDoList_assignId ||
        !selectedItem.toDoList_jointWork ||
        (selectedItem.toDoList_jointWork === 'yes' &&
            (!selectedItem.toDoList_jointAssignName ||
                !selectedItem.toDoList_jointAssignId)) ||
        !selectedItem.toDoList_work ||
        !selectedItem.toDoList_reportToName ||
        !selectedItem.toDoList_reportToId ||
        !selectedItem.toDoList_workStatus ||
        !selectedItem.toDoList_nextDate ||
        !selectedItem.toDoList_remarks ||
        !selectedItem.expirationDate;

    const handleHistory = async (item: any) => {
        setIsHistoryLoading(true);
        setIsHistoryModalOpen(true);

        try {
            const response = await client.models.Form.listByGSI2({
                GSI2PK: item.GSI2PK,
                sortDirection: 'DESC',
                limit: 100
            } as any);
            setHistoryItems(response.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsHistoryLoading(false);
        }
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
                <UserListItems
                    heading={heading}
                    items={items}
                    columns={itemsColumns}
                    addNewEntryAccess={accessType !== 'read'}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                    handleHistory={handleHistory}
                    haveHistory={true}
                    haveEditAccess={accessType === 'update'}
                >
                    {/* Filters */}
                    <div style={{ width: '200px' }}>
                        <SelectField
                            label=""
                            value={filters.status}
                            onChange={e => {
                                setFilters(prev => ({
                                    ...prev,
                                    status: e.target.value
                                }));
                            }}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                        </SelectField>
                    </div>
                </UserListItems>

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
                        <div className="mb-8px selectSearch">
                            <Heading>
                                Assign<span className="textRed">*</span>
                            </Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.toDoList_assignName}#${selectedItem.toDoList_assignId}`}
                                // name="Person Name"
                                placeholder="Assign To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'toDoList_assignName#toDoList_assignId',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Joint Work</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.toDoList_jointWork}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'toDoList_jointWork'
                                    )
                                }
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </SelectField>
                        </div>

                        {selectedItem.toDoList_jointWork === 'yes' && (
                            <div className="mb-8px selectSearch">
                                <Heading>Joint Assign</Heading>
                                {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                                <SelectSearch
                                    search={true}
                                    options={personsList}
                                    value={`${selectedItem.toDoList_jointAssignName}#${selectedItem.toDoList_jointAssignId}`}
                                    // name="Person Name"
                                    placeholder="Joint Assign To"
                                    onChange={selectedValue => {
                                        updateField(
                                            selectedValue,
                                            'toDoList_jointAssignName#toDoList_jointAssignId',
                                            true
                                        );
                                    }}
                                />
                            </div>
                        )}

                        <div className="mb-8px">
                            <Heading>
                                Work<span className="textRed">*</span>
                            </Heading>
                            <Input
                            disabled={
                                isUpdateMode&&!isAdmin
                            }
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Work"
                                value={selectedItem.toDoList_work}
                                onChange={e =>
                                    updateField(e.target.value, 'toDoList_work')
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Due Date<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Due Date"
                                  min={formatDateForInput(new Date())}
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
                            <Heading>
                                Report To<span className="textRed">*</span>
                            </Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.toDoList_reportToName}#${selectedItem.toDoList_reportToId}`}
                                // name="Person Name"
                                placeholder="Report To"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'toDoList_reportToName#toDoList_reportToId',
                                        true
                                    );
                                }}
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Work Status</Heading>
                            <SelectField
                                disabled={
                                    !!selectedItem.toDoList_workStatusChangeDate
                                }
                                label=""
                                value={selectedItem.toDoList_workStatus}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'toDoList_workStatus'
                                    )
                                }
                            >
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
                            </SelectField>
                        </div>
                        <div className="mb-8px">
                            <Heading>
                                Next Date<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Next Date"
                                isRequired={true}
                                value={selectedItem.toDoList_nextDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'toDoList_nextDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Remarks<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Remarks"
                                isRequired={true}
                                value={selectedItem.toDoList_remarks}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'toDoList_remarks'
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

            {isHistoryModalOpen && (
                <Modal
                    onCloseHandler={() => setIsHistoryModalOpen(false)}
                    heading="History"
                    isViewMode={true}
                >
                    {isHistoryLoading ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '20px'
                            }}
                        >
                            <Loader size="large" />
                        </div>
                    ) : (
                        <UserListItems
                            heading="History"
                            items={historyItems}
                            columns={itemsColumns}
                            haveEditAccess={false}
                            addNewEntryAccess={false}
                        />
                    )}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '15px'
                        }}
                    >
                        <ModalButton
                            onClick={() => setIsHistoryModalOpen(false)}
                        >
                            Close
                        </ModalButton>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ToDoList;
