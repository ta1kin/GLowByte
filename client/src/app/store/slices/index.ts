import {
    ESealingLevel,
    type ISettingsState,
    type IPreviewState,
    type ICoords,
    type IEstimationState,
    type IEStateParams,
    type IEStateGeometry,
    type IEStateOperations,
    type IEStateCurrent,
    type IInterTempUnit,
    type IHStateParams,
    type IHStateResItem,
    type IHistoryState,
} from './types'

import {
    default as settingsReducer,
    settingsSlinceName,
} from './settings';

import {
    default as previewReducer,
    previewSliceName,
    setPreview,
    resetPreview,
    sendPreviewData,
} from './preview'

import {
    default as estimationReducer,
    estimationSliceName,
    setParams as setEstimParams,
    setGeometry,
    setOperations,
    setCurrent,
    setEstimation,
    resetEstimation,
    sendEstimationData,
} from './estimation'

import {
    default as historyReducer,
    historySliceName,
    setParams as setHistParams,
    resetResult,
    resetHistory,
    getHistory,
} from './history'


export {
    ESealingLevel,

    type ISettingsState,
    settingsReducer,
    settingsSlinceName,

    type ICoords,
    type IPreviewState,
    previewReducer,
    previewSliceName,
    setPreview,
    resetPreview,
    sendPreviewData,

    type IInterTempUnit,
    type IEStateParams,
    type IEStateGeometry,
    type IEStateOperations,
    type IEStateCurrent,
    type IEstimationState,
    estimationReducer,
    estimationSliceName,
    setEstimParams,
    setGeometry,
    setOperations,
    setCurrent,
    setEstimation,
    resetEstimation,
    sendEstimationData,

    type IHStateParams,
    type IHStateResItem,
    type IHistoryState,
    historyReducer,
    historySliceName,
    setHistParams,
    resetResult,
    resetHistory,
    getHistory,
}
