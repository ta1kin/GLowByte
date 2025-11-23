import {
    createSlice,
} from '@reduxjs/toolkit'

import type { ISettingsState } from './types'


const settingsSlinceName = 'settings';

const initialState: ISettingsState = {};

const settingsSlice = createSlice({
    name: settingsSlinceName,
    initialState,
    reducers: {},
    extraReducers: (_builder) => {},
})

export const {} = settingsSlice.actions
export { settingsSlinceName }
export default settingsSlice.reducer
