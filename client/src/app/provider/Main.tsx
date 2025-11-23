import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { SNACK_COUNT, SNACK_TIMEOUT, SNACK_ORIENT } from '@/shared/config';
import { mainStore, persStore } from '@/app/store';
import type { JSX, ReactNode } from 'react';


interface IMainProviderProps {
    children: ReactNode
}

function MainProvider({ children }: IMainProviderProps): JSX.Element {
    return (
        <Provider store={ mainStore }>
            <PersistGate
                loading={ null }
                persistor={ persStore }
            >
                <BrowserRouter>
                    <SnackbarProvider
                        maxSnack={ SNACK_COUNT }
                        autoHideDuration={ SNACK_TIMEOUT }
                        anchorOrigin={ SNACK_ORIENT }
                    >
                        { children }
                    </SnackbarProvider>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
}

export default MainProvider
