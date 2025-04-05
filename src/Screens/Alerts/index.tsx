import { useCallback, useState, useMemo } from 'react';
import {
    Loader,
    Input,
    SelectField,
    CheckboxField,
    Message
} from '@aws-amplify/ui-react';
import useAuth from '../../Hooks/useAuth';
import { Schema } from '../../../amplify/data/resource';
import { usePagination } from '../../Hooks/usePagination';
import UserListItems from '../../components/UserList';
import Modal from '../../components/Modal';
import { ModalButton, Heading } from '../../style';
import {
    buildingInsurance_itemsColumns,
    buildingMclTax_itemsColumns,
    documentFileStatus_itemsColumns,
    toDoList_itemsColumns,
    requirements_itemsColumns,
    vehicleReport_itemsColumns,
    vehicleInsurance_itemsColumns
} from '../../data/forms';

const formColumns = {
    buildingInsurance: {
        columns: buildingInsurance_itemsColumns,
        label: 'Building Insurance'
    },
    buildingMclTax: {
        columns: buildingMclTax_itemsColumns,
        label: 'Building MCL Tax'
    },
    documentFileStatus: {
        columns: documentFileStatus_itemsColumns,
        label: 'Document File Status'
    },
    toDoList: { columns: toDoList_itemsColumns, label: 'Todo List' },
    requirements: { columns: requirements_itemsColumns, label: 'Requirements' },
    vehicleReport: {
        columns: vehicleReport_itemsColumns,
        label: 'Vehicle Report'
    },
    vehicleInsurance: {
        columns: vehicleInsurance_itemsColumns,
        label: 'Vehicle Insurance'
    }
};

const LIMIT = 1000; // Number of items to display per page
const idField = 'formId';
type Form = Schema['Form']['type'];

