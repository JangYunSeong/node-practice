const express = require('express');
const morgan = require('morgan');
const path = require('path');

const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/test';
const connect = mongoose.connect(url);
const personRouter = require('./routes/personRouter');

connect.then((db)=>{
    console.log('connected correctly to server');
}, (err) => {
    console.log(err);
});

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use('/persons', personRouter);
app.set('port', process.env.PORT || 3000);

app.use('/', express.static(path.join(__dirname, '/public')));

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

app.listen(app.get('port'), ()=>{
    console.log('running at port:',app.get('port'));
});