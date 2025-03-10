import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeTileId: -1
};

const adminControlSlice = createSlice({
    name: 'adminControl',
    initialState,
    reducers: {
        setActiveTile: (state, action) => {
            state.activeTileId = action.payload;
        },
        resetActiveTile: state => {
            state.activeTileId = -1;
        }
    }
});

export const { setActiveTile, resetActiveTile } = adminControlSlice.actions;
export default adminControlSlice.reducer;
