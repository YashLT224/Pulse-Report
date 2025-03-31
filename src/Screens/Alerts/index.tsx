import { useCallback,useState } from 'react';
import useAuth from '../../Hooks/useAuth';
import { Schema } from '../../../amplify/data/resource';
import { usePagination } from '../../Hooks/usePagination';

const LIMIT = 1000; // Number of items to display per page
const heading = 'Alerts';
const idField = 'formId';
type Form = Schema['Form']['type'];

const Alerts = () => {
    const { userProfile, client } = useAuth();
    const [alertsList,setAlertList]=useState({})

    const allowedForms = userProfile?.allowedForms || [];
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
            setAlertList(formatDataByFormType(response.data))
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


const hasFormAccess=(form)=>{
  return (allowedForms?.includes(form))
} 


function validEntry(item, formType){

    switch(formType){
        case 'buildingInsurance':
            return item.buildingInsurance_status==='PENDING'

            case 'buildingMclTax':
            return item.buildingMclTax_status==='PENDING'
    }

}
    function formatDataByFormType(data) {
        // Initialize an empty result object
        const result = {};
        
        // Iterate through each data item
        data.forEach(item => {
          const formType = item.formType.split('#')[0];
          
          // If this formType doesn't exist in the result yet, create an empty array
          if (!result[formType]&& hasFormAccess(formType)) {
            result[formType] = [];
          }
          
          // Push the current item to the appropriate array
          result[formType]&&validEntry(item,formType)&&result[formType].push(item);
        });
        
        return result;
      }


    return (
        <div>
            <pre>{JSON.stringify(items, null, 2)}</pre>
        </div>
    );
};

export default Alerts;
