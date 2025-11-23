import type { JSX } from 'react'
import { Button } from '@mui/material'

import styles from './NotFound.module.scss'


function NotFoundPage(): JSX.Element {
    function handleClick(): void {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    }

    return (
        <div className={ styles['not-found-page'] }>
            <div className={ styles['not-found-page__ctx'] }>
                <h1 className={ styles['nfp-headline'] }><span>🥺</span>К Сожалению по Вашему запросу ничего не найдено...</h1>
                <h4 className={ styles['nfp-desc'] }>
                    Возможно, ресурс был удалён, перенесён или заблокирован, либо у Вас не достаточно прав для его посещения.
                    Помните, что попытки несанкцционированного получения конфиденциальных данных уголовно наказуемо
                </h4>
                <Button onClick={ handleClick }>Вернуться назад</Button>
            </div>
        </div>
    )
}

export default NotFoundPage