const Alerts = () => {
    const { userProfile, client } = useAuth();
    const [selectedItem, setSelectedItem] = useState({
        data: null,
        formType: null
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const allowedForms = useMemo(() => userProfile?.allowedForms || [], [
        userProfile?.allowedForms
    ]);
    const userRole = useMemo(() => userProfile?.role || [], [
        userProfile?.role
    ]);
    const now = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(now.getDate() + 5000);

    const startDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const endDate = fiveDaysLater.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                hasExpiration: 'yes#active',
                expirationDate: { between: [startDate, endDate] },
                nextToken: token,
                limit
            };
            const response = await client.models.Form.listByExpiration(params);
            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form, endDate, startDate]
    );

    // Use the usePagination hook
    const { items, isLoading, deleteItem } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm,
        idField
    });

    const itemMap = formatDataByFormType({
        data: items,
        userRole,
        allowedForms
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleEdit = item => {
        console.log(item);
        setIsModalOpen(true);
        const formType = item.formType.split('#')[0];
        setSelectedItem({ data: item, formType });
    };

    const updateField = (value: any, key: string, isMultiValue = false) => {
        if (!isMultiValue) {
            setSelectedItem((prev: any) => ({
                ...prev,
                data: { ...prev.data, [key]: value }
            }));
        } else {
            const keys = key.split('#');
            const values = value.split('#');
            setSelectedItem((prev: any) => ({
                ...prev,
                data: {
                    ...prev.data,
                    [keys[0]]: values[0],
                    [keys[1]]: values[1]
                }
            }));
        }
    };

    const onEdit = async (editedForm: any) => {
        const formType = editedForm.formType.split('#')[0];
        const params: any = {
            formId: editedForm.data.formId,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: userProfile.userId,
            ...(formType === 'buildingInsurance' && {
                buildingInsurance_status: 'PAID'
            }),
            ...(formType === 'buildingMclTax' && {
                buildingMclTax_status: 'PAID'
            }),
            ...(formType === 'toDoList' && {
                toDoList_workStatus: 'completed'
            }),
            ...(formType === 'vehicleReport' && {
                vehicleReport_status: 'COMPLETED'
            })
        };
        deleteItem(editedForm.data);
        client.models.Form.update(params).catch(error => {
            console.error(`Failed to update ${formType}:`, error);
        });
    };

    const handleComplete = e => {
        e.preventDefault();
        onEdit(selectedItem);
        setIsModalOpen(false);
        setIsChecked(false);
    };

    const isModalDisabled =
        !isChecked ||
        (selectedItem?.formType === 'buildingInsurance' &&
            selectedItem?.data?.buildingInsurance_status === 'PENDING');

    return (
        <>
            <div style={{ position: 'relative' }}>
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 100,
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
                <div>
                    {!isLoading && Object.keys(itemMap || []).length === 0 ? (
                        <Message
                            variation="filled"
                            colorTheme="info"
                            heading="No Alerts"
                        >
                            There are no pending alerts at this time.
                        </Message>
                    ) : (
                        Object.keys(itemMap || []).map(formName => {
                            return (
                                <>
                                    {itemMap[formName].length > 0 ? (
                                        <div
                                            style={{
                                                border: '1px solid black',
                                                marginBottom: '12px',
                                                padding: '12px',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <UserListItems<Form>
                                                heading={
                                                    formColumns[formName].label
                                                }
                                                items={itemMap[formName]}
                                                columns={
                                                    formColumns[formName]
                                                        .columns
                                                }
                                                addNewEntryAccess={false}
                                                handleEdit={handleEdit}
                                            ></UserListItems>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            );
                        })
                    )}
                </div>
            </div>
            {isModalOpen && (
                <Modal
                    onCloseHander={handleCloseModal}
                    heading={selectedItem.formType}
                    isUpdateMode={true}
                >
                    <form onSubmit={handleComplete}>
                        <ModalData
                            selectedItem={selectedItem}
                            updateField={updateField}
                        />

                        <div className="mb-8px">
                            <CheckboxField
                                name="subscribe-controlled"
                                value="yes"
                                checked={isChecked}
                                onChange={e => setIsChecked(e.target.checked)}
                                label="Please Tick and Confirm"
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
                                disabled={isModalDisabled}
                            >
                                Complete
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

export default Alerts;

const hasFormAccess = ({ formType, userRole, allowedForms }) => {
    return userRole === 'admin' || allowedForms?.includes(formType);
};
function validEntry(item, formType) {
    if (item.completedAt) {
        return false;
    }
    switch (formType) {
        case 'buildingInsurance':
            return item.buildingInsurance_status === 'PENDING';

        case 'buildingMclTax':
            return item.buildingMclTax_status === 'PENDING';
        case 'toDoList':
            return item.toDoList_workStatus !== 'completed';

        default:
            return true;
    }
}

function formatDataByFormType({ data, userRole, allowedForms }) {
    // Initialize an empty result object
    const result = {};

    // Iterate through each data item
    data.forEach(item => {
        const formType = item.formType.split('#')[0];

        // If this formType doesn't exist in the result yet, create an empty array
        if (
            !result[formType] &&
            hasFormAccess({ formType, userRole, allowedForms })
        ) {
            result[formType] = [];
        }

        // Push the current item to the appropriate array
        result[formType] &&
            validEntry(item, formType) &&
            result[formType].push(item);
    });

    return result;
}

function ModalData({ selectedItem, updateField }) {
    switch (selectedItem.formType) {
        case 'buildingInsurance':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Building Name</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            placeholder="Building Name"
                            value={
                                selectedItem.data.buildingInsurance_buildingName
                            }
                        />
                    </div>

                    <div className="mb-8px">
                        <Heading>Status</Heading>
                        <SelectField
                            label=""
                            value={selectedItem.data.buildingInsurance_status}
                            onChange={e =>
                                updateField(
                                    e.target.value,
                                    'buildingInsurance_status'
                                )
                            }
                        >
                            <option value="PAID">Paid</option>
                            <option disabled={true} value="PENDING">
                                Pending
                            </option>
                        </SelectField>
                    </div>
                </div>
            );
        case 'buildingMclTax':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Building Name</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            placeholder="Building Name"
                            value={
                                selectedItem.data.buildingMclTax_buildingName
                            }
                        />
                    </div>

                    <div className="mb-8px">
                        <Heading>Status</Heading>
                        <SelectField
                            label=""
                            value={selectedItem.data.buildingMclTax_status}
                            onChange={e =>
                                updateField(
                                    e.target.value,
                                    'buildingMclTax_status'
                                )
                            }
                        >
                            <option value="PAID">Paid</option>
                            <option disabled={true} value="PENDING">
                                Pending
                            </option>
                        </SelectField>
                    </div>
                </div>
            );
        case 'vehicleInsurance':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Vechile No.</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            placeholder="Building Name"
                            value={selectedItem.data.vehicleInsurance_vehicleNo}
                        />
                    </div>

                    <div className="mb-8px">
                        <Heading>Insurance Expiry</Heading>
                        <Input
                            type="date"
                            variation="quiet"
                            size="small"
                            placeholder="Due Date"
                            isRequired={true}
                            value={selectedItem.data.expirationDate}
                        />
                    </div>
                </div>
            );
        case 'documentFileStatus':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>FileName</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            placeholder="Building Name"
                            value={
                                selectedItem.data.documentFileStatus_fileName
                            }
                        />
                    </div>

                    <div className="mb-8px">
                        <Heading>Status</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            value={selectedItem.data.documentFileStatus_status}
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Date Expiry</Heading>
                        <Input
                            type="date"
                            variation="quiet"
                            size="small"
                            placeholder="Due Date"
                            isRequired={true}
                            value={selectedItem.data.expirationDate}
                        />
                    </div>
                </div>
            );
        case 'requirements':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Demand From</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            value={
                                selectedItem.data.requirements_demandFromName
                            }
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Responsible Person</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            value={
                                selectedItem.data
                                    .requirements_responsiblePersonName
                            }
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Deadline</Heading>
                        <Input
                            type="date"
                            variation="quiet"
                            size="small"
                            placeholder="Due Date"
                            isRequired={true}
                            value={selectedItem.data.expirationDate}
                        />
                    </div>
                </div>
            );
        case 'toDoList':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Assignee</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            value={selectedItem.data.toDoList_assignName}
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Work</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            isRequired={true}
                            value={selectedItem.data.toDoList_work}
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Status</Heading>
                        <SelectField
                            label=""
                            value={selectedItem.data.toDoList_workStatus}
                            onChange={e =>
                                updateField(
                                    e.target.value,
                                    'toDoList_workStatus'
                                )
                            }
                        >
                            <option value="completed">Completed</option>
                            <option disabled={true} value="pending">
                                Pending
                            </option>
                            <option disabled={true} value="inprogress">
                                In Progress
                            </option>
                        </SelectField>
                    </div>
                    <div className="mb-8px">
                        <Heading>Deadline</Heading>
                        <Input
                            type="date"
                            variation="quiet"
                            size="small"
                            placeholder="Due Date"
                            isRequired={true}
                            value={selectedItem.data.expirationDate}
                        />
                    </div>
                </div>
            );
        case 'vehicleReport':
            return (
                <div>
                    <div className="mb-8px">
                        <Heading>Vehicle No.</Heading>
                        <Input
                            variation="quiet"
                            size="small"
                            placeholder="Vehicle No."
                            value={selectedItem.data.vehicleReport_vehicleNo}
                        />
                    </div>
                    <div className="mb-8px">
                        <Heading>Status</Heading>
                        <SelectField
                            label=""
                            value={selectedItem.data.vehicleReport_status}
                            onChange={e =>
                                updateField(
                                    e.target.value,
                                    'vehicleReport_status'
                                )
                            }
                        >
                            <option disabled value="PENDING">
                                Pending
                            </option>
                            <option disabled value="INPROGRESS">
                                In Progress
                            </option>
                            <option value="COMPLETED">Completed</option>
                        </SelectField>
                    </div>
                </div>
            );
    }
}
