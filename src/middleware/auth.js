const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {

    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) return res.status(401).send({
            status: res.statusCode,
            message: 'Unauthorized!'
        });

        jwt.verify(token, process.env.SECRET_KEY, async function (err, decoded) {
            if (err) return res.status(401).send({
                status: res.statusCode,
                message: 'Failed to authenticate token.'
            });

            res.locals.userId = decoded.data.id;
            next();
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = auth;