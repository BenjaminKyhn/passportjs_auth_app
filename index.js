const express = require('express');
const passport = require('passport');
const app = express();

app.use(express.static(__dirname));

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('App listening on port ' + port));

/* MONGOOSE SETUP */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const url = `mongodb+srv://dbUser:VhAMa0Ugulc7XEXi@cluster0.o6tgn.mongodb.net/passport?retryWrites=true&w=majority`;

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/* PASSPORT LOCAL AUTHENTICATION */

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

/* ROUTES */

const connectEnsureLogin = require('connect-ensure-login');

app.post('/login', (req, res, next) => {
    passport.authenticate('local',
        (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.redirect('/login?info=' + info);
            }

            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/');
            });

        })(req, res, next);
});

app.get('/login',
    (req, res) => res.sendFile('html/login.html',
        { root: __dirname })
);

app.get('/',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/index.html', {root: __dirname})
);

app.get('/private',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/private.html', {root: __dirname})
);

app.get('/user',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.send({user: req.user})
);

/* REGISTER SOME USERS */

// Comment the below 3 lines out if you need to add some users to the database
// UserDetails.register({username:'paul', active: false}, 'paul');
// UserDetails.register({username:'jay', active: false}, 'jay');
// UserDetails.register({username:'roy', active: false}, 'roy');