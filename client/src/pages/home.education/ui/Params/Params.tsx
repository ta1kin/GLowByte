import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgBoxPoint from '@/shared/assets/icons/BoxPoint.svg'
import styles from './Params.module.scss'


function Params(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="violet"
                iconSrc={ SvgBoxPoint }
                headTxt="Параметры партии угля"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Params
