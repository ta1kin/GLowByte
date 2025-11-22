import { Outlet } from 'react-router-dom'
import type { JSX } from 'react'


function HomeLayout(): JSX.Element {
    return (
        <div className="home-layout">
            <Outlet />
        </div>
    )
}

export default HomeLayout
