import { ModalOverlay, ModalContent, ModalHeader, CloseButton } from './style';

const Modal = ({
    children,
    isViewMode = false,
    isUpdateMode = true,
    heading,
    onCloseHandler = () => {}
}) => {
    return (
        <ModalOverlay
            onClick={() => {
                onCloseHandler();
            }}
        >
            <ModalContent
                onClick={e => {
                    e.stopPropagation();
                }}
            >
                <ModalHeader>
                    {isViewMode ? 'View' : isUpdateMode ? 'Edit' : 'Add'}{' '}
                    {heading}
                    <CloseButton onClick={onCloseHandler}>&times;</CloseButton>
                </ModalHeader>

                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

export default Modal;
