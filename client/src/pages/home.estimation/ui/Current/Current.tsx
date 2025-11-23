import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgDeg from '@/shared/assets/icons/deg.svg'
import styles from './Current.module.scss'


function Current(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="red"
                iconSrc={ SvgDeg } 
                headTxt="Текущее состояние штабеля"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Current
