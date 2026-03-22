const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/motorcycle_shop').then(async () => {
    const users = await User.find({});
    console.log('--- DANH SÁCH USERS TRONG DB ---');
    users.forEach(u => {
        console.log(`Email: ${u.email} | Verified: ${u.isEmailVerified} | Token: ${u.emailVerifyToken}`);
    });
    console.log('--------------------------------');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
