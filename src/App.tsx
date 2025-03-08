import { useEffect, useState } from "react";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Routes, Route, Navigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import Home from "./Screens/Home";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

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
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

    useEffect(() => {
        client.models.Todo.observeQuery().subscribe({
            next: (data: any) => setTodos([...data.items])
        });
    }, []);

    return (
        <Authenticator
            loginMechanisms={["phone_number"]}
            signUpAttributes={["name"]}
            formFields={formFields}
        >
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Authenticator>
    );
}

export default App;
