import {
    type Reducer,
    combineReducers,
    configureStore,
} from '@reduxjs/toolkit'

import {
    settingsReducer,
    previewReducer,
    estimationReducer,
    historyReducer,
} from './slices'

import { persistReducer, persistStore } from 'redux-persist'
import { persistConfig } from './persist'
import { type IMainState, EMainActionTypes } from './types'


const presentReducer: Reducer<IMainState> = combineReducers({
    settings: settingsReducer,
    preview: previewReducer,
    estimation: estimationReducer,
    history: historyReducer
})

const mainReducer: Reducer<IMainState> = (state, action) => {
    switch(action.type) {
        case EMainActionTypes.Reset:
            state = undefined;
            break;
        case EMainActionTypes.Set:
            state = state;
            break;
        default:
            state = state;
            break;
    };

    return presentReducer(state, action);
}

const persistedReducer = persistReducer(persistConfig, mainReducer)

export const mainStore = configureStore({
    reducer: persistedReducer,
    middleware: (gDM) =>
        gDM({ serializableCheck: false }),
})

export const persStore = persistStore(mainStore)

export default mainStore 
