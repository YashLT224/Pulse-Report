import { useState } from 'react';
import {
    Table,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    EditIcon,
    ModalOverlay,
    ModalButton,
    ModalContent,
    ModalHeader,
    CheckboxContainer,
    CheckboxInput,
    CheckboxLabel,
    TableContainer
} from './style';
import { formTypes, formLabelMap } from '../../data/forms';

const UserList = ({ heading, staffMembers = [], onEdit }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedForms, setSelectedForms] = useState([]);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setSelectedForms(user.allowedForms);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = () => {
        // Update the user's allowedForms
        const updatedUser = {
            ...selectedUser,
            allowedForms: selectedForms
        };

        // Update the parent staffMembers state
        onEdit(updatedUser);

        // Close the modal
        setIsModalOpen(false);
    };

    const handleFormChange = formLabel => {
        setSelectedForms(
            prevSelectedForms =>
                prevSelectedForms.includes(formLabel)
                    ? prevSelectedForms.filter(form => form !== formLabel) // Deselect
                    : [...prevSelectedForms, formLabel] // Select
        );
    };

    return (
        <div>
            <h2>{heading}</h2>
            <TableContainer>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>User Name</TableHeaderCell>
                            <TableHeaderCell>Phone Number</TableHeaderCell>
                            <TableHeaderCell>Allowed Forms</TableHeaderCell>
                            <TableHeaderCell>Created At</TableHeaderCell>
                            <TableHeaderCell>Edit</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <tbody>
                        {staffMembers.map((member, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {member.userName}
                                    {member.hasAccess ? ' ✅' : ''}
                                </TableCell>
                                <TableCell>{member.phoneNumber}</TableCell>
                                <TableCell>
                                    {member.allowedForms
                                        .map(
                                            (label: string) =>
                                                formLabelMap[label] || label
                                        )
                                        .join(', ') || 'None'}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        member.createdAt
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <EditIcon
                                        onClick={() => handleEdit(member)}
                                    >
                                        ✏️
                                    </EditIcon>
                                </TableCell>
                            </TableRow>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
            {isModalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            Edit User <br /> Name: {selectedUser?.userName}
                        </ModalHeader>
                        {formTypes.map(form => (
                            <CheckboxContainer key={form.id}>
                                <CheckboxLabel>
                                    <CheckboxInput
                                        type="checkbox"
                                        checked={selectedForms.includes(
                                            form.label
                                        )}
                                        onChange={() =>
                                            handleFormChange(form.label)
                                        }
                                    />
                                    {form.name}
                                </CheckboxLabel>
                            </CheckboxContainer>
                        ))}
                        <div>
                            <ModalButton onClick={handleSave}>Save</ModalButton>
                            <ModalButton onClick={handleCloseModal}>
                                Cancel
                            </ModalButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </div>
    );
};

export default UserList;
