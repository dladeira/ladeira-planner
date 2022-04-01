import dbConnect from '../../lib/dbConnect'
import User from '../../models/User'

async function Route(req, res) {
    req.body = JSON.parse(req.body)
    await dbConnect()

    var user = await User.findOne({ email: req.body.email })
    user.categories = req.body.categories

    await user.save()

    res.status(200).send()
}

export default Route