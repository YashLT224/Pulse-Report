import { Authenticator } from '@aws-amplify/ui-react';
import { useSelector } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Routes from './Routes/routes';
import styled from 'styled-components';
import Header from './components/Header/index';
import AdminControls from './components/AdminControls/index';
import '@aws-amplify/ui-react/styles.css';
import Footer from './components/Footer/index';

const formFields = {
    signIn: {
        username: {
            dialCode: '+91'
        }
    },
    signUp: {
        phone_number: {
            dialCode: '+91'
        }
    }
};

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Ensure the container takes at least the full viewport height */
`;

const MainContent = styled.main`
    flex: 1; /* This makes the main content grow to fill available space */
    padding: 20px; /* Optional: Add padding for spacing */
`;

const AuthenticatorWrapper = styled.div`
    flex: 1; /* Ensure the Authenticator fills the remaining space */
    display: flex;
    flex-direction: column;
`;

function App() {
    const { user } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );

    const isAdmin = user && userProfile?.role === 'admin';

    return (
        <AppContainer>
            <Header />
            {isAdmin && <AdminControls />}
            <Authenticator
                loginMechanisms={['phone_number']}
                signUpAttributes={['name']}
                formFields={formFields}
                components={{
                    SignIn: {
                        Footer() {
                            return null; // This removes the Forgot Password link
                        }
                    }
                }}
            >
                <AuthenticatorWrapper>
                    <MainContent>
                        <Routes />
                    </MainContent>
                    <Footer />
                </AuthenticatorWrapper>
            </Authenticator>
        </AppContainer>
    );
}

export default App;
