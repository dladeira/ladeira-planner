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