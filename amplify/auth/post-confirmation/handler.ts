import { PostConfirmationTriggerHandler } from "aws-lambda";
import { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";

type DataClientEnv = {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SESSION_TOKEN: string;
    AWS_REGION: string;
    AMPLIFY_DATA_DEFAULT_NAME: string;
} & Record<string, unknown>;

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    process.env as DataClientEnv
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async event => {
    console.log(
        "Amplify environment variables:",
        JSON.stringify(process.env, null, 2)
    );

    console.log("Post Confirmation event:", JSON.stringify(event, null, 2));

    // Create User Profile
    console.log("Creating user profile...");
    try {
        // Extract user details from the event
        const userId = event.request.userAttributes.sub; // Cognito user ID
        const createdAt = new Date().toISOString(); // Current date and time
        const role = "staff" as const; // Default role

        // Create the user profile
        const userProfileInput = {
            userId,
            createdAt,
            role
        };
        // Use the Amplify Client to save the user profile
        await client.models.UserProfile.create(userProfileInput);

        console.log("User profile created successfully");
    } catch (error) {
        console.error("Error creating user profile:", error);
    }
    return event;
};
