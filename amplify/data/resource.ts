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
        UserProfile: a
            .model({
                userId: a.id().required(),
                createdAt: a.datetime().required(),
                role: a.enum(['admin', 'staff']),
                userName: a.string().required(),
                phoneNumber: a.string().required(),
                allowedForms: a.string().array(),
                access: a.string() // undefined or 'none'
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
                personName: a.string().required(),
                phoneNumber: a.phone().required(), // Enforce uniqueness using the PhoneIndex
                designation: a.string().required(),
                status: a.enum(['active', 'inactive']),
                entityType: a.string().default('PERSON') // Constant attribute, e.g., "PERSON"
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
                // Allow authenticated users to just read people records
                allow.authenticated().to(['read'])
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
                updatedAt: a.datetime(),
                updatedBy: a.string(),
                hasExpiration: a.string(), // Encodes expiration status and state, e.g., 'yes#active'
                expirationDate: a.date(),
                completedAt: a.datetime(),

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

                // Vehicle Insurance
                vehicleInsurance_vehicleNo: a.string(),
                vehicleInsurance_insuranceDate: a.date(),
                vehicleInsurance_insuranceCompany: a.string(),
                vehicleInsurance_insureAmount: a.float(),
                vehicleInsurance_insuranceAmount: a.float(),
                vehicleInsurance_insuranceCopy: a.ref('File').array(),
                vehicleInsurance_vehicleType: a.string(),
                vehicleInsurance_remarks: a.string(),

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
                toDoList_remarks: a.string()
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
                    .name('ExpirationIndex')
            ])
            .authorization(allow => [
                // Allow admin to perform all operations
                allow
                    .groups(['ADMINS'])
                    .to(['create', 'read', 'update', 'delete']),
                // Allow owner to perform create, read, and update operations
                allow
                    .ownerDefinedIn('createdBy')
                    .to(['create', 'read', 'update']),
                // Allow authenticated users to just read form records
                allow.authenticated().to(['read'])
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
