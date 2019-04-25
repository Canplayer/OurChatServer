const WebSocket = require('ws')
const ws = new WebSocket.Server({ port: 56789 })
const fs = require('fs')
let registerDatabase = []
let loggedUser = {}
function startServer() {
    ws.on('connection', (ws) => {
        ws.on('message', (message) => {
            try {
                let data = JSON.parse(message)
                if (data.type != null) {
                    if (data.type === 1) {
                        let userName = data.userName;
                        let content = data.content;
                        console.log(`message received: ${message}`)
                        Object.keys(loggedUser).forEach((name) => {
                            if (name !== userName) {
                                loggedUser[name].send(JSON.stringify({
                                    type: 1,
                                    content: content,
                                    userName: userName
                                }))
                            }
                        })
                    } else if (data.type === 0) {
                        let userName = data.userName;
                        if (registerDatabase.indexOf(userName) !== -1) {
                            ws.send(JSON.stringify({
                                type: 3,
                                success: false
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                type: 3,
                                success: true
                            }));
                            console.log(`User Logged: ${userName}`)
                            registerDatabase.push(userName)
                            loggedUser[userName] = ws
                            ws.on('close', () => {
                                console.log(`User Disconnected: ${userName}`)
                                let index = registerDatabase.indexOf(userName)
                                registerDatabase.splice(index, 1)
                            })
                        }
                    }
                }
            } catch{
                console.log(`corrupted message: ${message}`)
            }
        })
    })
}
startServer()