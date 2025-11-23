import type {
    IHStateParams,
    IHistoryState,
} from './types'

import {
    createSlice,
    createAsyncThunk,
    type PayloadAction,
} from '@reduxjs/toolkit'

import axios from 'axios'


const historySliceName = 'history'

const initStateParams: IHStateParams = {
    areaName: "",
    coalBrand: "",
    sealingLevel: null,
    startDate: null,
    finishDate: null,
}

const initialState: IHistoryState = {
    params: null,
    result: []
}

export const getHistory = createAsyncThunk(
    `${historySliceName}/get-history`,
    async (_, { rejectWithValue }): Promise<any> => {
        try {
            const response = await axios.post('/api/preview', { /* данные */ });

            // если сервер вернул ошибку 4xx/5xx
            if (response.status !== 200) {
                return rejectWithValue('Ошибка сервера');
            }

            return response.data;
        } catch (err: any) {
            // ловим сетевые или другие ошибки
            return rejectWithValue(err.message || 'Неизвестная ошибка');
        }
    }
)

const historySlice = createSlice({
    name: historySliceName,
    initialState,
    reducers: {
        setParams: (
            state,
            action: PayloadAction<Partial<IHStateParams> | IHStateParams>
        ) => {
            const payload = action.payload

            if (!state.params) {
                state.params = { ...initStateParams, ...payload }
                return
            }

            if (Object.keys(payload).length === Object.keys(state.params).length) {
                state.params = payload as IHStateParams
                return
            }

            Object.assign(state.params, payload)
        },
        resetResult: (state) => { state.result = [] },
        resetHistory: (state) => { Object.assign(state, initialState) },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getHistory.pending, _ => {
                console.log("Получение history c api")
            })
            .addCase(getHistory.fulfilled, (_state, _action: PayloadAction<any>) => {
                console.log("Успешное получение history c api")
            })
            .addCase(getHistory.rejected, (_state, action: PayloadAction<any>) => {
                console.log("Ошибка получения history c api: ", action.payload || "Неизвестно")
            })
    },
})

export const { setParams, resetResult, resetHistory } = historySlice.actions
export { historySliceName }
export default historySlice.reducer
