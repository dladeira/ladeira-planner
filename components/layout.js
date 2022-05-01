import Head from 'next/head'
import { useRouter } from 'next/router'

import Navbar from './navbar'
import Userbar from './userbar'
import WeekHeader from './weekHeader'

function Component({ children }) {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Ladeira Planner</title>

                {/* Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

                {/* Icons */}
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700;900&display=swap" rel="stylesheet" />
                <script src="https://kit.fontawesome.com/fc8fb46941.js" async={true} crossOrigin="anonymous" />

                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            {router.pathname.startsWith("/user") ? (
                <div className="userBody">
                    <Userbar />
                    <WeekHeader />
                    {children}
                </div>
            ) : (
                <div className="mainBody">
                    <Navbar />
                    {children}
                </div>
            )}

        </>
    )
}

export default Component