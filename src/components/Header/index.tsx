import { Button } from '@aws-amplify/ui-react'
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import BellIcon from '../../assets/bell.svg'
import { Container, Logo, FlexBox, Text,Separator } from './style'
const Header = () => {
  const userProfile = useSelector((state:any) => state.authReducer.userProfile);
  return (
    <Container>
       <Link to="/">
      <Logo src={'https://ui.docs.amplify.aws/amplify-logo.svg'} alt="logo" />
      </Link>
      {userProfile&& <FlexBox>
          <Text>Yash Verma</Text>
          <Separator/>
          <img src={BellIcon} alt='alert'/>
          <Separator/>
         <Button
          variation="primary"
          colorTheme="warning"
          loadingText=""
          onClick={() => alert('hello')}
          style={{
            backgroundColor: '#FBC226',
            color: '#101010',
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </FlexBox>}
    </Container>
  )
}

export default Header
