import {
    estimationRoute,
    educationRoute,
    historyRoute,
} from '@/shared/config'

import { type JSX, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material'

import SvgPuls from '@/shared/assets/icons/puls.svg?react'
import SvgBoxPoint from '@/shared/assets/icons/BoxPoint.svg?react'
import SvgHistoryClock from '@/shared/assets/icons/history-clock.svg?react'
import styles from './Nav.module.scss'

function HLNav(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();

    const [value, setValue] = useState(location.pathname);

    useEffect(() => {
        setValue(location.pathname);
    }, [location.pathname]);

    return (
        <nav className={ styles['home-layout__nav'] }>
            <Box className={ styles['nav-bar'] }>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(_event, newValue) => {
                        setValue(newValue);
                    }}
                >
                    <BottomNavigationAction
                        className="first"
                        label="Оценка риска"
                        value={estimationRoute}
                        icon={ <SvgPuls /> }
                        onClick={() => navigate(estimationRoute)}
                    />
                    <BottomNavigationAction
                        className="second"
                        label="Дообучение модели"
                        value={educationRoute}
                        icon={ <SvgBoxPoint /> }
                        onClick={() => navigate(educationRoute)}
                    />
                    <BottomNavigationAction
                        className="third"
                        label="История и поиск"
                        value={historyRoute}
                        icon={ <SvgHistoryClock /> }
                        onClick={() => navigate(historyRoute)}
                    />
                </BottomNavigation>
            </Box>
        </nav>
    )
}

export default HLNav
