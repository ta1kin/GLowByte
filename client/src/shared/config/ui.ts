import { ESealingLevel } from '@/app/store/slices'


export const GLOBAL_ANIME_MS = 2000;
export const INNER_ANIME_MS = 1000;
export const GLOBAL_ANIME_S = GLOBAL_ANIME_MS / 1000;
export const INNER_ANIME_S = INNER_ANIME_MS / 1000;

export const SNACK_COUNT = 3
export const SNACK_TIMEOUT = 4000
export const SNACK_ORIENT = {
    vertical: 'top',
    horizontal: 'center',
} as const

export const SEALING_LVL_SETTING = {
    [ESealingLevel.LOW]: {
        label: "НИЗКИЙ",
        color: "#F8AC31"
    },
    [ESealingLevel.MEDIUM]: {
        label: "СРЕДНИЙ",
        color: "#F87E31"
    },
    [ESealingLevel.HIGH]: {
        label: "ВЫСОКИЙ",
        color: "#F83131"
    },
    [ESealingLevel.CRITICAL]: {
        label: "КРИТИЧЕСКИЙ",
        color: "#C30000"
    },
} as const
