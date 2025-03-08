import { PreSignUpTriggerHandler } from "aws-lambda";

export const handler: PreSignUpTriggerHandler = async event => {
    // Confirm the user
    event.response.autoConfirmUser = true;

    // Set the email as verified if it is in the request
    if (
        Object.prototype.hasOwnProperty.call(
            event.request.userAttributes,
            "email"
        )
    ) {
        event.response.autoVerifyEmail = true;
    }

    // Set the phone number as verified if it is in the request
    if (
        Object.prototype.hasOwnProperty.call(
            event.request.userAttributes,
            "phone_number"
        )
    ) {
        event.response.autoVerifyPhone = true;
    }

    return event;
};
