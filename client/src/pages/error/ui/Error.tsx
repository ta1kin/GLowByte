import { type JSX, useEffect } from 'react'
import { Button } from '@mui/material'

import styles from './Error.module.scss'


function ErrorPage(): JSX.Element {
    function handleClick(): void {
        window.location.reload()
    }

    useEffect(() => {
        document.title = "Ошибка"
    }, [])

    return (
        <div className={ styles['error-page'] }>
            <div className={ styles['error-page__ctx'] }>
                <h1 className={ styles['ep-headline'] }><span>🚨</span>Возникла ошибка...</h1>
                <h4 className={ styles['ep-desc'] }>
                    Возможно, у Вас плохое интернет соединение или что-то случилось с сервером.
                    Попробуйте чуть позже повторить Вашу попытку
                </h4>
                <Button onClick={ handleClick }>перезагрузить</Button>
            </div>
        </div>
    )
}

export default ErrorPage
