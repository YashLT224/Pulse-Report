import { useState } from 'react'
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
} from './style'
import { formTypes } from '../../data/forms'
const UserList = ({ staffMembers, Heading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [name, setName] = useState('')
  const [selectedForms, setSelectedForms] = useState([]);

  const handleEdit = (user) => {
    setSelectedUser(user)
     setName(user.userName);
     setSelectedForms(user.allowedForms);
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSave = () => {
    // Update the user's name and allowedForms
    const updatedUser = {
        ...selectedUser,
        userName: name,
        allowedForms: selectedForms,
    };

    // Update the staffMembers state
    // setStaffMembers(prevMembers =>
    //     prevMembers.map(member =>
    //         member.userId === updatedUser.userId ? updatedUser : member
    //     )
    // );

    // Close the modal
    setIsModalOpen(false);
};

  const handleFormChange = (formLabel) => {
    setSelectedForms((prevSelectedForms) =>
        prevSelectedForms.includes(formLabel)
            ? prevSelectedForms.filter((form) => form !== formLabel) // Deselect
            : [...prevSelectedForms, formLabel] // Select
    );
};
  return (
    <div>
      <h2>{Heading}</h2>
      <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>User Name</TableHeaderCell>
            <TableHeaderCell>Phone Number</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Allowed Forms</TableHeaderCell>
            <TableHeaderCell>Created At</TableHeaderCell>
            <TableHeaderCell>Edit</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {staffMembers.map((member, index) => (
            <TableRow key={index}>
              <TableCell>{member.userName}</TableCell>
              <TableCell>{member.phoneNumber}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>{member.allowedForms.join(', ') || 'None'}</TableCell>
              <TableCell>
                {new Date(member.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <EditIcon onClick={() => handleEdit(member)}>✏️</EditIcon>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      </TableContainer>
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Edit User <br/> Name: {selectedUser?.userName}</ModalHeader>
           
            {formTypes.map((form) => (
              <CheckboxContainer key={form.id}>
                <CheckboxLabel>
                  <CheckboxInput
                    type="checkbox"
                    checked={selectedForms.includes(form.label)}
                    onChange={() => handleFormChange(form.label)}
                  />
                  {form.name}
                </CheckboxLabel>
              </CheckboxContainer>
            ))}
            <div>
              <ModalButton onClick={handleSave}>Save</ModalButton>
              <ModalButton onClick={handleCloseModal}>Cancel</ModalButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  )
}

export default UserList
