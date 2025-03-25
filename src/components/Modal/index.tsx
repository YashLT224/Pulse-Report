import { ModalOverlay, ModalContent, ModalHeader } from './style';

const Modal = ({
    children,
    isViewMode = false,
    isUpdateMode = true,
    heading,
    onCloseHander = () => {}
}) => {
    return (
        <ModalOverlay
            onClick={e => {
                onCloseHander();
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
                </ModalHeader>

                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

export default Modal;
