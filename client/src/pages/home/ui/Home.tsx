import { Outlet } from 'react-router-dom'
import { HLHeader } from './Header'
import { HLNav } from './Nav'
import { type JSX, useEffect } from 'react'

import styles from './Home.module.scss'


function HomeLayout(): JSX.Element {
    useEffect(() => {
        document.title = "ПироУглеКонтроль"
    }, [])

    return (
        <div className={ styles['home-layout'] }>
            <HLHeader />
            <HLNav />
            <div className={ styles['home-layout__ctx'] }>
                <Outlet />
            </div>
        </div>
    )
}

export default HomeLayout
