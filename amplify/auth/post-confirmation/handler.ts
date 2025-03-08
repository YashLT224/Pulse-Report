import { PostConfirmationTriggerHandler } from "aws-lambda";
import { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/post-confirmation";

console.log(
    "Amplify post-confirmation variables:",
    JSON.stringify(env, null, 2)
);

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    env
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

    try {
        // Use the Amplify Client to save the user profile
        await client.models.UserProfile.create(userProfileInput);

        console.log("User profile created successfully");
    } catch (error) {
        console.error(
            `Error creating user profile for userId ${userId}:`,
            error
        );
    }
    return event;
};
