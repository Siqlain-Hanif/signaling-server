# Signaling-server for simple-peer demo

### Simple socket.io implementation, tunnels based on scoket id's so multiple sessions can be supported

### Registered users are not persistant so on leaving their traces will be removed.

### Events
| Event | type | Description |
| --- | ---|--- |
| online-users|broadcast | All online users, triggered when new user is connected |
| new-connection |broadcast |When new user is connected |
| left-connection |broadcast |When user disconnects |
| call |tunnel |When user calls to x user|
| accepted-call |tunnel |When user accepts the x user call|
| rejected-call |tunnel |When user rejects the x user call|
| end-call |tunnel |When user ends the call|
