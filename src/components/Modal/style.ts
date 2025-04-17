import styled from 'styled-components';
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
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    min-width: unset;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    margin: 20px;

    @media (max-width: 480px) {
        width: 95%;
        margin: 10px;
        padding: 15px;
    }
`;

export const ModalHeader = styled.h3`
    margin: 0px;
    margin-bottom: 15px;
    padding-right: 30px; /* Space for the close button */
    // border-bottom: 1px solid #ddd; /* Border under the header */
`;
export const CloseButton = styled.button`
    position: absolute;
    top: -3px;
    right: 0px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #aaa;
    &:hover {
        color: #333;
    }
    &:focus {
        outline: unset;
    }
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
