import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgSearch from '@/shared/assets/icons/search.svg'
import styles from './Results.module.scss'


function Results(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="green"
                iconSrc={ SvgSearch }
                headTxt="Результаты поиска"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Results
