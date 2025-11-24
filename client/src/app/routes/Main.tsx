import {
    previewRoute,
    homeGlobRoute,
    homeInnerRoutes,
    errorRoute,
    notFoundRoute,
} from '@/shared/config'

import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/app/layout'
import { useNavigate } from 'react-router-dom'
import{ HomeLayout } from '@/pages/home'
import { PreviewPage } from '@/pages/preview'
import { HomeEstimationPage } from '@/pages/home.estimation'
import { HomeEducationPage } from '@/pages/home.education'
import { HomeHistoryPage } from '@/pages/home.history'
import { ErrorPage } from '@/pages/error'
import { NotFoundPage } from '@/pages/not-found'
import { type JSX, useEffect } from 'react'


export const MainRoutes = (): JSX.Element => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(previewRoute)
    },[])

    return (
        <Routes>
            <Route element={ <MainLayout /> }>
                <Route path={ previewRoute } element={ <PreviewPage /> } />

                <Route path={ homeGlobRoute } element={ <HomeLayout /> }>
                    <Route path={ homeInnerRoutes.estimation } element={ <HomeEstimationPage /> } />
                    <Route path={ homeInnerRoutes.education } element={ <HomeEducationPage /> } />
                    <Route path={ homeInnerRoutes.history } element={ <HomeHistoryPage /> } />
                </Route>

                <Route path={ errorRoute } element={ <ErrorPage /> } />
                <Route path={ notFoundRoute } element={ <NotFoundPage /> } />
            </Route>
        </Routes>
    )
}

export default MainRoutes
