import passport from 'passport';
import User from '../models/User'
import dbConnect from './dbConnect'

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((req, id, done) => {
    User.findOne({ _id: id }, (err, user) => {
        if (err)
            done(err)
        done(null, user)
    })
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.ORIGIN + "/api/login/google",
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    await dbConnect()

    User.findOne({ email: profile.emails[0].value }, (err, user) => {
        if (err)
            return done(err)

        if (user != null)
            return done(null, user)

        var user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
        })

        user.save().then(() => done(null, user))
    })
}
));

export default passport;