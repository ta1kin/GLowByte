import {
    createSlice,
    createAsyncThunk,
    type PayloadAction,
} from '@reduxjs/toolkit'

import type { IPreviewState } from './types'

import axios from 'axios'


const previewSliceName = 'preview'

const initialState: IPreviewState = {
    warehouse: "",
    district: "",
    coords: {
        latit: null,
        longit: null,
    },
}

export const sendPreviewData = createAsyncThunk<
    any,
    void,
    { rejectValue: string }
>(
    `${previewSliceName}/send-preview-data`,
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

const previewSlice = createSlice({
    name: previewSliceName,
    initialState,
    reducers: {
        setPreview: (state, action: PayloadAction<Partial<IPreviewState> | IPreviewState>) => {
            const payload = action.payload;

            if (Object.keys(payload).length === Object.keys(state).length) {
                return payload as IPreviewState;
            }

            Object.assign(state, payload);
        },
        resetPreview: (state) => { Object.assign(state, initialState) }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendPreviewData.pending, _ => {
                console.log("Передача preview на api")
            })
            .addCase(sendPreviewData.fulfilled, (state, action: PayloadAction<any>) => {
                console.log("Успешная передача preview на api")
            })
            .addCase(sendPreviewData.rejected, (state, action: PayloadAction<any>) => {
                console.log("Ошибка отправки preview на api: ", action.payload || "Неизвестно")
            })
    },
})

export const { setPreview, resetPreview } = previewSlice.actions
export { previewSliceName }
export default previewSlice.reducer
