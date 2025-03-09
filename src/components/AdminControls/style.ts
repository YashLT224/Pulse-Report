import styled from 'styled-components';

export const Bar = styled.div`
    height: 65px;
    border-bottom: 1.5px solid #d4d4d4;
    display: flex;
    padding: 0px 16px;
    background-color: #fff;
`;

export const MenuItem = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    padding: 0px 12px;
    box-sizing: border-box;
    cursor: pointer;
    border-bottom: ${({ active }) => (active ? '2px solid #ed5f00' : 'none')};
    color: ${({ active }) => (active ? '#ed5f00' : 'inherit')};
    &:hover {
        border-bottom: 2px solid #ed5f00;
    }
`;

export const Icon = styled.img<{ active?: boolean }>`
    width: 24px;
    height: 24px;
    filter: ${({ active }) =>
        active
            ? 'brightness(0) saturate(100%) invert(31%) sepia(94%) saturate(1086%) hue-rotate(10deg) brightness(99%) contrast(102%)'
            : 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'};
    transition: filter 0.3s ease-in-out;

    ${MenuItem}:hover & {
        filter: brightness(0) saturate(100%) invert(31%) sepia(94%)
            saturate(1086%) hue-rotate(10deg) brightness(99%) contrast(102%);
    }
`;

export const Text = styled.span`
    padding: 0px 4px;
`;
