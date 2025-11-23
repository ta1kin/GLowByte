import type { JSX, ReactNode } from 'react'

import styles from './Block.module.scss'


interface IUIBlockProps {
    type?: 'electric' | 'orange' | 'violet' | 'green' | 'red' | 'empty'
    bordered?: 'left' | 'top'
    withHeader?: boolean
    iconSrc: string
    headTxt: string
    lowTxt?: string
    children: ReactNode
}

function UIBlock({
    type = 'electric',
    bordered = 'left',
    withHeader = true,
    iconSrc,
    headTxt,
    lowTxt,
    children,
}: IUIBlockProps): JSX.Element {
    return (
        <div className={ `${styles['ui-block']} ${styles[`${type}`] || ''} ${styles[`${bordered}`] || ''}` }>
            <div className={ styles['ui-block__ctx'] }>
                { withHeader && <div className={ styles['block-head'] }>
                    <div className={ styles['block-head__icon'] }>
                        <img
                            alt="icon"
                            className={ styles['bhi-img'] }
                            src={ iconSrc }
                        />
                    </div>
                    <h3>{ headTxt }</h3>
                    <h6 style={{marginTop: "7px"}}>{ lowTxt }</h6>
                </div> }
                <div className={ styles['block-body'] }>
                    { children }
                </div>
            </div>
        </div>
    )
}

export default UIBlock
