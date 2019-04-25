const WebSocket = require('ws')
const ws = new WebSocket.Server({ port: 56789 })
const fs = require('fs')
const registerDatabaseName = './registerDatabaseName.json'
let registerDatabase = {
}

fs.exists(registerDatabaseName, (exists) => {
    if (exists) {
        fs.readFile(registerDatabaseName, (err, data) => {
            registerDatabase = JSON.parse(data.toString())
            startServer()
        })
    } else {
        fs.writeFile(registerDatabaseName, JSON.stringify(registerDatabase), (err) => {
            startServer()
        })
    }
})
let loggedUser = []
function startServer() {
    ws.on('connection', (ws) => {
        ws.on('message', (message) => {
            console.log(message)
            try {
                let data = JSON.parse(message)
                console.log(data)
                if (data.type != null) {
                    if (data.type === 1) {
                        let userName = data.userName;
                        let content = data.content;
                        loggedUser.forEach(item => {
                            item.send(JSON.stringify({
                                type: 1,
                                content: content,
                                userName: userName
                            }))
                        })
                    } else if (data.type === 0) {
                        let userName = data.userName;
                        let password = data.password;
                        if (registerDatabase[userName] && registerDatabase[userName] === password) {
                            ws.send(JSON.stringify({
                                type: 3,
                                success: true
                            }));
                            console.log(`User Logged ${userName}`)
                            loggedUser.push(ws)
                        } else {
                            ws.send(JSON.stringify({
                                type: 3,
                                success: false
                            }));
                        }
                    } else if (data.type === 2) {
                        console.log('sign up')
                        let userName = data.userName;
                        let password = data.password;
                        if (registerDatabase[userName]) {
                            // reply existed
                            ws.send('userName existed')
                        } else {
                            registerDatabase[userName] = password
                            fs.writeFile(registerDatabaseName, JSON.stringify(registerDatabase), (err) => {
                                // reply success
                                ws.send('user created')
                            })
                        }
                    }
                }
            } catch{

            }
        })
    })
}