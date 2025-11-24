export enum ESealingLevel {
    LOW = 'LOW', // Низкий риск
    MEDIUM = 'MEDIUM', // Средний риск
    HIGH = 'HIGH', // Высокий риск
    CRITICAL = 'CRITICAL', // Критический риск
}

export interface ISettingsState {}

export interface ICoords {
    latit: number | null
    longit: number | null
}

export interface IPreviewState {
    warehouse: string
    district: string
    coords: ICoords
}

export interface IEStateParams {
    mark: string 
    ash: number | null
    content: number | null
    humidity: number | null
    sulfur: number | null
    fraction: number | null
    volume: number | null
    date: Date | null
}

export interface IEStateGeometry {
    type: string
    length: number | null
    width: number | null
    height: number | null
    stackShape: string
    sealingLevel: ESealingLevel | null
    distance: number | null
    ProtectType: string
}

export interface IEStateOperations {
    transFreq: string
    tempFreq: string
    monitSys: string[]
    frequency: string
    mode: string
    isIncident: boolean
}

export interface IInterTempUnit {
    depth: number
    temp: number
}

export interface IEStateCurrent {
    interTempUnit: IInterTempUnit[]
    surfTemp: number | null
    signsDanger: string[]
    isReformed: boolean
    isOroshen: boolean
}

export interface IEStateResult {
  sealingLevel: ESealingLevel;  
  predProb: number;              
  horizonDays: number;          
  critTime: string;              
  recommendations: string[];     
}

export interface IEstimationState {
    params: IEStateParams | null
    geometry: IEStateGeometry | null
    operations: IEStateOperations | null
    current: IEStateCurrent | null
    result: IEStateResult | null
}

export interface IHStateParams {
    areaName: string
    coalBrand: string
    sealingLevel: ESealingLevel | null
    startDate: Date | null
    finishDate: Date | null
}

export interface IHStateResItem {
    date: Date
    areaName: string
    coalBrand: string
    stackShape: string
    wether: string
    isIncident: boolean
    sealingLevel: ESealingLevel
}

export interface IHistoryState {
    params: IHStateParams | null
    result: IHStateResItem[]
}
