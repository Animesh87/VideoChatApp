const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const {v4 : uuidV4} = require("uuid");
const mongoose = require("mongoose");

const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set('view engine' , 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

var profilename = "sample";
var username = "";

mongoose.connect("mongodb://localhost:27017/VideoChatDB", {useNewUrlParser : true ,  useUnifiedTopology: true});

const userSchema =  {
	username : String,
	email : String,
	password : String
};



const User = mongoose.model("User",userSchema);



app.get("/", (req,res) => {
	const new_link = uuidV4();
	res.render('home' , {link : new_link , userName: profilename});
})

app.get("/logout", (req,res) => {
	const new_link = uuidV4();
	res.render('home' , {link : new_link , userName: "sample"});
})


app.get("/new", (req,res) => {
	res.redirect(`/${uuidV4()}`);
});


app.get("/:room", (req,res) => {
	res.render('index' , {roomId : "/"+req.params.room, user : username});
})


io.on("connection" , (socket) => {
	socket.on("join-room" , (roomId , userId) => {
		socket.join(roomId);
		socket.to(roomId).emit('user-connected',userId);
	})

	socket.on("send", (roomId , message) => {
		socket.to(roomId).emit('receive' , message);
	})
})




server.listen(3000 , () =>{
	console.log("Hello");
})


app.post("/", (req,res) => {
	const userNameSignUp = req.body.username;
	const EmailSignUp = req.body.email;
	const PasswordSignUp = req.body.password;
	const EmailSignIn = req.body.emailIn;
	const PasswordSignIn = req.body.passwordIn;
	const Link = req.body.link;
	if(Link !== undefined)
	{
		console.log(Link);
		res.redirect("/"+Link);
	}
	else if(userNameSignUp !== undefined)
	{
		const user = new User ({
			username : userNameSignUp,
			email : EmailSignUp,
			password : PasswordSignUp
		});
 		User.findOne({email: user.email} , function(err, founduser){
			if(err)
			{
				console.log(err);
			}
			else
			{
				if(founduser)
				{
					/*if(founduser.password === PasswordSignIn)
					{
						res.redirect("/");
						console.log("user found");
					}
					else
					{
						console.log("Password not matched");
					}*/
					console.log("User already exist!!");
				}
				else
				{
					user.save();
					const new_link = uuidV4();
					profilename = user.username;
					res.render("home" , {link: new_link , userName : user.username});
					console.log("User saved.");
				}
			}
		})	

	}
	else if(EmailSignIn !== undefined)
	{
		User.findOne({email: EmailSignIn} , function(err, founduser){
			if(err)
			{
				console.log(err);
			}
			else
			{
				if(founduser)
				{
					if(founduser.password === PasswordSignIn)
					{
						profilename = founduser.username;
						const new_link = uuidV4();
						res.render("home",{link : new_link , userName : founduser.username});
						console.log("user found");
					}
					else
					{
						console.log("Password not matched");
					}
				}
				else
				{
					console.log("User not found!!!");
				}
			}
		})

	}
})

/*app.post("/:room",(req,res) => {
	const msg = req.body.message;
	console.log(msg);
})*/