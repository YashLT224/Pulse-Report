import styled from 'styled-components';
export const ModalButton = styled.button`
    padding: 10px 20px;
    margin-right: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #007bff;
    color: white;

    &:hover {
        background-color: #0056b3;
    }
`;

export const CheckboxContainer = styled.div`
    margin-bottom: 15px;
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

export const CheckboxInput = styled.input`
    margin-right: 10px;
`;

export const Heading = styled.h3`
    width: 30vw;
    margin-bottom: 6px;
    font-weight: 400;
    font-size: 16px;
`;
