import { ModalOverlay, ModalContent, ModalHeader } from './style';

const Modal = ({ children, isUpdateMode = true, heading }) => {
    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    {isUpdateMode ? 'Edit' : 'Add'} {heading}
                </ModalHeader>

                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

export default Modal;
