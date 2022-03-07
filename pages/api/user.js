import { getLoginSession } from '../../lib/auth'
import dbConnect from '../../lib/dbConnect'
import User from '../../models/User'

export default async function user(req, res) {
    try {
        const session = await getLoginSession(req)
        const user = (session && (await findUser({ _id: session._doc._id}))) ?? null


        res.status(200).json({ user })
    } catch (error) {
        console.error(error)
        res.status(500).end('Authentication token is invalid, please log in')
    }
}

async function findUser(data) {
    await dbConnect();
    const userFound = await User.findOne(data)
    return userFound
}