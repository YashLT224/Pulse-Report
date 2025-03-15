import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   persons:[],
   parties:[]
};

const globalSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setPersons: (state, action) => {
            state.persons = action.payload;
        },
        setParties: (state, action) => {
            state.parties = action.payload;
        },
    }
});

export const {
    setPersons,
    setParties,
} = globalSlice.actions;
export default globalSlice.reducer;
