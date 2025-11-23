import {
    estimationRoute,
    educationRoute,
    historyRoute,
} from '@/shared/config'

import { type JSX, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material'

<<<<<<< HEAD
import styles from "./Nav.module.scss";
=======
import styles from './Nav.module.scss';

>>>>>>> 0c84985d4cdfb77064e7711bfdd13642b89636e5

function HLNav(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();

    const [value, setValue] = useState(location.pathname);

    useEffect(() => {
        setValue(location.pathname);
    }, [location.pathname]);

    return (
<<<<<<< HEAD
        <nav className="home-layout__nav">
           <Box className="nav-bar">
=======
        <nav className={ styles['home-layout__nav'] }>
            <Box className={ styles['nav-bar'] }>
>>>>>>> 0c84985d4cdfb77064e7711bfdd13642b89636e5
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
