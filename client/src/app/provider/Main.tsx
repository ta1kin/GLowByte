import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { SNACK_COUNT, SNACK_TIMEOUT } from '@/shared/config';
import { store } from '@/app/store';
import type { JSX, ReactNode } from 'react';


interface IMainProviderProps {
    children: ReactNode
}

function MainProvider({ children }: IMainProviderProps): JSX.Element {
    return (
        <Provider store={ store }>
            <BrowserRouter>
                <SnackbarProvider
                    maxSnack={ SNACK_COUNT }
                    autoHideDuration={ SNACK_TIMEOUT }
                >
                    { children }
                </SnackbarProvider>
            </BrowserRouter>
        </Provider>
    )
}

export default MainProvider
