import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import styles from './Params.module.scss'


function Params(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="orange"
                iconSrc=""
                headTxt="Параметры партии угля"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Params
