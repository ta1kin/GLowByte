import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import styles from './Results.module.scss'


function Results(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                bordered="top"
                iconSrc=""
                headTxt="Результаты оценки риска"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Results
