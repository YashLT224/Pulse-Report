import { useCallback } from 'react';
import { Loader } from '@aws-amplify/ui-react';
import useAuth from '../../Hooks/useAuth';
import { Schema } from '../../../amplify/data/resource';
import { usePagination } from '../../Hooks/usePagination';
import UserListItems from '../../components/UserList';
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

    const allowedForms = userProfile?.allowedForms || [];
    const userRole = userProfile?.role || [];
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
            const synchronisedData = formatDataByFormType(response.data);
            return {
                data: [synchronisedData],
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form, endDate, startDate]
    );

    // Use the usePagination hook
    const { items, isLoading } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm,
        idField
    });

    console.log(items);
    const hasFormAccess = form => {
        return userRole === 'admin' || allowedForms?.includes(form);
    };

    function validEntry(item, formType) {
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
    function formatDataByFormType(data) {
        // Initialize an empty result object
        const result = {};

        // Iterate through each data item
        data.forEach(item => {
            const formType = item.formType.split('#')[0];

            // If this formType doesn't exist in the result yet, create an empty array
            if (!result[formType] && hasFormAccess(formType)) {
                result[formType] = [];
            }

            // Push the current item to the appropriate array
            result[formType] &&
                validEntry(item, formType) &&
                result[formType].push(item);
        });

        return result;
    }

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
                    {Object.keys(items?.[0] || []).map(formName => {
                        return (
                            <>
                                {items?.[0][formName].length > 0 ? (
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
                                            items={items?.[0][formName]}
                                            columns={
                                                formColumns[formName].columns
                                            }
                                            addNewEntryAccess={false}
                                            handleEdit={() => {}}
                                        ></UserListItems>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Alerts;
