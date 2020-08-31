let mongoose = require('mongoose');
let bcrypt = require('bcrypt-node')
let userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true}
})

userSchema.pre('save', function(callback){
    let user = this;
    if(!user.isModified('password')) return callback();

    bcrypt.genSalt(5, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return callback(err);

            user.password = hash;

            callback();

        })
    })
})

userSchema.methods.verifyPassword = function(password, callback) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) throw callback(err);
        callback(null, isMatch)
    });
}

module.exports = mongoose.model('User', userSchema)