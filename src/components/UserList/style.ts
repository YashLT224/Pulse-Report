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
