import { Authenticator } from "@aws-amplify/ui-react";
import Routes from '../Routes/routes'
import Header from "./components/Header/index";
import AdminControls from "./components/AdminControls/index";
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
        <>
        <Header/>
        <AdminControls/>
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
           <Routes/>
        </Authenticator>
        </>
         
    );
}

export default App;
