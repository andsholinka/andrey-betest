const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./src/models');

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
    origin: '*',
}

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors(corsOptions));

db.mongoose.connect(db.url)
    .then(() => {
        console.log('MongoDB Connected...');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB...', err);
        process.exit();
    })

app.get('/sys/ping', (req, res) => {
    res.send('ok');
});

require('./src/routes/user.routes')(app);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});