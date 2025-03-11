import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/post-confirmation';

type DataClientEnv = {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SESSION_TOKEN: string;
    AWS_REGION: string;
    AMPLIFY_DATA_DEFAULT_NAME: string;
} & Record<string, unknown>;

console.log(
    'Amplify post-confirmation variables:',
    JSON.stringify(env, null, 2)
);

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    (env as unknown) as DataClientEnv
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async event => {
    console.log('Post Confirmation event:', JSON.stringify(event, null, 2));

    // Create User Profile
    console.log('Creating user profile...');

    // Extract user details from the event
    const userId = event.request.userAttributes.sub; // Cognito user ID
    const userName = event.request.userAttributes.name;
    const phoneNumber = event.request.userAttributes.phone_number;
    const createdAt = new Date().toISOString(); // Current date and time
    const role = 'staff' as const; // Default role

    // Create the user profile
    const userProfileInput = {
        userId,
        createdAt,
        role,
        userName,
        phoneNumber,
        allowedForms: [],
        access: 'none'
    };

    try {
        // Use the Amplify Client to save the user profile
        await client.models.UserProfile.create(userProfileInput);

        console.log(`User profile created successfully for userId ${userId}`);
    } catch (error) {
        console.error(
            `Error creating user profile for userId ${userId}:`,
            error
        );
    }
    return event;
};
