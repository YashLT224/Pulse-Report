import { PostConfirmationTriggerHandler } from "aws-lambda";

export const handler: PostConfirmationTriggerHandler = async event => {
    console.log(
        "Amplify environment variables:",
        JSON.stringify(process.env, null, 2)
    );

    console.log("Post Confirmation event:", JSON.stringify(event, null, 2));

    // Create User Profile
    console.log("Creating user profile...");

    return event;
};
