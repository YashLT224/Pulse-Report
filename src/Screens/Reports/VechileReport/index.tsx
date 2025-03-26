import { useCallback, useState } from 'react';
import { ulid } from 'ulid';
import { getUrl } from 'aws-amplify/storage';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { Loader, Input, SelectField } from '@aws-amplify/ui-react';
import { Schema } from '../../../../amplify/data/resource';
import UserListItems from '../../../components/UserList';
import useAuth from '../../../Hooks/useAuth';
import { usePagination } from '../../../Hooks/usePagination';
import PaginationControls from '../../../components/PaginationControls';
import Modal from '../../../components/Modal';
import { formatDateForInput, getEarliestDate } from '../../../utils/helpers';
import { ModalButton, Heading } from '../../../style';
import eyeIcon from '../../../assets/eye.svg';

const LIMIT = 10; // Number of items to display per page
const heading = 'Vechile Report';
const idField = 'formId';
const FORM_TYPE = 'vehicleReport';

type Form = Schema['Form']['type'];

const VechileReport = () => {
    const { userProfile, client } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [isUpdateMode, setUpdateMode] = useState(false);
    const [files, setFiles] = useState({});
    const [defaultFiles, setDefaultFiles] = useState([]);

    const itemsColumns = [
        // {
        //     key: 'createdAt',
        //     header: 'Created At',
        //     render: (item: Form) => new Date(item.createdAt).toLocaleString()
        // },
        {
            key: 'vehicleReport_vehicleNo',
            header: 'Vehicle No.'
        },
        {
            key: 'vehicleReport_roadTaxDue',
            header: 'Road Tax Due'
        },
        {
            key: 'vehicleReport_stateTaxDue',
            header: 'State Tax Due'
        },
        {
            key: 'vehicleReport_fitnessDue',
            header: 'Fitness Due'
        },
        {
            key: 'vehicleReport_challan',
            header: 'Challan'
        },

        {
            key: 'vehicleReport_challanDate',
            header: 'Challan Date'
        },
        {
            key: 'vehicleReport_challanDue',
            header: 'Challan Due'
        },

        {
            key: 'vehicleReport_batterySNO',
            header: 'Battery S.No.'
        },

        {
            key: 'vehicleReport_batteryWarranty',
            header: 'Battery Warranty'
        },

        {
            key: 'vehicleReport_billNo',
            header: 'Bill No.'
        },
        {
            key: 'vehicleReport_billDate',
            header: 'Bill Date'
        },
        {
            key: 'vehicleReport_billPhoto',
            header: 'Bill Photo',
            render: (item: Form) => {
                return (
                    <div>
                        {item.vehicleReport_billPhoto?.map(fileItem => (
                            <div key={fileItem.key} className="flexbox-between">
                                <p>{fileItem.name}</p>
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
                                                    path: fileItem.key
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
                                                fileItem.name ||
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
            key: 'vehicleReport_status',
            header: 'Status'
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
        refreshList,
        stopLoding
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
            vehicleReport_vehicleNo: '',
            vehicleReport_roadTaxDue: formatDateForInput(new Date()),
            vehicleReport_stateTaxDue: formatDateForInput(new Date()),
            vehicleReport_fitnessDue: formatDateForInput(new Date()),
            vehicleReport_challan: 'NO',
            vehicleReport_challanDate: formatDateForInput(new Date()),
            vehicleReport_challanDue: 'NO',
            vehicleReport_batterySNO: '',
            vehicleReport_batteryWarranty: formatDateForInput(new Date()),
            vehicleReport_billNo: '',
            vehicleReport_billDate: formatDateForInput(new Date()),
            vehicleReport_status: 'PENDING'
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
            item.vehicleReport_billPhoto?.map((data: any) => ({
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

        const expirationDate = getEarliestDate(
            restForm.vehicleReport_roadTaxDue,
            restForm.vehicleReport_stateTaxDue,
            restForm.vehicleReport_fitnessDue,
            restForm.vehicleReport_batteryWarranty
        );

        const vehicleReport_billPhoto = defaultFiles
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
                expirationDate,
                vehicleReport_billPhoto
            };
            updateItem({
                ...editedForm,
                vehicleReport_billPhoto
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
                expirationDate,
                vehicleReport_billPhoto
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

    const filesData = Object.values(files).filter(Boolean);

    const isSubmitDisabled =
        !selectedItem.vehicleReport_vehicleNo ||
        !selectedItem.vehicleReport_batterySNO ||
        !selectedItem.vehicleReport_billNo ||
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
                <Modal
                    onCloseHander={handleCloseModal}
                    heading={heading}
                    isUpdateMode={isUpdateMode}
                >
                    <form onSubmit={handleSave}>
                        <div className="mb-8px">
                            <Heading>Vehicle No.</Heading>
                            <Input
                                variation="quiet"
                                size="small"
                                isRequired={true}
                                placeholder="Vehicle No."
                                value={selectedItem.vehicleReport_vehicleNo}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_vehicleNo'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Road Tax Due</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Road Tax Due"
                                isRequired={true}
                                value={selectedItem.vehicleReport_roadTaxDue}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_roadTaxDue'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>State Tax Due</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="State Tax Due"
                                isRequired={true}
                                value={selectedItem.vehicleReport_stateTaxDue}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_stateTaxDue'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Fitness Due</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Fitness Due"
                                isRequired={true}
                                value={selectedItem.vehicleReport_fitnessDue}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_fitnessDue'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Challan</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.vehicleReport_challan}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_challan'
                                    )
                                }
                            >
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                            </SelectField>
                        </div>

                        <div className="mb-8px">
                            <Heading>Challan Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Challan Date"
                                isRequired={true}
                                value={selectedItem.vehicleReport_challanDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_challanDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Challan Due</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.vehicleReport_challanDue}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_challanDue'
                                    )
                                }
                            >
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                            </SelectField>
                        </div>

                        <div className="mb-8px">
                            <Heading>Battery S.No.</Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder={'Battery S.No.'}
                                value={selectedItem.vehicleReport_batterySNO}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_batterySNO'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Battery Warranty</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Battery Warranty"
                                isRequired={true}
                                value={
                                    selectedItem.vehicleReport_batteryWarranty
                                }
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_batteryWarranty'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Bill No.</Heading>

                            <Input
                                variation="quiet"
                                size="small"
                                placeholder="Bill No."
                                value={selectedItem.vehicleReport_billNo}
                                isRequired={true}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_billNo'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Bill Date</Heading>
                            <Input
                                type="date"
                                variation="quiet"
                                size="small"
                                placeholder="Bill Date"
                                isRequired={true}
                                value={selectedItem.vehicleReport_billDate}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_billDate'
                                    )
                                }
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Bill Photo</Heading>
                            <FileUploader
                                defaultFiles={defaultFiles}
                                path={({ identityId }) =>
                                    `forms/vehicleReport/${identityId}/`
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
                            />
                        </div>

                        <div className="mb-8px">
                            <Heading>Status</Heading>
                            <SelectField
                                label=""
                                value={selectedItem.vehicleReport_status}
                                onChange={e =>
                                    updateField(
                                        e.target.value,
                                        'vehicleReport_status'
                                    )
                                }
                            >
                                <option value="PENDING">Pending</option>
                                <option value="INPROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
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

export default VechileReport;
