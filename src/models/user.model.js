module.exports = mongoose => {

    const schema = mongoose.Schema({
        userName: {
            type: String,
            unique: true
        },
        accountNumber: {
            type: Number,
            unique: true
        },
        emailAddress: {
            type: String,
            unique: true
        },
        identityNumber: {
            type: Number,
            unique: true,
        },
    }, {
        timestamps: true
    });

    schema.method("toJSON", function () {
        const {
            __v,
            _id,
            ...object
        } = this.toObject();
        object.id = _id;
        return object;
    })

    return mongoose.model('User', schema);
}