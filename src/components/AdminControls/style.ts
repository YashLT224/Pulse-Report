import styled from 'styled-components';

export const Bar = styled.div`
    min-height: 65px;
    border-bottom: 1.5px solid #d4d4d4;
    display: flex;
    flex-wrap: wrap; /* Allow items to wrap */
    justify-content: center;
    align-items: center;
    padding: 0px 16px;
    background-color: #fff;
    gap: 12px;
    overflow-x: auto; /* Enable horizontal scrolling on smaller screens */
    white-space: nowrap;

    @media (max-width: 768px) {
        padding: 0px 8px;
        gap: 8px;
    }

    @media (max-width: 480px) {
        flex-direction: column;
        height: auto;
        padding: 12px 0;
    }
`;

export const MenuItem = styled.div<{ $active?: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    box-sizing: border-box;
    cursor: pointer;
    border-bottom: ${({ $active }) => ($active ? '2px solid #ed5f00' : 'none')};
    color: ${({ $active }) => ($active ? '#ed5f00' : 'inherit')};
    transition: color 0.3s ease-in-out;

    &:hover {
        border-bottom: 2px solid #ed5f00;
        color: #ed5f00;
    }

    @media (max-width: 768px) {
        padding: 6px 8px;
        font-size: 14px;
    }

    @media (max-width: 480px) {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 8px;
    }
`;

export const Icon = styled.img<{ $active?: boolean }>`
    width: 24px;
    height: 24px;
    filter: ${({ $active }) =>
        $active
            ? 'brightness(0) saturate(100%) invert(31%) sepia(94%) saturate(1086%) hue-rotate(10deg) brightness(99%) contrast(102%)'
            : 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'};
    transition: filter 0.3s ease-in-out;

    ${MenuItem}:hover & {
        filter: brightness(0) saturate(100%) invert(31%) sepia(94%)
            saturate(1086%) hue-rotate(10deg) brightness(99%) contrast(102%);
    }

    @media (max-width: 480px) {
        width: 20px;
        height: 20px;
    }
`;

export const Text = styled.span`
    padding: 0px 4px;
    font-size: 16px;

    @media (max-width: 768px) {
        font-size: 14px;
    }

    @media (max-width: 480px) {
        font-size: 12px;
    }
`;
