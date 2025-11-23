import type { JSX } from 'react'
import { previewRoute } from '@/shared/config'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'

import SvgLogo from '@/shared/assets/icons/logo.svg';
import styles from './Header.module.scss';


function HLHeader(): JSX.Element {
    const navigate = useNavigate()

    return (
        <header className={ styles['home-layout__header'] }>
            <div className={ styles['header-logo'] }>
                <img
                    decoding="async"
                    loading="lazy"
                    alt="logo"
                    className={ styles['header-logo__img'] }
                    src={ SvgLogo }
                />
                <div className={ styles['header-logo__text'] }>
                    <h3>ПироУглеКонтроль</h3>
                    <p>Прогнозирование риска самовозгорания угля</p>
                </div>
            </div>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(previewRoute)}
            >На главную</Button>
        </header>
    )
}

export default HLHeader
