import express from 'express';
import userModel from './controllers/user.controller.js'

const app = express();

app.post("/signup", userModel.userSignup());
app.post("/login", userModel.userSignin());

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
})