const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const nunjucks = require('nunjucks');

dotenv.config();
const indexRouter = require('./routes');
const userRouter = require('./routes/user');
const app = express();
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'html');

nunjucks.configure('views', {
    express : app,
    watch : true,
});

app.use(morgan('dev'));
/*app.use((req,res,next) => {
    if(process.env.NODE_ENV == 'production'){
        morgan('combine')(req,res,next);
    } else {
        morgan('dev')(req,res,next);
    }
})*/
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extend : false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
/*app.use(
    morgan('dev'),
    express.static(path.jlin(__dirname, 'public')),
    express.json(),
    express.urlencoded({extended : false}),
    cookieParser(process.env.COOKIE_SECRET),
);*/
app.use(session({
    resave : false,
    saveUninstallized : false,
    secret : process.env.COOKIE_SECRET,
    cookie : {
        httpOnly : true,
        secure : false,
    },
    name : 'session-cookie',
}));
/*const multer = require('multer'); // multer 사용
const fs = require('fs');

try{
    fs.readdirSync('uploads');
} catch(error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}
const upload = multer({
    storage : multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file,done) {
            const ext = path.extname(file.orginalname);
            done(null, path,basename(file,originalname, ext) + Data.now() + ext);   
        },
    }),
    limits : {fileSize : 5 * 1024 * 1024},
});
app.get('/upload', (req,res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'));
});
app.post('/upload',
    upload.fields([{name: 'image1'}, {name : 'image2'}]),
    (req,res) => {
        console.log(req.files, req.body);
        res.send('ok');
        },
);*/
/*app.use('/', (req,res,next) => {
    console.log('모든 요청에 다 실행됩니다.');
    next();
})

app.get('/', (req,res,next) => {
   console.log('GET/ 요청에만 실행됩니다.');
   next();
}, (req,res) => {
    throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
});*/
app.use('/', indexRouter);
app.use('/user', userRouter);

app.use((req, res, next)=> {
    res.status(404).send('Not Found');
});

app.use((err,req,res,next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번에서 대기 중');
});

app.use((req,res,next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next('error');
});

app.use((err,req,res,next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});