// for better performance - to avoid searching in DOM
let content = document.getElementById("content");
let input = document.getElementById("input");
let flag = document.getElementById("status");
// my color assigned by the server
let myColor = false;
// my name sent to the server
let myName = false;
window.WebSocket = window.WebSocket || window.MozWebSocket;

// connect the websocket
let connection = new WebSocket("ws://localhost:1337");

connection.onopen = function () {
  // first we want users to enter their names
  input.removeAttribute("disabled");
  flag.innerText = "Choose name:";
  console.log("wokring");
};

connection.onerror = function (error) {
  // just in there were some problems with connection...
  content.innerText = `Sorry, but there\'s some problem with your ``connection or the server is down.`;
};


// most important part - incoming message
connection.onmessage = function (message) {

  //get json data
  try {
    var json = JSON.parse(message.data);
    console.log(json);
  } catch (e) {
    console.log(`Invalid Json: ${message.data}`);
    return;
  }

  // check json type is color
  if ((json.type === "color")) {
    myColor = json.data;
    flag.innerText = `${myName}:`;
    flag.setAttribute("color", myColor);
    input.removeAttribute("disabled");
    input.setAttribute("focus", "true");
  }
  
  //check json type is history
  else if ((json.type === "history")) {
    content.innerHTML=" ";
    for (let i = 0; i < json.data.length; i++) {
      addMessage(
        json.data[i].author,
        json.data[i].text,
        json.data[i].color,
        new Date(json.data[i].time),
        json.data[i].time
      );
    }
  }
  
  //check json type is message 
  else if (json.type === "message") {
    input.removeAttribute("disabled");
    addMessage(
      json.data.author,
      json.data.text,
      json.data.color,
      new Date(json.data.time)
    );
  }
  
  // if invalid json
  else {
    console.log("Hmmm......, I've never seen JSON like this:" + json);
  }

};


// event listener on enter key press message send
input.addEventListener("keypress", function (e) {
  if (e.key == "Enter") {
    let msg = input.value;
    if (msg === null) {
      console.log("Please Enter the message");
    } else {
      connection.send(msg);
      input.value=" ";
    }
    if(myName==false){
      myName= msg;
    }
  }
});


// display message in page
function addMessage(author, message, color, dt, time){
  let getHour= dt.getHours() < 10 ? '0'
 + dt.getHours() : dt.getHours();

  let getMin=dt.getMinutes() < 10
  ? '0' + dt.getMinutes() : dt.getMinutes();


  console.log("add message working"); 
  content.innerHTML+=`<p><span style="color:${color}">
  ${author}</span> @ ${getHour}:${getMin}
  :  ${message} <input type="button" name="delete" value="Del" class="delBtn" onclick="delClickHandler(${time}, '${author}')"></p>`;
}

function delClickHandler(time, author) {
  if(author==myName){
    console.log(time, author);
    connection.send(time);
    content.innerHTML=" ";
  }
}