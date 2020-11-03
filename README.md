# gab

Chat application bootstrapped with <a href="http://example.com/" target="_blank">Create React App</a>.

Made by Ross Bartlett, 10145790.

**Click <a href="https://rossjbartlett.github.io/gab/" target="_blank">here</a> to gab!**

### Setup

Run the server with `npm run server`. To specify the port, use `PORT=xxxx npm run server`. The default is 4000.

Run the client with `npm start`. To specify the server, use `REACT_APP_SERVER=host:port npm start`. The deafult is localhost:4000.

The client runs on localhost:3000/gab.

### Setup on <span>linux.cpsc.ucalgary</span>.ca

Run both the server and client as above. On localhost, setup port forwarding using the command `ssh -N -f -L localhost:port:localhost:port <user>@linux.cpsc.ucalgary.ca` where `port` is the port on which the client runs (defaulted to 3000).

## In-Chat Commands

- Enter `/name newName` to change your username.
- Enter `/color newColor` to change your username color. `newColor` can be any HTML color name, or in the formats `#RRGGBB` or `RRGGBB`.
