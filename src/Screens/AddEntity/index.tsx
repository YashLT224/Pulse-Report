import { useCallback } from 'react';
import { Loader } from '@aws-amplify/ui-react';
import { Schema } from '../../../amplify/data/resource';
import UserListItems from '../../components/UserList';
import useAuth from '../../Hooks/useAuth';
import { usePagination } from '../../Hooks/usePagination';
import PaginationControls from '../../components/PaginationControls';

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
        const { createdAt, updatedAt, entityType, ...rest } = editedEntity;

        updateItem(rest as Entity);

        const params: any = {
            ...rest
        };

        model.update(params).catch(error => {
            console.error(`Failed to update ${type}:`, error);
        });
    };

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
                />
            </div>
            {/* Pagination Controls */}
            <PaginationControls
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
            />
        </>
    );
};

export default AddEntity;
