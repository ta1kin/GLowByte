import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { errorRoute } from '@/shared/config';
import { useSnackbar } from 'notistack';
import { type JSX, useState } from 'react'

import SvgArrowPulse from '@/shared/assets/icons/arrow-pulse.svg';
import styles from './Btns.module.scss'


function Btns(): JSX.Element {
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const [load, setLoad] = useState<boolean>(false)

    async function handleGetPredict(): Promise<void> {
        setLoad(true)
        // Пишешь логику отправки запроса на сервер
        enqueueSnackbar('Тут сообщение результата', { variant: 'success' })
        setLoad(false)

        // Тут если критическая ошибка, по типу 404 или 500, то нахуй с пляжа
        if(false) {
            navigate(errorRoute)
        }
    }

    function handleClear(): void {
        enqueueSnackbar('Запрос очищен', { variant: 'info' })
    }

    return (
        <section style={{ width: '100%' }}>
            <div className={ styles['hep-btns-section'] }>
                <Button
                    fullWidth
                    className="square"
                    variant="contained"
                    loadingPosition="start"
                    loading={ load }
                    startIcon={
                        <img src={ SvgArrowPulse } alt="ap" />
                    }
                    onClick={ handleGetPredict }
                >Рассчитать риск самовозгорания</Button>
                <Button
                    fullWidth
                    className="white square"
                    variant="contained"
                    onClick={ handleClear }
                >Сбросить</Button>
            </div>
        </section>
    )
}

export default Btns
