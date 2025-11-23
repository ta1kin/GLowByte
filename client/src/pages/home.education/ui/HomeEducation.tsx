import type { JSX } from 'react'
import { Params } from './Params'


import styles from './HomeEducation.module.scss'


function HomeEducationPage(): JSX.Element {
    return (
        <div className={ styles['home-education-page'] }>
            <main className={ styles['home-education-page__main'] }>
                <Params />
            </main>
        </div>
    )
}

export default HomeEducationPage
