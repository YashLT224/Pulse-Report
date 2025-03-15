import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { client } from '../../Hooks/useAuth';

const fetchAllWorkers = async () => {
    try {
        const { data = [] } =
            (await client.models.People.listPeopleByStatus({
                status: 'active'
            })) || {};
        if (!data.length) return [];
        return data.map(user => ({
            ...user,
            name: user.personName,
            value: `${user.personName}#${user.personId}`
        }));
    } catch (error) {
        console.error('Error fetching people:', error);
        return [];
    }
};

const fetchAllAgencies = async () => {
    try {
        const { data = [] } =
            (await client.models.Party.listPartyByStatus({
                status: 'active'
            })) || {};
        if (!data.length) return [];
        return data.map(party => ({
            ...party,
            name: party.partyName,
            value: party.partyId
        }));
    } catch (error) {
        console.error('Error fetching parties:', error);
        return [];
    }
};

export const fetchPeople = createAsyncThunk('people/fetchPeople', async () => {
    return await fetchAllWorkers();
});

export const fetchParties = createAsyncThunk('party/fetchParties', async () => {
    return await fetchAllAgencies();
});

const initialState = {
    persons: [],
    parties: []
};

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setPersons: (state, action) => {
            state.persons = action.payload;
        },
        setParties: (state, action) => {
            state.parties = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(
                fetchPeople.fulfilled,
                (state, action: PayloadAction<any[]>) => {
                    state.persons = action.payload;
                }
            )
            .addCase(
                fetchParties.fulfilled,
                (state, action: PayloadAction<any[]>) => {
                    state.parties = action.payload;
                }
            );
    }
});

export const { setPersons, setParties } = globalSlice.actions;
export default globalSlice.reducer;
