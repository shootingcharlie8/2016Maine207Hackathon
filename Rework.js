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
		ValidCode = false;
		var GivenName = Code.dataName;
		var GivenCode = Code.dataCode;
		var GroupList = [];
		console.log("JS Test 1");
		if(NumberOfGuests != 0)
		{
			for(i=0;i<=NumberOfGuests;i++)
			{
				console.log(Code);
				if(HostSession[i].HostCode == GivenCode)
				{
					ValidCode = true;
					
					break;
				}
			}
		}else{
				//NumberOfGuests++
				console.log(Code);
				if(HostSession[0].HostCode == GivenCode)
				{
					ValidCode = true;
					
				}else{
					ValidCode = false;
					socket.emit('Bad Code', {
					result: false
					});
				}	
			}

			if(ValidCode == true)
			{
				console.log(NumberOfGuests + "This is ");
				UserSession[NumberOfGuests] = UserClass();
				UserSession[NumberOfGuests].UserName = GivenName;
				UserSession[NumberOfGuests].UserResponse = "";
				UserSession[NumberOfGuests].UserCode = GivenCode;
				console.log(UserSession[NumberOfGuests]);
				console.log(NumberOfGuests + " This is number of Guests");
				if(NumberOfGuests != 0)
				{
					for(i=0;i<=NumberOfGuests;i++)
					{
						if(UserSession[i].UserCode == GivenCode)
						{
							GroupList.push(UserSession[i].UserName);
							//GroupList[i] = UserSession[i].UserName;
							console.log(i + " This is place in array");
							console.log(UserSession.length + " This is length of the UserSession");
						}
					}
				}else{
						if(UserSession[0].UserCode == GivenCode)
						{
							GroupList.push(UserSession[0].UserName);
							//GroupList[i] = UserSession[i].UserName;
							//console.log(0 + " This is the first iteration");
							console.log(UserSession.length + " This is length of the UserSession");
							//console.log(UserSession.length);
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
				NumberOfGuests++;
			}else{
					ValidCode = false;
					socket.emit('Bad Code', {
					result: false
					});
				 }
	});

	socket.on("set game", function(Data){
		console.dir(Data);
		var HostUnitArray = Data['unitArray'];
		console.log(HostUnitArray);
		var HostCode = Data.dataCode;
		for(i=0;i<HostSession.length;i++)
		{
			if(HostSession[i].HostCode == HostCode)
			{
				HostSession[i].HostArrayState = HostUnitArray;
			}
		}
		var HostTierArray = Data['unitTierArray'];
		var JSONData = {
			Code:HostCode,
			Units:0,
			Tier:0
		};
		JSONData['Units'] = HostUnitArray;
		JSONData['Tier'] = HostTierArray;
		io.sockets.emit('game starter', JSONData);
	});
	
	socket.on("player update", function(Code){
		var CurrentMobArray = [];
		var PHA = []//PLayer health array
		var AllDone = false;
		console.log(Code);
		if(Code.action == "Attack")
		{
			for(i=0;i<HostSession.length;i++)
			{
				if(HostSession[i].HostCode == Code.code)
				{
					CurrentMobArray = HostSession[i].HostArrayState;
					break;
				}
			}
				CurrentMobArray[Code.place] -= 10;
				console.log(CurrentMobArray[Code.place])
		}else if(Code.action == "Heal")
		{
			for(i=0;i<UserSession.length;i++)
			{
				if(UserSession[i].UserCode == Code.code)
				{
					if(UserSession[i].UserName == Code.Per)
					{
						UserSession[i].UserHealth += 10
					}
				}
			}
			
		}else if(Code.action == "defend")
		{
			for(i=0;i<UserSession.length;i++)
			{
				if(UserSession[i].UserCode == Code.code)
				{
					if(UserSession[i].UserName == Code.name)
					{
						UserSession[i].UserDefendState = true;
					}
				}
			}
		}
		
		for(i=0;i<UserSession.length;i++)
		{
			if(UserSession[i].UserCode == Code.code)
			{
				console.log("We made it into the first step");
				console.log(UserSession[i]);
				console.log(Code.name);
				if(UserSession[i].UserName == Code.name)
				{
					PHA = UserSession[i].UserHealth;
					UserSession[i].UserTurnState = "D";
					console.log(UserSession[i]);
				}
			}
			if(UserSession[i].UserCode == Code.code)
			{
				if(UserSession[i].UserTurnState == "D")
				{
					AllDone = true;
					console.log("We did it boys");
				}else{
					AllDone = false;
					console.log("We failed boys");
				}
			}
		}
		if(AllDone == true)
		{
			for(i=0;i<UserSession.length;i++)
			{
				if(UserSession[i].UserCode == Code.code)
				{
					UserSession[i].UserTurnNumber += 1;
					UserSession[i].UserTurnState = "ND";
				}
			}
			var SendData = {
					Code:GivenCode,
					ArrayOf:0,
					ArrayOfHealth:0
			}
			SendData[ArrayOfHealth] = PHA;
			SendData[ArrayOf] = CurrentMobArray;
			io.sockets.emit('host starter', SendData);
				
			console.log("Chris Zhu is a god");
		}
	});
});
	
	socket.on("host update", function(Code){
		
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