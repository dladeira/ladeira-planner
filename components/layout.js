import Head from 'next/head'
import { useRouter } from 'next/router'

import Navbar from './navbar'
import Userbar from './userbar'

function Component({ children }) {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Ladeira Planner</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
            </Head>
            {router.pathname.startsWith("/user") ? (
                <div className="userBody">
                    <Userbar />
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