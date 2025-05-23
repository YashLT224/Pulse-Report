import { ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a
    .schema({
        File: a.customType({
            key: a.string(),
            type: a.string(),
            name: a.string()
        }),
        ProductEntry: a.customType({
            itemName: a.string(),
            itemPrice: a.float(),
            itemQuantity: a.float()
        }),
        SKU: a.customType({
            sku: a.float(),
            target: a.float()
        }),
        UserProfile: a
            .model({
                userId: a.id().required(),
                createdAt: a.datetime().required(),
                role: a.enum(['admin', 'staff']),
                userName: a.string().required(),
                phoneNumber: a.string().required(),
                allowedForms: a.string().array(),
                access: a.string(), // undefined or 'none'
                status: a.enum(['active', 'inactive'])
            })
            .identifier(['userId'])
            .secondaryIndexes(index => [
                index('role')
                    .sortKeys(['createdAt'])
                    .queryField('listByRole')
                    .name('RoleIndex'),
                index('access')
                    .sortKeys(['createdAt'])
                    .queryField('listByAccess')
                    .name('AccessIndex')
            ])
            .authorization(allow => [
                // Allow admin to perform all operations
                allow.groups(['ADMINS']).to(['read', 'update', 'delete']),
                // Allow staff to read their own profile only
                allow.ownerDefinedIn('userId').to(['read'])
            ]),
        People: a
            .model({
                personId: a.id().required(),
                createdAt: a.datetime(),
                updatedAt: a.datetime(),
                personName: a.string().required(),
                phoneNumber: a.phone().required(), // Enforce uniqueness using the PhoneIndex
                designation: a.string(),
                status: a.enum(['active', 'inactive']),
                entityType: a.string().default('PERSON'), // Constant attribute, e.g., "PERSON"
                isAutoCreated: a.boolean().default(false), // Indicates if created by post-confirmation handler
                balanceBF: a.float().default(0)
            })
            .identifier(['personId'])
            .secondaryIndexes(index => [
                index('entityType')
                    .sortKeys(['personName'])
                    .queryField('listPeopleAllByName')
                    .name('PersonNameIndex'),
                index('status')
                    .sortKeys(['personName'])
                    .queryField('listPeopleByStatus')
                    .name('StatusIndex'),
                index('phoneNumber')
                    .queryField('findPeopleByPhoneNumber')
                    .name('PhoneIndex')
            ])
            .authorization(allow => [
                // Allow admin to perform all operations
                allow
                    .groups(['ADMINS'])
                    .to(['create', 'read', 'update', 'delete']),
                // Allow authenticated users to just read/update people records
                allow.authenticated().to(['read', 'update'])
            ]),
        Party: a
            .model({
                partyId: a.id().required(),
                partyName: a.string().required(),
                phoneNumber: a.phone().required(), // Enforce uniqueness using the PhoneIndex
                city: a.string().required(),
                address: a.string().required(),
                status: a.enum(['active', 'inactive']),
                entityType: a.string().default('PARTY') // Constant attribute, e.g., "PARTY"
            })
            .identifier(['partyId'])
            .secondaryIndexes(index => [
                index('entityType')
                    .sortKeys(['partyName'])
                    .queryField('listPartyAllByName')
                    .name('PartyNameIndex'),
                index('status')
                    .sortKeys(['partyName'])
                    .queryField('listPartyByStatus')
                    .name('StatusIndex'),
                index('phoneNumber')
                    .queryField('findPartyByPhoneNumber')
                    .name('PhoneIndex')
            ])
            .authorization(allow => [
                // Allow admin to perform all operations
                allow
                    .groups(['ADMINS'])
                    .to(['create', 'read', 'update', 'delete']),
                // Allow authenticated users to just read people records
                allow.authenticated().to(['read'])
            ]),
        Form: a
            .model({
                formId: a.id().required(),
                formType: a.string().required(), // Contains both type and state, e.g., 'expenseReport#active'
                state: a.string().default('active'), // e.g., 'active', 'inactive'
                createdAt: a.datetime().required(),
                createdBy: a.string().required(),
                createdByName: a.string(),
                updatedAt: a.datetime(),
                updatedBy: a.string(),
                updatedByName: a.string(),
                hasExpiration: a.string(), // Encodes expiration status and state, e.g., 'yes#active'
                expirationDate: a.date(),
                completedAt: a.datetime(),
                GSI1PK: a.string(), // Partition key for the GSI1
                GSI1SK_Metric: a.float(), // Sort key for the GSI1
                GSI2PK: a.string(), // Partition key for the GSI2
                GSI2SK: a.string(), // Sort key for the GSI2
                GSI3PK: a.string(), // Partition key for the GSI3
                GSI3SK: a.string(), // Sort key for the GSI3
                GSI4PK: a.string(), // Partition key for the GSI4
                GSI4SK: a.string(), // Sort key for the GSI4

                // Expense Report fields
                expenseReport_balanceBF: a.float(),
                expenseReport_payment: a.float(),
                expenseReport_expense: a.float(),
                expenseReport_balance: a.float(),
                expenseReport_remarks: a.string(),
                expenseReport_workAssign: a.string(),
                expenseReport_personId: a.string(),
                expenseReport_personName: a.string(),

                // Building MCL Tax
                buildingMclTax_buildingName: a.string(),
                buildingMclTax_buildingTax: a.float(),
                buildingMclTax_taxType: a.string(),
                buildingMclTax_status: a.enum(['PENDING', 'PAID']),
                buildingMclTax_paidDate: a.date(),
                buildingMclTax_documentFileNo: a.string(),

                // Building Insurance
                buildingInsurance_buildingName: a.string(),
                buildingInsurance_insuranceDate: a.date(),
                buildingInsurance_insureAmount: a.float(),
                buildingInsurance_insuranceAmount: a.float(),
                buildingInsurance_status: a.enum(['PENDING', 'PAID']),
                buildingInsurance_markToId: a.string(),
                buildingInsurance_markToName: a.string(),
                buildingInsurance_documentNo: a.string(),

                // Dispatch Instructions
                dispatchInstructions_partyId: a.string(),
                dispatchInstructions_partyName: a.string(),
                dispatchInstructions_instructions: a.string(),
                dispatchInstructions_responsiblePersonId: a.string(),
                dispatchInstructions_responsiblePersonName: a.string(),
                dispatchInstructions_remarks: a.string(),

                // Stock Insurance
                stockInsurance_name: a.string(),
                stockInsurance_insuranceDate: a.date(),
                stockInsurance_insureAmount: a.float(),
                stockInsurance_insuranceAmount: a.float(),
                stockInsurance_documentNo: a.string(),
                stockInsurance_markToName: a.string(),
                stockInsurance_markToId: a.string(),
                stockInsurance_status: a.enum(['PENDING', 'PAID']),

                // Vehicle Insurance
                vehicleInsurance_vehicleNo: a.string(),
                vehicleInsurance_insuranceDate: a.date(),
                vehicleInsurance_insuranceCompany: a.string(),
                vehicleInsurance_insureAmount: a.float(),
                vehicleInsurance_insuranceAmount: a.float(),
                vehicleInsurance_insuranceCopy: a.ref('File').array(),
                vehicleInsurance_vehicleType: a.string(),
                vehicleInsurance_remarks: a.string(),

                // Vehicle Report
                vehicleReport_vehicleNo: a.string(),
                vehicleReport_roadTaxDue: a.date(),
                vehicleReport_stateTaxDue: a.date(),
                vehicleReport_fitnessDue: a.date(),
                vehicleReport_challan: a.enum(['YES', 'NO']),
                vehicleReport_challanDate: a.date(),
                vehicleReport_challanDue: a.enum(['YES', 'NO']),
                vehicleReport_batterySNO: a.string(),
                vehicleReport_batteryWarranty: a.date(),
                vehicleReport_billNo: a.string(),
                vehicleReport_billDate: a.date(),
                vehicleReport_billPhoto: a.ref('File').array(),
                vehicleReport_status: a.enum([
                    'PENDING',
                    'INPROGRESS',
                    'COMPLETED'
                ]),

                // ToDo List
                toDoList_assignId: a.string(),
                toDoList_assignName: a.string(),
                toDoList_jointAssignId: a.string(),
                toDoList_jointAssignName: a.string(),
                toDoList_jointWork: a.enum(['yes', 'no']),
                toDoList_work: a.string(),
                toDoList_reportToId: a.string(),
                toDoList_reportToName: a.string(),
                toDoList_workStatus: a.enum([
                    'pending',
                    'inprogress',
                    'completed'
                ]),
                toDoList_nextDate: a.string(),
                toDoList_remarks: a.string(),
                toDoList_originalId: a.string(),
                toDoList_workStatusChangeDate: a.datetime(),
                toDoList_workStatusChangeBy: a.string(),
                toDoList_workStatusChangeByName: a.string(),
                toDoList_workStatusChangeFrom: a.enum([
                    'pending',
                    'inprogress',
                    'completed'
                ]),
                toDoList_workStatusChangeTo: a.enum([
                    'pending',
                    'inprogress',
                    'completed'
                ]),
                // Requirements
                requirements_demandFromId: a.string(),
                requirements_demandFromName: a.string(),
                requirements_responsiblePersonId: a.string(),
                requirements_responsiblePersonName: a.string(),
                requirements_remarks: a.string(),
                requirements_estimatedAmount: a.float(),
                requirements_itemList: a.ref('ProductEntry').array(),

                // Document File Status
                documentFileStatus_inDate_outDate: a.string(),
                documentFileStatus_fileName: a.string(),
                documentFileStatus_documentName: a.string(),
                documentFileStatus_year: a.string(),
                documentFileStatus_window: a.string(),
                documentFileStatus_documentType: a.string(),
                documentFileStatus_fileNo: a.string(),
                documentFileStatus_receivedFrom_givenById: a.string(),
                documentFileStatus_receivedFrom_givenByName: a.string(),
                documentFileStatus_status: a.string(),
                documentFileStatus_remarks: a.string(),
                documentFileStatus_receivedBy_givenToId: a.string(),
                documentFileStatus_receivedBy_givenToName: a.string(),
                documentFileStatus_statusChangeDate: a.datetime(),

                // Sales Man Performance
                salesManPerformance_year_month: a.string(),
                salesManPerformance_salesManId: a.string(),
                salesManPerformance_salesManName: a.string(),
                salesManPerformance_salary: a.float(),
                salesManPerformance_expense: a.float(),
                salesManPerformance_salesInRupees: a.float(),
                salesManPerformance_salesInKgs: a.float(),
                salesManPerformance_skus: a.ref('SKU').array(),

                // products
                products_name: a.string(),
                products_company: a.string(),
                products_price: a.float(),
                products_warranty: a.string(),
                products_issueDate: a.date(),
                products_remarks: a.string()
            })
            .identifier(['formId'])
            .secondaryIndexes(index => [
                index('formType')
                    .sortKeys(['createdAt'])
                    .queryField('listFormByType')
                    .name('FormTypeIndex'),
                index('hasExpiration')
                    .sortKeys(['expirationDate'])
                    .queryField('listByExpiration')
                    .name('ExpirationIndex'),
                index('GSI1PK')
                    .sortKeys(['GSI1SK_Metric'])
                    .queryField('listByGSI1')
                    .name('GSI1'),
                index('GSI2PK')
                    .sortKeys(['GSI2SK'])
                    .queryField('listByGSI2')
                    .name('GSI2'),
                index('GSI3PK')
                    .sortKeys(['GSI3SK'])
                    .queryField('listByGSI3')
                    .name('GSI3'),
                index('GSI4PK')
                    .sortKeys(['GSI4SK'])
                    .queryField('listByGSI4')
                    .name('GSI4')
            ])
            .authorization(allow => [
                allow
                    .groups(['ADMINS'])
                    .to(['create', 'read', 'update', 'delete']),
                allow.authenticated('userPools')
            ])
    })
    .authorization(allow => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        // API Key is used for a.allow.public() rules
        apiKeyAuthorizationMode: {
            expiresInDays: 30
        }
    }
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
