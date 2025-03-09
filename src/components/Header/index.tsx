import { Button } from '@aws-amplify/ui-react';
import { useSelector } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import BellIcon from '../../assets/bell.svg';
import { Container, Logo, FlexBox, Text, Separator } from './style';

const Header = () => {
    const { user, signOut } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );
    console.log('user', user);
    console.log('userProfile', userProfile);
    return (
        <Container>
            <Link to="/">
                <Logo
                    src={'https://ui.docs.amplify.aws/amplify-logo.svg'}
                    alt="logo"
                />
            </Link>
            {user && (
                <FlexBox>
                    {userProfile && userProfile.userName && (
                        <>
                            <Text>{userProfile.userName}</Text>
                            <Separator />
                        </>
                    )}
                    <img src={BellIcon} alt="alert" />
                    <Separator />
                    <Button
                        variation="primary"
                        colorTheme="warning"
                        loadingText=""
                        onClick={signOut}
                        style={{
                            backgroundColor: '#FBC226',
                            color: '#101010',
                            fontWeight: 500
                        }}
                    >
                        Logout
                    </Button>
                </FlexBox>
            )}
        </Container>
    );
};

export default Header;
