import type {
    ISettingsState,
    IPreviewState,
    IEstimationState,
    IHistoryState,
} from './slices/types'

import { mainStore } from './main'


export enum EMainActionTypes {
    Set = 'Set',
    Reset = 'Reset',
}

export interface IMainState {
    settings: ISettingsState
    preview: IPreviewState
    estimation: IEstimationState
    history: IHistoryState
}

export type TMainDispatch = typeof mainStore.dispatch
