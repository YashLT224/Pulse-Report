import styled from 'styled-components';

// Styled Components
const FooterContainer = styled.footer`
  background-color: #fff;
  color: #333333;
  padding: 10px 0;
  text-align: center;
  font-size: 0.9em;
  border-top:1px solid #d4d4d4
`;

const FooterLink = styled.a`
  color: #333333;
  text-decoration: none;
  margin: 0 10px;
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <p>© 2025 Pulse Report. All rights reserved.</p>
      <div>
        <FooterLink href="#privacy-policy">Privacy Policy</FooterLink>
        <FooterLink href="#terms-of-use">Terms of Use</FooterLink>
        <FooterLink href="#contact-us">Contact Us</FooterLink>
      </div>
    </FooterContainer>
  );
};

export default Footer;