const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'secret-key',
        resave: true,
        saveUninitialized: true
    })
);

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
})

const userInfo = [];

const isSignIn = (req, res, next) => {
    if(req.session.signIn){
        next();
    }else{
        res.redirect('/signin');
    }
};

const isSignOut = (req, res, next) => {
    if(req.session.signIn){
        res.redirect('/');
    }else{
        next();
    }
};

app.get('/', isSignIn, (req, res) => {
    res.render('home', { username: req.session.userName });
});

app.route('/signin').get(isSignOut, (req,res) => {
    req.session.emailIsValid = false;
    res.render('signIn', { isValidate: req.session.isValidate });
})
.post((req, res) => {
    console.log(req.body);
    const { email: inputEmail, password: inputPassword } = req.body;

    const isUser = userInfo.some((user) => (user.email === inputEmail && user.password === inputPassword));
    const user = userInfo.find((user) => (user.email === inputEmail && user.password === inputPassword));

    if(isUser){
        req.session.signIn = true;
        req.session.userName = user.userName;
        res.redirect('/');
    }else{
        req.session.isValidate = true;
        res.redirect('/signin');  
    }
});

app.route('/signup').get(isSignOut, (req, res) => {
    req.session.isValidate = false;
    res.render('signUp', { emailIsValid: req.session.emailIsValid });
    req.session.emailIsValid = false;
})
.post((req, res) => {
    const { userName: inputUserName, email: inputEmail, password: inputPassword } = req.body;
    const emailIsValid = userInfo.some((user) => user.email === inputEmail);
    if(emailIsValid){
        req.session.emailIsValid = true;
        res.redirect('/signup');
        return;
    }
    
    userInfo.push({
        userName: inputUserName,
        email: inputEmail,
        password: inputPassword
    });
    res.redirect('/signin');
});

app.post('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/signin');
});

app.get('*', (req, res) => {
    res.status(404).send(`
        <h1>404 error</h1>
        <p>Page not found go back</p>
    `);
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));