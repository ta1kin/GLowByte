import {
    previewSliceName,
    estimationSliceName,
    historySliceName,
} from './slices'

import storage from 'redux-persist/lib/storage'


export const persistConfig = {
    key: 'root',
    storage,
    whitelist: [
        previewSliceName,
        estimationSliceName,
        historySliceName,
    ]
}
