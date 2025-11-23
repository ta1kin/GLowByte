import {
    estimationRoute,
    educationRoute,
    historyRoute,
} from '@/shared/config'

import { type JSX, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material'

import styles from './Nav.module.scss';


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
                        label="Текущая оценка риска"
                        value={estimationRoute}
                        icon={<></>}
                        onClick={() => navigate(estimationRoute)}
                    />
                    <BottomNavigationAction
                        className="second"
                        label="Дообучение модели"
                        value={educationRoute}
                        icon={<></>}
                        onClick={() => navigate(educationRoute)}
                    />
                    <BottomNavigationAction
                        className="third"
                        label="История и поиск"
                        value={historyRoute}
                        icon={<></>}
                        onClick={() => navigate(historyRoute)}
                    />
                </BottomNavigation>
            </Box>
        </nav>
    )
}

export default HLNav
