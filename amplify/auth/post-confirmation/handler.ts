import { PostConfirmationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";


// Configure Amplify
const amplifyConfig = {
    aws_project_region: process.env.REGION,
    aws_cognito_identity_pool_id: process.env.IDENTITY_POOL_ID,
    aws_user_pools_id: process.env.USER_POOL_ID,
    aws_user_pools_web_client_id: process.env.USER_POOL_CLIENT_ID,
  };

  
Amplify.configure(amplifyConfig);
const client = generateClient();
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
        const role = "staff"; // Default role
    
        // Create the user profile
        const userProfileInput = {
          userId,
          createdAt,
          role,
        };
        // Use the Amplify Client to save the user profile
        await client.models.UserProfile.create(userProfileInput);
    
        console.log("User profile created successfully");
      } catch (error) {
        console.error("Error creating user profile:", error);
      }
    return event;
};
