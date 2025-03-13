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

// Define a type for table column configuration
interface TableColumn<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
}

// Define a common base interface with required fields for editing
interface EditableItem {
    allowedForms?: string[];
    [key: string]: any; // For any other properties
}

// Define props interface for the component using generics
interface UserListProps<T extends EditableItem> {
    heading: string;
    items: T[];
    onEdit: (updatedItem: T) => void;
    columns?: TableColumn<T>[];
    nameField?: keyof T; // Field to show in the modal header
}

function UserList<T extends EditableItem>({
    heading,
    items = [],
    onEdit,
    columns,
    nameField = 'userName' as keyof T
}: UserListProps<T>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [selectedForms, setSelectedForms] = useState<string[]>([]);

    // Default columns if none provided
    const defaultColumns: TableColumn<T>[] = [
        { key: 'userName', header: 'Name' },
        { key: 'phoneNumber', header: 'Phone Number' },
        {
            key: 'allowedForms',
            header: 'Allowed Forms',
            render: item =>
                item.allowedForms
                    ?.map((label: string) => formLabelMap[label] || label)
                    .join(', ') || 'None 🚫'
        },
        {
            key: 'createdAt',
            header: 'Created At',
            render: item =>
                item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
        }
    ];

    const effectiveColumns = columns || defaultColumns;

    const handleEdit = (item: T) => {
        setSelectedItem(item);
        setSelectedForms(item.allowedForms || []);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = () => {
        if (!selectedItem) return;

        // Update the item's allowedForms
        const updatedItem = {
            ...selectedItem,
            allowedForms: selectedForms
        };

        // Update the parent items state
        onEdit(updatedItem as T);

        // Close the modal
        setIsModalOpen(false);
    };

    const handleFormChange = (formLabel: string) => {
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
                            {effectiveColumns.map(column => (
                                <TableHeaderCell key={column.key.toString()}>
                                    {column.header}
                                </TableHeaderCell>
                            ))}
                            <TableHeaderCell>Edit</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <tbody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                {effectiveColumns.map(column => (
                                    <TableCell key={column.key.toString()}>
                                        {column.render
                                            ? column.render(item)
                                            : item[column.key]}
                                        {column.key === nameField &&
                                        item.allowedForms?.length
                                            ? ' ✅'
                                            : ''}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <EditIcon onClick={() => handleEdit(item)}>
                                        ✏️
                                    </EditIcon>
                                </TableCell>
                            </TableRow>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>
            {isModalOpen && selectedItem && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            Edit Item <br />
                            {nameField && `Name: ${selectedItem[nameField]}`}
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
}

export default UserList;
