import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import styles from './Operations.module.scss'


function Operations(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="green"
                iconSrc=""
                headTxt="Операционные / Технологические параметры"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Operations
