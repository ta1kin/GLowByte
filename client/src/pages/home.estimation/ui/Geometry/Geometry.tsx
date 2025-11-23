import { UIBlock } from '@/shared/ui/Block'
import type { JSX } from 'react'

import SvgBoxStroke from '@/shared/assets/icons/box-stroke.svg'
import styles from './Geometry.module.scss'


function Geometry(): JSX.Element {
    return (
        <section style={{ width: '100%' }}>
            <UIBlock
                type="violet"
                iconSrc={ SvgBoxStroke }
                headTxt="Геометрия штабеля и условия хранения"
            >
                <></>
            </UIBlock>
        </section>
    )
}

export default Geometry
