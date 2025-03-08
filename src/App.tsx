import { Routes, Route, Navigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import Home from "./Screens/Home";
import Staff from "./Screens/Staff";
import "@aws-amplify/ui-react/styles.css";

const formFields = {
    signIn: {
        username: {
            dialCode: "+91"
        }
    },
    signUp: {
        phone_number: {
            dialCode: "+91"
        }
    }
};

function App() {
    return (
        <Authenticator
            loginMechanisms={["phone_number"]}
            signUpAttributes={["name"]}
            formFields={formFields}
            components={{
                SignIn: {
                    Footer() {
                        return null; // This removes the Forgot Password link
                    }
                }
            }}
        >
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Authenticator>
    );
}

export default App;
