import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import type { JSX, ReactNode } from 'react';


interface IMainProviderProps {
    children: ReactNode
}

function MainProvider({ children }: IMainProviderProps): JSX.Element {
    return (
        <Provider store={ store }>
            <BrowserRouter>
                { children }
            </BrowserRouter>
        </Provider>
    )
}

export default MainProvider
