import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgSettings from '@/shared/assets/icons/settings.svg'
import styles from './Operations.module.scss'


function Operations(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="green"
                iconSrc={ SvgSettings }
                headTxt="Операционные / Технологические параметры"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Operations
