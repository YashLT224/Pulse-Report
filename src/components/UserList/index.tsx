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
    TableContainer
} from './style';

// Define a type for table column configuration
interface TableColumn<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
}

// Define an interface for editable fields configuration
interface EditableField<T> {
    key: keyof T | string;
    label: string;
    type: 'text' | 'select' | 'checkbox'; // Editable field types
    options?: { name: string; label: string }[]; // For dropdowns
}

interface EditableItem {
    [key: string]: any; // For any other properties
}

// Define props interface for the component using generics
interface UserListProps<T> {
    heading: string;
    items: T[];
    columns?: TableColumn<T>[];
    editableFields?: EditableField<T>[]; // Fields that can be edited
    onEdit: (updatedItem: T) => void;
    nameField?: keyof T; // Field to show in the modal header
}

function UserList<T extends EditableItem>({
    heading,
    items = [],
    onEdit,
    columns,
    editableFields = [],
    nameField = 'userName' as keyof T
}: UserListProps<T>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [updatedFields, setUpdatedFields] = useState<Record<string, any>>({});

    // Default columns if none provided
    const defaultColumns: TableColumn<T>[] = [
        { key: 'userName', header: 'Name' },
        { key: 'phoneNumber', header: 'Phone Number' },
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
        setUpdatedFields(item); // Initialize with current values
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFieldChange = (fieldKey: string, value: any) => {
        setUpdatedFields(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    };

    const handleSave = () => {
        if (!selectedItem) return;

        onEdit({ ...selectedItem, ...updatedFields });
        setIsModalOpen(false);
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
                                            : item[column.key as string]}
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

                        {editableFields.map(field => (
                            <div
                                key={field.key.toString()}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                <label style={{ fontWeight: 'bold' }}>
                                    {field.label}
                                </label>

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        value={
                                            updatedFields[
                                                field.key as string
                                            ] || ''
                                        }
                                        onChange={e =>
                                            handleFieldChange(
                                                field.key.toString(),
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px'
                                        }}
                                    />
                                )}

                                {field.type === 'select' && (
                                    <select
                                        value={
                                            updatedFields[
                                                field.key as string
                                            ] || ''
                                        }
                                        onChange={e =>
                                            handleFieldChange(
                                                field.key.toString(),
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px'
                                        }}
                                    >
                                        {field.options?.map(option => (
                                            <option
                                                key={option.label}
                                                value={option.label}
                                            >
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'checkbox' && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        }}
                                    >
                                        {field.options?.map(option => (
                                            <label
                                                key={option.label}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={updatedFields[
                                                        field.key as string
                                                    ]?.includes(option.label)}
                                                    onChange={() => {
                                                        const currentValues =
                                                            updatedFields[
                                                                field.key as string
                                                            ] || [];
                                                        handleFieldChange(
                                                            field.key.toString(),
                                                            currentValues.includes(
                                                                option.label
                                                            )
                                                                ? currentValues.filter(
                                                                      (
                                                                          val: string
                                                                      ) =>
                                                                          val !==
                                                                          option.label
                                                                  )
                                                                : [
                                                                      ...currentValues,
                                                                      option.label
                                                                  ]
                                                        );
                                                    }}
                                                />
                                                {option.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '15px'
                            }}
                        >
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
