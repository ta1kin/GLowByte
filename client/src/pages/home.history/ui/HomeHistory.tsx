import type { JSX } from 'react'
import { Params } from './Params'
import { Results } from './Results'

import styles from './HomeHistory.module.scss'


function HomeHistoryPage(): JSX.Element {
    return (
        <div className={ styles['home-history-page'] }>
            <main  className={ styles['home-history-page__ctx'] }>
                <Params />
                <Results />
            </main>
        </div>
    )
}

export default HomeHistoryPage
