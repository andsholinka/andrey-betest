const Joi = require('joi');

const createUser = (data) => {
    const schema = Joi.object({
        userName: Joi.string().required(),
        accountNumber: Joi.number().required(),
        emailAddress: Joi.string().email().required(),
        identityNumber: Joi.number().required(),
    });

    return schema.validate(data);
};

module.exports = {
    createUser
}