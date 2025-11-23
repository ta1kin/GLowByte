import type { JSX } from 'react'
import { previewRoute } from '@/shared/config'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'



function HLHeader(): JSX.Element {
    const navigate = useNavigate()

    return (
        <header className="home-layout__header">
            <div className='header-logo'></div>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(previewRoute)}
            >На главную</Button>
        </header>
    )
}

export default HLHeader
