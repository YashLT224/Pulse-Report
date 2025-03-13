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

const AddPeople = ({ type = 'PEOPLE' } = {}) => {
    const { client } = useAuth();
    const model =
        type === 'PEOPLE' ? client.models.People : client.models.Party;
    const idField = type === 'PEOPLE' ? 'personId' : 'partyId';

    // fetch function for usePagination
    const fetchPeople = useCallback(
        async (limit: number, token?: string) => {
            const params: any = {
                entityType: 'PERSON',
                nextToken: token,
                limit,
                sortDirection: 'ASC'
            };
            const response = await model.listAllByName(params);

            return {
                data: response.data,
                nextToken: response.nextToken || null
            };
        },
        [model]
    );

    // Use the usePagination hook
    const {
        items: people,
        isLoading,
        hasNext,
        hasPrevious,
        goToNext,
        goToPrevious,
        updateItem
    } = usePagination<Person | Party>({
        limit: LIMIT,
        fetchFn: fetchPeople,
        idField
    });

    // Define columns for the People list
    const peopleColumns = [
        { key: 'personName', header: 'Name' },
        { key: 'phoneNumber', header: 'Phone Number' },
        { key: 'designation', header: 'Designation' },
        { key: 'status', header: 'Status' },
        {
            key: 'createdAt',
            header: 'Created At',
            render: (item: Person) => new Date(item.createdAt).toLocaleString()
        }
    ];

    const onEdit = (editedPerson: Person | Party) => {
        const {
            createdAt,
            updatedAt,
            entityType,
            ...editedEntity
        } = editedPerson;

        updateItem(editedEntity as Person | Party);

        const params: any = {
            ...editedEntity
        };

        model.update(params).catch(error => {
            console.error('Failed to update person:', error);
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

                {/* People Items */}
                <UserListItems<Person>
                    heading={'People'}
                    items={people}
                    onEdit={onEdit}
                    columns={peopleColumns}
                    nameField="personName"
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

export default AddPeople;
