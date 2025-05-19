import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { useSelector } from 'react-redux';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import { stockInsurance_itemsColumns as itemsColumns } from '../../../data/forms';
import useAuth from '../../../Hooks/useAuth';
import SelectSearch from 'react-select-search';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import {
    getNextYearExpirationDate,
    formatDateForInput
} from '../../../utils/helpers';
import { ModalButton, Heading } from '../../../style';

const LIMIT = 10; // Number of items to display per page
const heading = 'Stock Insurance';
const idField = 'formId';
const FORM_TYPE = 'stockInsurance';

type Form = Schema['Form']['type'];

const StockInsurance = () => {
    const { userProfile, client, isAdmin, formAccess } = useAuth();
        const personsList = useSelector(
            (state: any) => state.globalReducer.persons
        );
    const accessType = isAdmin
        ? 'update'
        : formAccess[FORM_TYPE]?.toLowerCase();
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
            stockInsurance_name: '',
            stockInsurance_insuranceDate: formatDateForInput(new Date()),
            expirationDate: getNextYearExpirationDate(),
            stockInsurance_insureAmount: 0,
            stockInsurance_insuranceAmount: 0,
            stockInsurance_documentNo: '',
            stockInsurance_status: 'PENDING',
            stockInsurance_markToName: '',
            stockInsurance_markToId: ''
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
                updatedByName: userProfile.userName
            };
            updateItem({
                ...editedForm
            } as any);

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
                createdByName: userProfile.userName
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
        selectedItem.stockInsurance_name === '' ||
        selectedItem.stockInsurance_insureAmount === '' ||
        selectedItem.stockInsurance_insuranceAmount === '' ||
        !selectedItem.expirationDate ||
        !selectedItem.stockInsurance_documentNo ||
        !selectedItem.stockInsurance_markToName ||
        !selectedItem.stockInsurance_markToId;

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
                    addNewEntryAccess={accessType !== 'read'}
                    addNewItemHandler={addNewItemHandler}
                    handleEdit={handleEdit}
                    haveEditAccess={accessType === 'update'}
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
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>
                                Name<span className="textRed">*</span>
                            </Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Name"
                                value={selectedItem.stockInsurance_name}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_name'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Insurance Date<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Date"
                                isRequired={true}
                                value={
                                    selectedItem.stockInsurance_insuranceDate
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_insuranceDate'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>
                                Insure Amount<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insure Amount"
                                isRequired={true}
                                value={selectedItem.stockInsurance_insureAmount}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_insureAmount'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Insurance Amount
                                <span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Amount"
                                isRequired={true}
                                value={
                                    selectedItem.stockInsurance_insuranceAmount
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_insuranceAmount'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Due Date<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Payment"
                                isRequired={true}
                                value={selectedItem.expirationDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'expirationDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>
                                Document No.<span className="textRed">*</span>
                            </Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Company"
                                isRequired={true}
                                value={selectedItem.stockInsurance_documentNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_documentNo'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading> Status</Heading>
                            <SelectField
                            label=''
                                value={selectedItem.stockInsurance_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'stockInsurance_status'
                                    )
                                }
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </SelectField>
                        </div>

                           <div className="mb-8px selectSearch">
                                                    <Heading>
                                                        Mark To<span className="textRed">*</span>
                                                    </Heading>
                                                    {/** @ts-expect-error: Ignoring TypeScript error for SelectSearch component usage  */}
                                                    <SelectSearch
                                                        search={true}
                                                        options={personsList}
                                                        value={`${selectedItem.stockInsurance_markToName}#${selectedItem.stockInsurance_markToId}`}
                                                        // name="Person Name"
                                                        placeholder="Mark To"
                                                        onChange={selectedValue => {
                                                            updateField(
                                                                selectedValue,
                                                                'stockInsurance_markToName#stockInsurance_markToId',
                                                                true
                                                            );
                                                        }}
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

export default StockInsurance;
