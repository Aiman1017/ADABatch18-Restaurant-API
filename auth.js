let JwtStrategy = require('passport-jwt').Strategy;

let ExtractJwt = require('passport-jwt').ExtractJwt;

let User = require('./user');

let config = require('./config');

let passport = require('passport');
const user = require('./user');

let params = {
    secretOrKey: config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = function(){
    const strategy = new JwtStrategy(params, function(payload, done){
        User.findOne({id: payload.id}, (err, user) => {
            if (err){
                return done(err, false)
            } 
            if(user){
                done(null, user)
            }
            else{
                done(null, false)
            }
        })
    })

    passport.use(strategy);
    return{
        initialize: function(){
            return passport.initialize();
        },
        authenticate: function(){
            return passport.authenticate('jwt', {session: false})
        }
    }
}