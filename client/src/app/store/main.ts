import {
    type Reducer,
    combineReducers,
    configureStore,
} from '@reduxjs/toolkit'

import { settingsReducer } from './slices'
import { type IMainState, EMainActionTypes } from './types'


const presentReducer: Reducer<IMainState> = combineReducers({
    settings: settingsReducer
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

export const mainStore = configureStore({
    reducer: mainReducer,
})

export default mainStore 
