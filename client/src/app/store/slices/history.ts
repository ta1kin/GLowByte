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
import type { IMainState } from '../types'


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
    async (_, { getState }): Promise<'error' | null | IHStateResItem[]> => {
        try {
            const rootState = getState() as IMainState
            const histState = rootState.history

            const url = "https://vmesstedate.ru/history"

            const data = {}

            const response = await axios.post(url, data)
            
            if (![200, 201].includes(response.status)) {
                return null;
            }

            return response.data;
        } catch (err: any) {
            console.log( err )

            return 'error'
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
            .addCase(getHistory.fulfilled, (state, action: PayloadAction<'error' | null | IHStateResItem[]>) => {
                if(action.payload && action.payload !== 'error') {
                    state.result = action.payload
                    console.log("Успешное получение history c api")
                } else {
                   console.log("Ошибка получения history c api: ")
                }
            })
            .addCase(getHistory.rejected, _ => {
                console.log("Ошибка получения history c api: ")
            })
    },
})

export const { setParams, resetResult, resetHistory } = historySlice.actions
export { historySliceName }
export default historySlice.reducer
