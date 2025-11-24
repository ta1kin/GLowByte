import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { errorRoute } from '@/shared/config';
import { useSnackbar } from 'notistack';
import { sendEstimationData } from '@/app/store/slices';
import { resetEstimation } from '@/app/store/slices';
import { useDispatch, useSelector } from 'react-redux';
import { type JSX, useState } from 'react'
import type { TMainDispatch, IMainState } from '@/app/store';

import SvgArrowPulse from '@/shared/assets/icons/arrow-pulse.svg';
import styles from './Btns.module.scss'


function Btns(): JSX.Element {
    const navigate = useNavigate()
    const dispatch = useDispatch<TMainDispatch>()
    const { enqueueSnackbar } = useSnackbar()
    const [load, setLoad] = useState<boolean>(false)
    const ectimData  = useSelector((state: IMainState) => state.estimation)

    

    async function handleGetPredict(): Promise<void> {
        if (
            !ectimData.current ||
            !ectimData.params ||
            !ectimData.geometry 
        ) {
            enqueueSnackbar('Заполните все поля', { variant: 'warning' })
            return
        }
        setLoad(true)
        
        const response = await dispatch(sendEstimationData()).unwrap()

        console.log("вот респонс", response)

        if (response && response !== 'error') {
            enqueueSnackbar('Успешное получение прогноза', { variant: 'success' })
        }
        else{
            enqueueSnackbar('Прогноз не получен', { variant: 'error' })
        }

        setLoad(false)

        if(response === 'error') {
            
            navigate(errorRoute)
        }
        else if(response) {
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
