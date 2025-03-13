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
        UserProfile: a
            .model({
                userId: a.id(),
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
                personId: a.id(),
                personName: a.string().required(),
                email: a.email(),
                phoneNumber: a.phone().required(),
                dob: a.datetime().required(),
                sex: a.enum(['male', 'female', 'other']),
                address: a.string().required(),
                status: a.enum(['active', 'inactive']),
                entityType: a.string().default('PERSON') // Constant attribute, e.g., "PERSON"
            })
            .identifier(['personId'])
            .secondaryIndexes(index => [
                index('entityType')
                    .sortKeys(['personName'])
                    .queryField('listAllByName')
                    .name('PersonNameIndex'),
                index('status')
                    .sortKeys(['personName'])
                    .queryField('listByStatus')
                    .name('StatusIndex')
            ])
            .authorization(allow => [
                // Allow admin to perform all operations
                allow.groups(['ADMINS']).to(['read', 'update', 'delete'])
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
