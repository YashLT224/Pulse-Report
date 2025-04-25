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

export const FormItemContainer = styled.div`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #f8f9fa;
`;

export const CheckboxContainer = styled.div`
    margin-bottom: 10px;
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 500;
`;

export const CheckboxInput = styled.input`
    margin-right: 10px;
    width: 18px;
    height: 18px;
`;

export const Heading = styled.h3`
    width: 30vw;
    margin-bottom: 6px;
    font-weight: 400;
    font-size: 16px;
`;

export const AccessBadge = styled.span<{ type: 'READ' | 'WRITE' | 'UPDATE' }>`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: ${props => {
        switch (props.type) {
            case 'READ':
                return '#e3f2fd';
            case 'WRITE':
                return '#e8f5e9';
            case 'UPDATE':
                return '#fff3e0';
            default:
                return '#f5f5f5';
        }
    }};
    color: ${props => {
        switch (props.type) {
            case 'READ':
                return '#1976d2';
            case 'WRITE':
                return '#2e7d32';
            case 'UPDATE':
                return '#f57c00';
            default:
                return '#616161';
        }
    }};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const FormsTable = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
    padding: 4px;
`;

export const FormRow = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }
`;

export const FormName = styled.div`
    flex: 1;
    font-weight: 500;
    min-width: 150px;
    color: #333;
    font-size: 14px;
`;

export const FormAccess = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    min-width: 100px;
`;
