import type { JSX } from 'react'
import { Current } from './Current'
import { Geometry } from './Geometry'
import { Operations } from './Operations'
import { Params } from './Params'
import { Results } from './Results'

import styles from './HomeEstimation.module.scss'


function HomeEstimationPage(): JSX.Element {
    return (
        <div className={ styles['home-estimation-page'] }>
            <main className={ styles['home-estimation-page__main'] }>
                <Params />
                <Geometry />
                <Operations />
                <Current />
            </main>
            <aside className={ styles['home-estimation-page__aside'] }>
                <Results />
                
            </aside>
        </div>
    )
}

export default HomeEstimationPage
