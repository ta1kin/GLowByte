import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgSearch from '@/shared/assets/icons/search.svg'
import styles from './Params.module.scss'


function Params(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="green"
                iconSrc={ SvgSearch }
                headTxt="Параметры партии угля"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Params
