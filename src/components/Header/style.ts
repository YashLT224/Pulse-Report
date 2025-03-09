import styled from 'styled-components';
export const Container = styled.div`
    height: 86px;
    background-color: #007aff;
    box-shadow: 0 8px 10px -12px, inset 0 8px 15px -12px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        height: auto;
        padding: 16px;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
`;

export const Logo = styled.img`
    width: 55px;
    height: 40px;
    cursor: pointer;

    @media (max-width: 768px) {
        width: 45px;
        height: 30px;
    }
`;

export const FlexBox = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
    }
`;

export const LogoutButton = styled.button`
    padding: 8px 16px;
    font-weight: 500;
    color: #101010;
    border-radius: 6px;
    background-color: #fbc226;
    border: none;
    cursor: pointer;
    font-size: 14px;

    @media (max-width: 768px) {
        padding: 6px 12px;
        font-size: 12px;
    }
`;

export const Text = styled.span`
    color: #fff;
    text-transform: capitalize;
    font-size: 16px;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

export const Separator = styled.div`
    height: 30px;
    width: 1.5px;
    background-color: #fff;

    @media (max-width: 768px) {
        display: none; // Hide separator on mobile for cleaner design
    }
`;
