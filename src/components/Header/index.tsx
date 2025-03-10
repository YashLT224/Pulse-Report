import { useEffect } from 'react';
import { Button } from '@aws-amplify/ui-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import BellIcon from '../../assets/bell.svg';
import { clearUserProfile } from '../../Redux/slices/userSlice';
import { resetActiveTile } from '../../Redux/slices/adminControlSlice.ts';
import { Container, Logo, FlexBox, Text, Separator } from './style';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route
    const dispatch = useDispatch();
    const { user, signOut } = useAuthenticator();
    const userProfile = useSelector(
        (state: any) => state.authReducer.userProfile
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user) {
                dispatch(clearUserProfile());
            }
        }, 10);

        return () => clearTimeout(timer);
    }, [user, userProfile, dispatch, navigate]);

    const handleAlerts = () => {
        dispatch(resetActiveTile());
        navigate('/alerts');
    };

    const handleLogout = () => {
        signOut();
        navigate('/');
    };

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
                    {userProfile?.userName && (
                        <>
                            <Text>{userProfile.userName}</Text>
                            <Separator />
                        </>
                    )}
                    <img
                        src={BellIcon}
                        alt="alert"
                        style={{
                            cursor: 'pointer',
                            filter:
                                location.pathname === '/alerts'
                                    ? 'drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.8))'
                                    : 'none'
                        }}
                        onClick={handleAlerts}
                    />
                    <Separator />
                    <Button
                        variation="primary"
                        colorTheme="warning"
                        loadingText=""
                        onClick={handleLogout}
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
