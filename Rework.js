var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express'); //Module for interface
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json({ type: 'application/*+json' })); 
var HostClass = require('./HostClass');
var UserClass = require('./UserClass');
var HostSession = [];//This contains the DJ Name and Code 
var UserSession = [];//This contains the Guest Name, the code entered, and their vote 
var UniqueCode = true;//If else statement for genRand()
var ValidCode = false;
var genCode;//User Code 
var NumberOfHosts = 0;
var NumberOfGuests = 0;


io.on('connection', function (socket) {
	
	socket.on("generate session", function(Name){
		console.log("Test 1 + " + Name);
		genRand();
		console.log("Test 2 = " + genCode);
		HostSession[NumberOfHosts] = HostClass();
		HostSession[NumberOfHosts].HostCode = genCode;
		HostSession[NumberOfHosts].HostSessionName = Name;
		console.log("Test 3 = " + HostSession[NumberOfHosts].HostCode);
		socket.emit('recieve code', {
			Code: genCode
		});
		console.log("Test 4");
		console.log(HostSession.length + " All the people in host Session");
		NumberOfHosts++;
	});
	
	socket.on("join session", function(Code){//Checks the code
		var GivenName = Code.dataName;
		var GivenCode = Code.dataCode;
		var GroupList = [];
		console.log("JS Test 1");
		for(i=0;i<NumberOfHosts;i++)
		{
			console.log(Code);
			if(HostSession[i].HostCode == GivenCode)
			{
				ValidCode = true;
				TempHolder = i;//This holds the position to store data
				break;
			}else{
				ValidCode = false;
				socket.emit('Bad Code', {
					result: false
				});
				console.log("Before the break");
				break;
				console.log("After the break");
			}	
		}
			if(ValidCode == true)
			{
				NumberOfGuests++;
				UserSession[TempHolder] = UserClass();
				UserSession[TempHolder].UserName = GivenName;
				UserSession[TempHolder].UserResponse = "";
				UserSession[TempHolder].UserCode = GivenCode;
				console.log(UserSession[TempHolder]);
				console.log(NumberOfGuests + " This is number of Guests");
				if(NumberOfGuests != 1)
				{
					for(i=1;i<NumberOfGuests;i++)
					{
						if(UserSession[i-1].UserCode == GivenCode)
						{
							GroupList.push(UserSession[i-1].UserName);
							//GroupList[i] = UserSession[i].UserName;
							console.log(i + " This is place in array");
							console.log(UserSession.length + " This is length of the UserSession");
						}
					}
				}else{
					for(i=0;i<NumberOfGuests;i++)
					{
						if(UserSession[i].UserCode == GivenCode)
						{
							GroupList.push(UserSession[i].UserName);
							//GroupList[i] = UserSession[i].UserName;
							console.log(i + " This is the first iteration");
							console.log(UserSession.length + " This is length of the UserSession");
							//console.log(UserSession.length);
						}
					}
				}
				console.log(GroupList + " Everyone in the group list array");
				socket.emit('user recieve code', {
					Code: GivenCode
				});
				io.sockets.emit('displayName', {
					Code:GivenCode,
					List:GroupList
				});
			}
	});
});
	
	
	
	
function genRand()	{
	genCode = Math.floor(Math.random() * 100000);
	if(NumberOfHosts != 0)
	{
		for(i=0;i<NumberOfHosts;i++)
		{
			console.log(genCode);
			console.log(HostSession[i]);
			if(HostSession[i].HostCode == genCode)
			{
				UniqueCode = false;
				break;
			}
		}
		if(UniqueCode == false)
		{
			UniqueCode = true;
			genRand();
		}
	}
	}		

function send404Response(response){
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("Error 404: Page not found!");
	response.end();
};

app.use(express.static(__dirname + '/public'));

server.listen(3000, function () {
  console.log('Server listening at port %d 3000');
});