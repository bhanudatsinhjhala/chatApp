// import libraries
const webSocketServer= require("websocket").server;
const http= require("http");


// defining variables
    let clients=[];
    let colors=["pink", "yellow", "Red", "orange"];
    colors.sort((a,b)=> Math.random()> 0.5 )
    let history=[];

    // helper function for escaping input strings
        function htmlEntities(str) {
            return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

/* http Server code */

var server= http.createServer(function (request, response){


});

server.listen(1337, function(){
    console.log("Server is running on 1337");
});


/* Web socket Code */

let wsServer= new webSocketServer({
    httpServer: server,
});

// on connection request
    wsServer.on("request", function(request){
        
        console.log( (new Date()) + "Connection from origin " + request.origin);
        let connection= request.accept(null, request.origin);

        let index=clients.push(connection)-1;
        let userName= false;
        let userColor=false;


        // send back chat history
            if(history.length>0){
                connection.sendUTF(
                    JSON.stringify({type: 'history', data: history})
                );
            }

        // user message sent
            connection.on('message', function(message){
                if(userName=== false){

                    // remember ueserName
                    userName= htmlEntities(message.utf8Data);
                    userColor= colors.shift();
                    
                    connection.sendUTF(
                        JSON.stringify({type:'color', data: userColor})
                    );
                    console.log((new Date()) + "User is Known as " + userName +
                     " with color " +userColor)
                    if(message.type==='utf8'){
                        console.log(message.utf8Data);
                    }
                }else{

                    //log broadcast messages

                    console.log( (new Date()) + `  Recieved message from ${userName}: ${message.utf8Data}`);

                    // keep histroy of all messages

                    let obj ={
                        author: userName,
                        color: userColor,
                        time: (new Date()).getTime(),
                        text: htmlEntities(message.utf8Data),
                    }

                    history.push(obj);
                    history= history.slice(-100);


                    //broadcast message to all connected Clients

                    let json= JSON.stringify({type:'message', data: obj});

                    for(let i=0; i<clients.length; i++){
                        clients[i].sendUTF(json);
                    }
                }
            });

        // on connection close
            connection.on('close', function (connection){
                console.log(connection);
                });
    } )