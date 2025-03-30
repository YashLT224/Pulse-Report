import { useCallback } from 'react';
import useAuth from '../../Hooks/useAuth';
import { Schema } from '../../../amplify/data/resource';
import { usePagination } from '../../Hooks/usePagination';

const LIMIT = 1000; // Number of items to display per page
const heading = 'Alerts';
const idField = 'formId';
type Form = Schema['Form']['type'];

const Alerts = () => {
    const { userProfile, client } = useAuth();

    const allowedForms = userProfile?.allowedForms || [];
    const now = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(now.getDate() + 5);

    const startDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const endDate = fiveDaysLater.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                hasExpiration: 'yes#active',
                expirationDate: { between: [startDate, endDate] },
                nextToken: token,
                limit,
                sortDirection: 'DESC'
            };
            const response = await client.models.Form.list(params);
            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form, endDate, startDate]
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

    return (
        <div>
            <pre>{JSON.stringify(items, null, 2)}</pre>
        </div>
    );
};

export default Alerts;
