import styled from 'styled-components';

export const CardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    padding: 20px;
`;

export const CardWrapper = styled.div`
    cursor: pointer;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    width: 200px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
`;

export const CardIcon = styled.img`
    width: 64px; // Adjust the size as needed
    height: 64px;
    margin-bottom: 15px;
`;

export const CardTitle = styled.h3`
    font-size: 18px;
    color: #333333;
    margin: 0;
`;
