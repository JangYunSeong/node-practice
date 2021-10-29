const express = require('express');
const cookieparser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const nunjucks = require('nunjucks');
const session = require('express-session');
const passport = require('passport');

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const {sequelize} = require('./models');
const passportConfig = require('./passport');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT||8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express : app,
    watch: true,
});
sequelize.sync({force:false})
    .then(() => {
        console.log('database connection success');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieparser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly : true,
        secure : false,
    },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req,res,next) =>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});
app.use((err,req,res,next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err:{};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
})