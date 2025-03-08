import { PostConfirmationTriggerHandler } from "aws-lambda";

export const handler: PostConfirmationTriggerHandler = async event => {
    console.log("Amplify environment variables:", process.env);

    // Create User Profile
    console.log("Creating user profile...");

    return event;
};
