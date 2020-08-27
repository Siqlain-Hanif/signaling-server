var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

//Keeping track of registered users non-persistent
app.io = require('socket.io')();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


let registeredOnlineUsers = [];
app.io.on('connection', socket => {
    console.log("User Connected");
    socket.emit("online_users", registeredOnlineUsers);
    console.log(socket.id);
    socket.on('disconnect', () => {
        let index = registeredOnlineUsers.findIndex((user) => {
            return user.soc_id == socket.id;
        })
        if (index >= 0) {
            //On disconenct we delete the user ref
            let leftuser = registeredOnlineUsers.splice(index, 1);
            socket.broadcast.emit('left_connection', leftuser);
        }
    });

});
//Middleware to add the io client in req body so the routes can use that;
app.use(function(req, res, next) {
    req.io = app.io;
    req.registeredOnlineUsers = registeredOnlineUsers;
    next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json(err);
});

module.exports = app;