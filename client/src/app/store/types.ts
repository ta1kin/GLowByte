import { mainStore } from './main';
import type { ISettingsState } from './slices/types';


export enum EMainActionTypes {
    Set = 'Set',
    Reset = 'Reset',
}

export interface IMainState {
    settings: ISettingsState
}

export type TMainDispatch = typeof mainStore.dispatch
