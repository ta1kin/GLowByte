import { UIBlock } from '@/shared/ui'
import { estimationRoute } from '@/shared/config'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import type { JSX } from 'react'

import styles from './Preview.module.scss'


function PreviewPage(): JSX.Element {
    const navigate = useNavigate()

    return (
        <div className={ styles['preview-page'] }>
            <div className={ styles['preview-page__ctx'] }>
                <UIBlock
                    iconSrc=""
                    headTxt="Склад / Местоположение"
                >
                    <div className={ styles['block-body'] }>
                        <div className={ styles['block-body__ctx'] }>
                            
                        </div>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(estimationRoute)}
                        >Поиск</Button>
                    </div>
                </UIBlock>
            </div>
        </div>
    )
}

export default PreviewPage
