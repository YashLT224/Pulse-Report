import { ModalOverlay, ModalContent, ModalHeader } from './style';

const Modal = ({
    children,
    isViewMode = false,
    isUpdateMode = true,
    heading
}) => {
    return (
        <ModalOverlay>
            <ModalContent>
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
