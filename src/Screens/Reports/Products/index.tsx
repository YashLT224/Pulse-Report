import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { Loader, Input } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import { products_itemsColumns as itemsColumns } from '../../../data/forms';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import {
    formatDateForInput
} from '../../../utils/helpers';
import { ModalButton, Heading } from '../../../style';

const LIMIT = 10; // Number of items to display per page
const heading = 'Products';
const idField = 'formId';
const FORM_TYPE = 'products';

type Form = Schema['Form']['type'];

const Products = () => {
    const { userProfile, client,isAdmin,formAccess } = useAuth();
    const accessType=isAdmin?'update': formAccess[FORM_TYPE]?.toLowerCase()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);


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
        fetchFn: fetchForm as any,
        idField
    });



    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            products_name: '',
            products_company:'',
            products_issueDate: formatDateForInput(new Date()),
            products_price: 0,
            products_warranty: '',
            products_remarks:'',
        });

    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (item: any) => {
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
                createdAt: new Date().toISOString(),
                formType: `${FORM_TYPE}#active`,
                state: 'active',
                createdBy: userProfile.userId,
                createdByName:userProfile.userName,

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
        !selectedItem.products_price||
        selectedItem.products_name === '' ||
        selectedItem.products_company === '' ||
        !selectedItem.products_warranty



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
                    addNewEntryAccess={accessType!=='read'}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                    haveEditAccess={accessType==='update'}
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
                <Modal
                    onCloseHandler={handleCloseModal}
                    heading={heading} isUpdateMode={isUpdateMode}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>Product Name<span className='textRed'>*</span></Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Product Name"
                                value={selectedItem.products_name}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_name'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Product Company<span className='textRed'>*</span></Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Company"
                                value={selectedItem.products_company}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_company'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Price<span className='textRed'>*</span></Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Price"
                                value={selectedItem.products_price}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_price'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Issue Date<span className='textRed'>*</span></Heading>
                            <Input
                                type='date'
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Issue Date"
                                min={formatDateForInput(new Date())}
                                value={selectedItem.products_issueDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_issueDate'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Warranty<span className='textRed'>*</span></Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Warranty"
                                value={selectedItem.products_warranty}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_warranty'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Remarks </Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Remarks"
                                value={selectedItem.products_remarks}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'products_remarks'
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
                </Modal>)}
        </>
    );
};

export default Products;
