import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { errorRoute } from '@/shared/config';
import { useSnackbar } from 'notistack';
import { sendEstimationData } from '@/app/store/slices';
import { resetEstimation } from '@/app/store/slices';
import { useDispatch } from 'react-redux';
import { type JSX, useState } from 'react'
import type { TMainDispatch } from '@/app/store';

import SvgArrowPulse from '@/shared/assets/icons/arrow-pulse.svg';
import styles from './Btns.module.scss'


function Btns(): JSX.Element {
    const navigate = useNavigate()
    const dispatch = useDispatch<TMainDispatch>()
    const { enqueueSnackbar } = useSnackbar()
    const [load, setLoad] = useState<boolean>(false)

    async function handleGetPredict(): Promise<void> {
        setLoad(true)
        
        const response = await dispatch(sendEstimationData()).unwrap()

        enqueueSnackbar('Тут сообщение результата', { variant: 'success' })
        setLoad(false)

        // Тут если критическая ошибка, по типу 404 или 500, то нахуй с пляжа
        if(false) {
            navigate(errorRoute)
        }

        // Отработать успешный ответ или нет (сейчас имитация успеха)
        if(true) {
            const resultHtm = document.getElementById('hest-res')

            resultHtm?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    function handleClear(): void {
        dispatch(resetEstimation())
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
