var express = require('express');
var router = express.Router();
var Peer = require('simple-peer')
var wrtc = require('wrtc')
router.get('/', function (req, res, next) {
    let registeredOnlineUsers = req.registeredOnlineUsers;
    res.json(registeredOnlineUsers);
});
router.get('/clear', function (req, res, next) {
    req.registeredOnlineUsers = [];
    res.json(registeredOnlineUsers);
    io.emit('online_users', registeredOnlineUsers); //Can sent one user as well
});
router.post('/ping', function (req, res, next) {
    let io = req.io;
    let registeredOnlineUsers = req.registeredOnlineUsers;

    let { username, soc_id } = req.body;
    let newUser = {
        username: username,
        soc_id: soc_id,
        peer_id: Date.now(),
        status: 'available'

    };
    let index = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == soc_id
    })
    if (index >= 0) {
        registeredOnlineUsers.splice(index, 1, newUser);
    } else {
        registeredOnlineUsers.push(newUser);
    }
    //This emits a new connection so the users can add this to the list of online users
    io.emit('new_connection', newUser);
    res.json(newUser);
});
router.post('/call', function (req, res, next) {
    let io = req.io;
    let registeredOnlineUsers = req.registeredOnlineUsers;
    //soc_id: user hows calling
    //to_id: user to call
    let { soc_id, to_id, data } = req.body;
    let toIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == to_id
    });
    let myIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == soc_id
    });
    if (toIndex >= 0 && myIndex >= 0 && registeredOnlineUsers[toIndex].status == 'available') {
        try {
            registeredOnlineUsers[toIndex].status = 'busy';
            registeredOnlineUsers[myIndex].status = 'busy';
            io.to(to_id).emit("call", { user: registeredOnlineUsers[myIndex], data: data });
            io.emit('online_users', registeredOnlineUsers); //Can sent one user as well
            res.json('Ringing');
        } catch (e) {
            console.log(e);
            next('User is busy');
        }
    } else {
        next('User is busy');
    }
});


router.post('/accept-call', function (req, res, next) {
    let io = req.io;
    let registeredOnlineUsers = req.registeredOnlineUsers;
    //soc_id: user how's accepted the call
    //to_id: how's call got accepted
    let { soc_id, to_id, data } = req.body;
    let toIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == to_id
    });
    let myIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == soc_id
    });
    if (toIndex >= 0 && myIndex >= 0) {
        registeredOnlineUsers[toIndex].status = 'busy';
        registeredOnlineUsers[myIndex].status = 'busy';
        io.to(to_id).emit("accepted-call", { user: registeredOnlineUsers[toIndex], data: data });
        io.emit('online_users', registeredOnlineUsers); //Can sent one user as well
        res.json('Accepted');
    } else {
        next('User is busy');
    }
});
router.post('/reject-call', function (req, res, next) {
    let io = req.io;
    let registeredOnlineUsers = req.registeredOnlineUsers;
    //soc_id: user how's rejected the call
    //to_id: how's call got rejected
    let { soc_id, to_id } = req.body;
    let toIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == to_id
    });
    let myIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == soc_id
    });
    if (toIndex >= 0 && myIndex >= 0 && (registeredOnlineUsers[toIndex].status == 'available' || registeredOnlineUsers[toIndex].status == 'busy')) {
        registeredOnlineUsers[toIndex].status = 'available';
        registeredOnlineUsers[myIndex].status = 'available';
        io.to(to_id).emit("rejected-call");
        io.emit('online_users', registeredOnlineUsers); //Can sent one user as well
        res.json('Rejected');
    } else {
        next('User is busy');
    }
});
router.post('/end-call', function (req, res, next) {
    let io = req.io;
    let registeredOnlineUsers = req.registeredOnlineUsers;
    //soc_id: user how's rejected the call
    //to_id: how's call got rejected
    let { soc_id, to_id } = req.body;
    let toIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == to_id
    });
    let myIndex = registeredOnlineUsers.findIndex((user) => {
        return user.soc_id == soc_id
    });
    if (toIndex >= 0 && myIndex >= 0) {
        registeredOnlineUsers[toIndex].status = 'available';
        registeredOnlineUsers[myIndex].status = 'available';
        io.to(to_id).emit("end-call");
        io.to(soc_id).emit("end-call");
        io.emit('online_users', registeredOnlineUsers); //Can sent one user as well
        res.json('Ended');
    } else {
        next('User is busy');
    }
});

module.exports = router;