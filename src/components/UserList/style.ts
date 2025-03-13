import styled from 'styled-components';
export const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto; // Enable horizontal scrolling
    margin-top: 20px;
`;

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 600px; // Ensure the table has a minimum width
`;

export const TableHeader = styled.thead`
    background-color: #f4f4f4;
`;

export const TableRow = styled.tr`
    border-bottom: 1px solid #ddd;

    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

export const TableHeaderCell = styled.th`
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
`;

export const TableCell = styled.td`
    padding: 10px;
    border: 1px solid #ddd;
`;
export const EditIcon = styled.span`
    cursor: pointer;
    font-size: 18px;
    color: #007bff;

    &:hover {
        color: #0056b3;
    }
`;

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    min-width: 350px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.h3`
    margin: 0px;
    margin-bottom: 15px;
`;

export const ModalInput = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

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
