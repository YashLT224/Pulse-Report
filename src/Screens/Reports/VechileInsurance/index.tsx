import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { getUrl } from 'aws-amplify/storage';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { Loader, Input } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { ModalButton, Heading } from '../../../style';
import eyeIcon from '../../../assets/eye.svg';

const LIMIT = 10; // Number of items to display per page
const heading = 'Vechile Insurance';
const idField = 'formId';
const FORM_TYPE = 'vehicleInsurance';

type Form = Schema['Form']['type'];

const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const VechileInsurance = () => {
    const { userProfile, client } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);
    const [files, setFiles] = useState({});
    const [defaultFiles, setDefaultFiles] = useState([]);

    const itemsColumns = [
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Form) => new Date(item.createdAt).toLocaleString()
        },
        {
            key: 'vehicleInsurance_vehicleNo',
            header: 'Vehicle No.'
        },
        {
            key: 'vehicleInsurance_insuranceDate',
            header: 'Insurance Date'
        },
        {
            key: 'expirationDate',
            header: 'Insurance Expiry'
        },
        {
            key: 'vehicleInsurance_insuranceCompany',
            header: 'Insurance Company'
        },
        {
            key: 'vehicleInsurance_insureAmount',
            header: 'Insure Amount'
        },
        {
            key: 'vehicleInsurance_insuranceAmount',
            header: 'Insurance Amount'
        },
        {
            key: 'vehicleInsurance_insuranceCopy',
            header: 'Insurance Copy',
            render: (item: Form) => {
                return (
                    <div>
                        {item.vehicleInsurance_insuranceCopy.map(insurance => (
                            <div
                                key={insurance.key}
                                className="flexbox-between"
                            >
                                <p>{insurance.name}</p>
                                <img
                                    className="pointer"
                                    src={eyeIcon}
                                    alt="View"
                                    width="30"
                                    height="30"
                                    onClick={async () => {
                                        try {
                                            const linkToStorageFile = await getUrl(
                                                {
                                                    path: insurance.key
                                                }
                                            );
                                            const url = linkToStorageFile.url.toString();
                                            // Create an anchor element and trigger a download
                                            const a = document.createElement(
                                                'a'
                                            );
                                            a.href = url;
                                            a.target = '_blank';
                                            a.rel = 'noopener noreferrer';
                                            a.download =
                                                insurance.name ||
                                                'downloaded-file'; // Ensure a valid filename
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        } catch (error) {
                                            console.error(
                                                'Error fetching URL:',
                                                error
                                            );
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            key: 'vehicleInsurance_vehicleType',
            header: 'Vehicle Type'
        },
        {
            key: 'vehicleInsurance_remarks',
            header: 'Remarks'
        }
    ];

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
        refreshList
    } = usePagination<Form>({
        limit: LIMIT,
        fetchFn: fetchForm as any,
        idField
    });

    const processFile = async ({ file }) => {
        const fileName = file.name;
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop();

        return file
            .arrayBuffer()
            .then((filebuffer: Buffer) =>
                window.crypto.subtle.digest('SHA-1', filebuffer)
            )
            .then((hashBuffer: Buffer) => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map(a => a.toString(16).padStart(2, '0'))
                    .join('');
                const key = `${hashHex}.${fileExtension}`;
                setFiles(prevFiles => {
                    return {
                        ...prevFiles,
                        [key]: {
                            status: 'uploading',
                            type: fileType,
                            name: fileName
                        }
                    };
                });
                return { file, key };
            });
    };

    const addNewItemHandler = () => {
        setUpdateMode(false);
        setIsModalOpen(true);
        setSelectedItem({
            vehicleInsurance_vehicleNo: '',
            vehicleInsurance_insuranceDate: formatDateForInput(new Date()),
            expirationDate: formatDateForInput(new Date()),
            vehicleInsurance_insuranceCompany: '',
            vehicleInsurance_insureAmount: 0,
            vehicleInsurance_insuranceAmount: 0,
            vehicleInsurance_vehicleType: '',
            vehicleInsurance_remarks: ''
        });
        setFiles({});
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setFiles({});
        setDefaultFiles(
            item.vehicleInsurance_insuranceCopy?.map((data: any) => ({
                ...data,
                path: data.key,
                key: data.name,
                status: 'uploaded'
            })) || []
        );
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

        const vehicleInsurance_insuranceCopy = defaultFiles
            .map(({ path: key, name, type }) => ({ key, name, type }))
            .concat(
                Object.keys(files).reduce((acc, key) => {
                    const { status, ...fileData } = files[key] || {};
                    if (status !== 'success') return acc;
                    return [...acc, fileData];
                }, [])
            );

        if (isUpdateMode) {
            const params: any = {
                ...restForm,
                updatedAt: new Date().toISOString(),
                updatedBy: userProfile.userId,
                vehicleInsurance_insuranceCopy
            };
            updateItem({
                ...editedForm,
                vehicleInsurance_insuranceCopy
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
                vehicleInsurance_insuranceCopy
            };
            initiateLoding();
            client.models.Form.create(params)
                .then(() => {
                    refreshList();
                })
                .catch(error => {
                    console.error(`Failed to create ${heading}:`, error);
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

    const filesData = Object.values(files).filter(Boolean);

    const isSubmitDisabled =
        !selectedItem.vehicleInsurance_vehicleNo ||
        !selectedItem.vehicleInsurance_insuranceCompany ||
        selectedItem.vehicleInsurance_insureAmount === '' ||
        selectedItem.vehicleInsurance_insuranceAmount === '' ||
        !selectedItem.vehicleInsurance_vehicleType ||
        !selectedItem.vehicleInsurance_remarks ||
        (defaultFiles.length === 0 &&
            (filesData.length === 0 ||
                !filesData.every((file: any) => file?.status === 'success')));

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
                <Modal heading={heading} isUpdateMode={isUpdateMode}>
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>Vehicle No.</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Vehicle No."
                                value={selectedItem.vehicleInsurance_vehicleNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_vehicleNo'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Insurance Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Date"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleInsurance_insuranceDate
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_insuranceDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Insurance Expiry</Heading>
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
                            <Heading>Insurance Company</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Company"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleInsurance_insuranceCompany
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_insuranceCompany'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Insure Amount</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insure Amount"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleInsurance_insureAmount
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_insureAmount'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Insurance Amount</Heading>
                            <Input
                                type="number"
                                variation="quiet"
                                size="small"
                                placeholder="Insurance Amount"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleInsurance_insuranceAmount
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_insuranceAmount'
                                    )
                                }
                            />
                        </div>
                        <div className="mb-8px">
                            <Heading>Insurance Copy</Heading>
                            <FileUploader
                                defaultFiles={defaultFiles}
                                path={({ identityId }) =>
                                    `forms/vehicleInsurance/${identityId}/`
                                }
                                maxFileCount={5}
                                isResumable
                                processFile={processFile}
                                onFileRemove={({ key }) => {
                                    const fileNameHash = key.split('/').pop();
                                    setFiles(prevFiles => {
                                        return {
                                            ...prevFiles,
                                            [fileNameHash]: undefined
                                        };
                                    });
                                    setDefaultFiles(prevFiles => {
                                        return prevFiles.filter(
                                            file => file.key !== key
                                        );
                                    });
                                }}
                                onUploadError={(error, { key }) => {
                                    const fileNameHash = key.split('/').pop();
                                    console.error(
                                        `Failed to upload file with key: ${key}`,
                                        error
                                    );
                                    setFiles(prevFiles => {
                                        return {
                                            ...prevFiles,
                                            [fileNameHash]: {
                                                ...prevFiles[fileNameHash],
                                                key,
                                                status: 'error'
                                            }
                                        };
                                    });
                                }}
                                onUploadSuccess={({ key }) => {
                                    const fileNameHash = key.split('/').pop();
                                    setFiles(prevFiles => {
                                        return {
                                            ...prevFiles,
                                            [fileNameHash]: {
                                                ...prevFiles[fileNameHash],
                                                key,
                                                status: 'success'
                                            }
                                        };
                                    });
                                }}
                                // onUploadStart={({ key }) => {
                                //     const fileKey = key.split('/').pop();
                                //     setFiles(prevFiles => {
                                //         return {
                                //             ...prevFiles,
                                //             [key]: {
                                //                 ...prevFiles[fileKey],
                                //                 status: 'uploading'
                                //             }
                                //         };
                                //     });
                                // }}
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Vehicle Type</Heading>
                            <Input
                                type="text"
                                variation="quiet"
                                size="small"
                                placeholder="Vehicle Type"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleInsurance_vehicleType
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_vehicleType'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Remarks</Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder={'Remarks'}
                                value={selectedItem.vehicleInsurance_remarks}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleInsurance_remarks'
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

export default VechileInsurance;
