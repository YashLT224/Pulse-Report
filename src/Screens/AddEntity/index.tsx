import { useCallback, useState } from 'react';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../amplify/data/resource';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';
import Modal from '../../components/Modal';
import { ModalButton, Heading } from '../../style';

const LIMIT = 10; // Number of items to display per page

type Person = Schema['People']['type'];

type Party = Schema['Party']['type'];

type Entity = Person | Party;

const AddEntity = ({ type = 'PEOPLE' } = {}) => {
    const { client } = useAuth();
    const model =
        type === 'PEOPLE' ? client.models.People : client.models.Party;
    const listfuncName =
        type === 'PEOPLE' ? 'listPeopleAllByName' : 'listPartyAllByName';
    const idField = type === 'PEOPLE' ? 'personId' : 'partyId';
    const entityType = type === 'PEOPLE' ? 'PERSON' : 'PARTY';
    const heading = type === 'PEOPLE' ? 'People' : 'Parties';
    const nameField = type === 'PEOPLE' ? 'personName' : 'partyName';
    const NameEntity = type === 'PEOPLE' ? 'Person' : 'Party';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    // fetch function for usePagination
    const fetchEntity = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                entityType,
                nextToken: token,
                limit,
                sortDirection: 'ASC'
            };
            const response = await model[listfuncName](params);

            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [entityType, model, listfuncName]
    );

    // Use the usePagination hook
    const {
        items,
        isLoading,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        updateItem
    } = usePagination<Entity>({
        limit: LIMIT,
        fetchFn: fetchEntity,
        idField
    });

    // Define columns for the People | Party list
    const itemsColumns = [
        { key: nameField, header: 'Name' },
        { key: 'phoneNumber', header: 'Phone Number' },
        ...(type === 'PEOPLE'
            ? [{ key: 'designation', header: 'Designation' }]
            : []),
        { key: 'status', header: 'Status' },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Entity) => new Date(item.createdAt).toLocaleString()
        }
    ];

    const onEdit = (editedEntity: Entity) => {
        const { createdAt, updatedAt,entityType:_entityType, ...rest } = editedEntity;

        const params: any = {
            ...rest,personId:'123455',phoneNumber:`+91${rest.phoneNumber}`
        };
        if (isUpdateMode) {
            updateItem(rest as Entity);

            model.update(params).catch(error => {
                console.error(`Failed to update ${type}:`, error);
            });
        } else {
            model.create({ ...params, entityType }).catch(error => {
                console.error(`Failed to update ${type}:`, error);
            });
        }
    };

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        let peopleObj = {
            personName: '',
            phoneNumber: '', // Enforce uniqueness using the PhoneIndex
            designation: '',
            status: 'active'
        };
        let partyObj = {
            partyName: '',
            phoneNumber: '', // Enforce uniqueness using the PhoneIndex
            status: 'active'
        };
        setSelectedItem(type === 'PEOPLE' ? peopleObj : partyObj);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const updateField = (value, key) => {
        setSelectedItem(prev => ({ ...prev, [key]: value }));
    };

    const handleEdit = item => {
        setSelectedItem(item);
        setUpdateMode(true);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!selectedItem) return;
        onEdit(selectedItem);
        setIsModalOpen(false);
    };

    console.log(selectedItem);
    return (
        <>
            <div style={{ position: 'relative' }}>
                {/* Loader overlay */}
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 10
                        }}
                    >
                        <Loader
                            height={'80px'}
                            size="large"
                            emptyColor="#007aff"
                            filledColor="white"
                        />
                    </div>
                )}
                <UserListItems<Entity>
                    heading={heading}
                    items={items}
                    onEdit={onEdit}
                    columns={itemsColumns}
                    nameField={nameField}
                    addNewEntryAccess={true}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                />
            </div>
            {/* Pagination Controls */}
            <PaginationControls
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
            />

            {isModalOpen && (
                <Modal heading={`${NameEntity}`}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading width="30vw" level={6}>
                                {NameEntity} Name
                            </Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder={nameField}
                                value={selectedItem[nameField]}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        type === 'PEOPLE'
                                            ? 'personName'
                                            : 'partyName'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading width="30vw" level={6}>
                                Phone No.
                            </Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Phone No."
                                value={selectedItem.phoneNumber}
                                onChange={e =>
                                    updateField(e.target.value, 'phoneNumber')
                                }
                            />
                        </div>
                        {type === 'PEOPLE' && (
                            <div className="mb-8px">
                                <Heading width="30vw" level={6}>
                                    Designation
                                </Heading>
                                <Input
                                    type="text"
                                    variation="quiet"
                                    size="small"
                                    placeholder="designation"
                                    isRequired={true}
                                    value={selectedItem.designation}
                                    onChange={e =>
                                        updateField(
                                            e.target.value,
                                            'designation'
                                        )
                                    }
                                />
                            </div>
                        )}
                        <div className="mb-8px">
                            <Heading width="30vw" level={6}>
                                Status
                            </Heading>
                            <SelectField
                                value={selectedItem.status}
                                onChange={e =>
                                    updateField(e.target.value, 'status')
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">InActive</option>
                            </SelectField>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '15px'
                            }}
                        >
                            <ModalButton type="submit">
                                {isUpdateMode ? 'Update' : 'Save'}
                            </ModalButton>
                            <ModalButton onClick={handleCloseModal}>
                                Cancel
                            </ModalButton>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export default AddEntity;
