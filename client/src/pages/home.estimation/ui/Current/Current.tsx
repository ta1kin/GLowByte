import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import styles from './Current.module.scss'


function Current(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="red"
                iconSrc=""
                headTxt="Текущее состояние штабеля"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Current
