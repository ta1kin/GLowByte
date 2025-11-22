import { Outlet } from 'react-router-dom'
import type { JSX } from 'react'

import styles from './MainLayout.module.scss';


function MainLayout(): JSX.Element {
    return (
        <div className={ styles['main-layout'] }>
            <div className={ styles['main-layout__ctx'] }>
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;

