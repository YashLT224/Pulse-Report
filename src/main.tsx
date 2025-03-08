import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
);
