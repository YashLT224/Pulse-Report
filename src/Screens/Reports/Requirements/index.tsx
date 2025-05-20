import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input } from '@aws-amplify/ui-react';
import SelectSearch from 'react-select-search';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import { formatDateForInput } from '../../../utils/helpers';
import {requirements_itemsColumns as itemsColumns} from '../../../data/forms'


const LIMIT = 10; // Number of items to display per page
const heading = 'Requirements';
const idField = 'formId';
type Form = Schema['Form']['type'];
const FORM_TYPE = 'requirements';

const Requirements = () => {
    const { userProfile, client,isAdmin,formAccess } = useAuth();
    const accessType=isAdmin?'update': formAccess[FORM_TYPE]?.toLowerCase()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);

    const personsList = useSelector(
        (state: any) => state.globalReducer.persons
    );


    // fetch function for usePagination
    const fetchForm = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                formType: `${FORM_TYPE}#active`,
                nextToken: token,
                limit,
                sortDirection: 'DESC'
            };
            const response = await client.models.Form.listFormByType(params);
            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [client.models.Form]
    );

    // Use the usePagination hook
    const {
        items,
        isLoading,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        initiateLoding,
        updateItem,
        refreshList,
        stopLoding
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm,
        idField
    });

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            requirements_demandFromId: userProfile?.userId,
            requirements_demandFromName: userProfile?.userName,
            requirements_responsiblePersonId: '',
            requirements_responsiblePersonName: '',
            requirements_remarks: '',
            requirements_estimatedAmount:0,
            expirationDate: formatDateForInput(new Date()),
            requirements_itemList: []
        });
    };

    const handleAddItem = () => {
        setSelectedItem(prev => ({
            ...prev,
            requirements_itemList: [
                ...prev.requirements_itemList,
                { itemName: '', itemQuantity: 0, itemPrice: 0 }
            ]
        }));
    };

    // Update a specific item in the list
    const handleItemChange = (index, field, value) => {
        setSelectedItem(prev => {
            const updatedItems = [...prev.requirements_itemList];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value
            };
            return {
                ...prev,
                requirements_itemList: updatedItems
            };
        });
    };

    // Remove an item from the list
    const handleRemoveItem = (index: number) => {
        setSelectedItem(prev => ({
            ...prev,
            requirements_itemList: prev.requirements_itemList.filter(
                (_, i) => i !== index
            )
        }));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (item: Form) => {
        setSelectedItem(item);
        setUpdateMode(true);
        setIsModalOpen(true);
    };

    const onEdit = async (editedForm: Form) => {
        const {
            createdAt,
            updatedAt,
            hasExpiration,
            formType,
            state,
            createdBy,
            updatedBy,
            ...restForm
        } = editedForm;
        if (isUpdateMode) {
            const params: any = {
                ...restForm,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                updatedByName:userProfile.userName,
            };
            updateItem(editedForm);

            client.models.Form.update(params).catch(error => {
                console.error(`Failed to update ${heading}:`, error);
            });
        } else {
            const params: any = {
                ...restForm,
                [idField]: ulid(),
                hasExpiration: 'yes#active',
                createdAt: new Date().toISOString(),
                formType: `${FORM_TYPE}#active`,
                state: 'active',
                createdBy: userProfile.userId,
                createdByName:userProfile.userName
            };
            initiateLoding();
            client.models.Form.create(params)
                .then(() => {
                    refreshList();
                })
                .catch(error => {
                    console.error(`Failed to create ${heading}:`, error);
                    stopLoding();
                });
        }
    };

    const handleSave = () => {
        if (!selectedItem) return;
        onEdit(selectedItem as Form);
        setIsModalOpen(false);
    };

    const updateField = (value: any, key: string, isMultiValue = false) => {
        if (!isMultiValue) {
            setSelectedItem((prev: any) => ({ ...prev, [key]: value }));
        } else {
            const keys = key.split('#');
            const values = value.split('#');
            setSelectedItem((prev: any) => ({
                ...prev,
                [keys[0]]: values[0],
                [keys[1]]: values[1]
            }));
        }
    };

    const isSubmitDisabled =
        // !selectedItem.requirements_demandFromId ||
        // !selectedItem.requirements_demandFromName ||
        !selectedItem.requirements_responsiblePersonId ||
        !selectedItem.requirements_responsiblePersonName ||
        // !selectedItem.requirements_remarks ||
        !selectedItem.requirements_estimatedAmount||
        !selectedItem.expirationDate ||
        !selectedItem.requirements_itemList.length;
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
                <UserListItems<Form>
                    heading={heading}
                    items={items}
                    columns={itemsColumns}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                    haveEditAccess={accessType==='update'}
                    addNewEntryAccess={accessType!=='read'}
                />
                {/* Pagination Controls */}
                <PaginationControls
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                />
            </div>

            {isModalOpen && (
                <Modal
                onCloseHandler={handleCloseModal}
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>
                        <div className="mb-8px selectSearch">
                            <Heading>Demand From</Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            {/* <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.requirements_demandFromName}#${selectedItem.requirements_demandFromId}`}
                                // name="Person Name"
                                placeholder="Demand From"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'requirements_demandFromName#requirements_demandFromId',
                                        true
                                    );
                                }}
                            /> */}
                              <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Deadline"
                                isRequired={true}
                                value={selectedItem.requirements_demandFromName}
                              
                            />
                        </div>
                        <div className="mb-8px selectSearch">
                            <Heading>Responsible Person<span className='textRed'>*</span></Heading>
                            {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                            <SelectSearch
                                search={true}
                                options={personsList}
                                value={`${selectedItem.requirements_responsiblePersonName}#${selectedItem.requirements_responsiblePersonId}`}
                                // name="Person Name"
                                placeholder="Responsible Person"
                                onChange={selectedValue => {
                                    updateField(
                                        selectedValue,
                                        'requirements_responsiblePersonName#requirements_responsiblePersonId',
                                        true
                                    );
                                }}
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Deadline<span className='textRed'>*</span></Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Deadline"
                                isRequired={true}
                                value={selectedItem.expirationDate}
                                min={formatDateForInput(new Date())}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expirationDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Requirements<span className='textRed'>*</span></Heading>
                            {selectedItem.requirements_itemList?.map(
                                (item, index) => (
                                    <div
                                        style={{
                                            border: '0px solid #666',
                                            borderRadius: '12px',
                                            marginBottom: '6px',
                                            padding: '6px'
                                        }}
                                        key={index}
                                    >
                                        <Heading
                                            style={{ width: '100%' }}
                                            className="flexbox-between"
                                        >
                                            <span>#{index + 1}</span>
                                            <span
                                                style={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    handleRemoveItem(index)
                                                }
                                            >
                                                {' '}
                                                Ⓧ
                                            </span>
                                        </Heading>
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                borderTop: '1px solid #666'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '33%',
                                                    borderRight:
                                                        '1px solid #666'
                                                }}
                                                className="mb-8px"
                                            >
                                                <Heading
                                                    style={{
                                                        margin:
                                                            '6px 0px 12px 0px',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Name
                                                </Heading>
                                                <Input
                                                    variation="quiet"
                                                    size="small"
                                                    placeholder="name"
                                                    isRequired={true}
                                                    value={item.itemName}
                                                    onChange={e =>
                                                        handleItemChange(
                                                            index,
                                                            'itemName',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    width: '33%',
                                                    borderRight:
                                                        '1px solid #666'
                                                }}
                                                className="mb-8px"
                                            >
                                                <Heading
                                                    style={{
                                                        margin:
                                                            '6px 0px 12px 0px',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Quantity
                                                </Heading>
                                                <Input
                                                    type="number"
                                                    variation="quiet"
                                                    size="small"
                                                    placeholder="quantity"
                                                    isRequired={true}
                                                    value={item.itemQuantity}
                                                    onChange={e =>
                                                        handleItemChange(
                                                            index,
                                                            'itemQuantity',
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div
                                                style={{ width: '33%' }}
                                                className="mb-8px"
                                            >
                                                <Heading
                                                    style={{
                                                        margin:
                                                            '6px 0px 12px 0px',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Price
                                                </Heading>
                                                <Input
                                                    type="number"
                                                    variation="quiet"
                                                    size="small"
                                                    placeholder="price"
                                                    isRequired={true}
                                                    value={item.itemPrice}
                                                    onChange={e =>
                                                        handleItemChange(
                                                            index,
                                                            'itemPrice',
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            <ModalButton onClick={handleAddItem}>
                                + Add Requirement
                            </ModalButton>
                        </div>
                        <div className="mb-8px">
                            <Heading>Estimation Amount<span className='textRed'>*</span></Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Estimation Amount"
                                isRequired={true}
                                value={selectedItem.requirements_estimatedAmount}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'requirements_estimatedAmount'
                                    )
                                }
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '15px'
                            }}
                        >
                            <ModalButton
                                type="submit"
                                disabled={isSubmitDisabled}
                            >
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

export default Requirements;
