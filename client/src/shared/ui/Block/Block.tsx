import type { JSX, ReactNode } from 'react'

import styles from './Block.module.scss'


interface IUIBlockProps {
    type?: 'electric' | 'orange' | 'violet' | 'green' | 'red' | 'empty'
    bordered?: 'left' | 'top'
    withHeader?: boolean
    iconSrc: string
    headTxt: string
    children: ReactNode
}

function UIBlock({
    type = 'electric',
    bordered = 'left',
    withHeader = true,
    iconSrc,
    headTxt,
    children,
}: IUIBlockProps): JSX.Element {
    return (
        <div className={ `${styles['ui-block']} ${styles[`${type}`] || ''} ${styles[`${bordered}`] || ''}` }>
            <div className={ styles['ui-block__ctx'] }>
                { withHeader && <div className={ styles['block-head'] }>
                    <div className={ styles['block-head__icon'] }>
                        <img src={ iconSrc } alt="icon" />
                    </div>
                    <h2>{ headTxt }</h2>
                </div> }
                <div className={ styles['block-body'] }>
                    { children }
                </div>
            </div>
        </div>
    )
}

export default UIBlock
