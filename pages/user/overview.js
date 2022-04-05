import { useUser } from '../../lib/hooks'

function Page() {
    const user = useUser({ redirectTo: '/api/login' })

    return (
        <div>
            siema
        </div>

    )
}

export default Page