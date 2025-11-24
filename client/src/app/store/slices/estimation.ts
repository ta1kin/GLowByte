import type {
    IEstimationState,
    IEStateParams,
    IEStateGeometry,
    IEStateOperations,
    IEStateCurrent,
    IEStateResult,
} from './types'

import {
    createSlice,
    createAsyncThunk,
    type PayloadAction,
} from '@reduxjs/toolkit'

import axios from 'axios'


const estimationSliceName = 'estimation'

const initStateParams: IEStateParams = {
    mark: "",
    ash: null,
    content: null,
    humidity: null,
    sulfur: null,
    fraction: null,
    volume: null,
    date: null,
}

const initStateGeometry: IEStateGeometry = {
    type: "",
    length: null,
    width: null,
    height: null,
    stackShape: "",
    sealingLevel: null,
    distance: null,
    ProtectType: "",
}

const initStateOperations: IEStateOperations = {
    transFreq: "",
    tempFreq: "",
    monitSys: [],
    frequency: "",
    mode: "",
    isIncident: false,
}

const initStateCurrent: IEStateCurrent = {
    interTempUnit: [],
    surfTemp: null,
    signsDanger: [],
    isReformed: false,
    isOroshen: false,
}

const initialState: IEstimationState = {
    params: null,
    geometry: null,
    operations: null,
    current: null,
    result: null,
}

export const sendEstimationData = createAsyncThunk<
    any,
    void,
    { rejectValue: string }
>(
    `${estimationSliceName}/send-estimation-data`,
    async (_, { getState, rejectWithValue }): Promise<'error' | null | IEStateResult> => {
        try {
            const url = "https://vmestedate.ru/"

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

const estimationSlice = createSlice({
    name: estimationSliceName,
    initialState,
    reducers: {
        setParams: (
            state,
            action: PayloadAction<Partial<IEStateParams> | IEStateParams>
        ) => {
            const payload = action.payload

            if (!state.params) {
                state.params = { ...initStateParams, ...payload }
                return
            }

            if (Object.keys(payload).length === Object.keys(state.params).length) {
                state.params = payload as IEStateParams
                return
            }

            Object.assign(state.params, payload)
        },
        setGeometry: (
            state,
            action: PayloadAction<Partial<IEStateGeometry> | IEStateGeometry>
        ) => {
            const payload = action.payload

            if (!state.geometry) {
                state.geometry = { ...initStateGeometry, ...payload }
                return
            }

            if (Object.keys(payload).length === Object.keys(state.geometry).length) {
                state.geometry = payload as IEStateGeometry
                return
            }

            Object.assign(state.geometry, payload)
        },
        setOperations: (
            state,
            action: PayloadAction<Partial<IEStateOperations> | IEStateOperations>
        ) => {
            const payload = action.payload

            if (!state.operations) {
                state.operations = { ...initStateOperations, ...payload }
                return
            }

            if (Object.keys(payload).length === Object.keys(state.operations).length) {
                state.operations = payload as IEStateOperations
                return
            }

            Object.assign(state.operations, payload)
        },
        setCurrent: (
            state,
            action: PayloadAction<Partial<IEStateCurrent> | IEStateCurrent>
        ) => {
            const payload = action.payload

            if (!state.current) {
                state.current = { ...initStateCurrent, ...payload }
                return
            }

            if (Object.keys(payload).length === Object.keys(state.current).length) {
                state.current = payload as IEStateCurrent
                return
            }

            Object.assign(state.current, payload)
        },
        setEstimation: (
            state,
            action: PayloadAction<Partial<IEstimationState> | IEstimationState>
        ) => {
            const payload = action.payload

            if (Object.keys(payload).length === Object.keys(state).length) {
                return payload as IEstimationState;
            }

            Object.assign(state, payload)
        },
        resetEstimation: (state) => {
            Object.assign(state, initialState)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendEstimationData.pending, _ => {
                console.log("Передача estimation на api")
            })
            .addCase(sendEstimationData.fulfilled, (state, action: PayloadAction<any>) => {
                console.log("Успешная передача estimation на api")
            })
            .addCase(sendEstimationData.rejected, (state, action: PayloadAction<any>) => {
                console.log("Ошибка отправки estimation на api: ", action.payload || "Неизвестно")
            })
    },
})

export const {
    setParams,
    setGeometry,
    setOperations,
    setCurrent,
    setEstimation,
    resetEstimation,
} = estimationSlice.actions
export { estimationSliceName }
export default estimationSlice.reducer