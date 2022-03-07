import Head from 'next/head'

import Navbar from './navbar'

function Component({ children }) {

    return (
        <>
            <Head>
                <title>Ladeira Planner</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&family=Unkempt:wght@700&display=swap" rel="stylesheet" />
            </Head>
            <Navbar />
            {children}
        </>
    )
}

export default Component