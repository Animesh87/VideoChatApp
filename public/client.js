const socket = io('/');
const outerGrid = document.getElementsByClassName("wrapper")[0];

const myPeer = new Peer(undefined , {
	host : '/',
	port : '3001'
})


const myVideo = document.createElement('video');
myVideo.muted = true;

var currentPeer;

var count = 0;
var new_user = 1;

navigator.mediaDevices.getUserMedia({
	video : true,
	audio : {
    echoCancellation : true,
    noiseSupression : true
  }
}).then(stream => {
    var myStream = stream;
    addVideoStream(myVideo,stream);

    video_button = $(".fa-video");
    audio_button = $(".fa-microphone");

    video_button.click(function(){
      myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
      
      if(!(myStream.getVideoTracks()[0].enabled))
      {
          //myStream.getVideoTracks()[0].stop();
          video_button.removeClass("comm");
          video_button.removeClass("fa-video");
          video_button.addClass("fa-video-slash");
          video_button.addClass("color");

      }
      else
      {
         video_button.removeClass("color");
         video_button.removeClass("fa-video-slash");
         video_button.addClass("fa-video");
         video_button.addClass("comm");
      }
      //myVideo.srcObject = "https://image.shutterstock.com/image-vector/default-avatar-profile-social-media-260nw-1920331226.jpg";
    
    });


    audio_button.click(function(){
    myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
    if(!(myStream.getAudioTracks()[0].enabled))
      {
          audio_button.removeClass("comm");
          audio_button.removeClass("fa-microphone");
          audio_button.addClass("fa-microphone-slash");
          audio_button.addClass("color");
      }
      else
      {
          audio_button.removeClass("color");
          audio_button.removeClass("fa-microphone-slash");
          audio_button.addClass("fa-microphone");
          audio_button.addClass("comm");
      }

  });


    myPeer.on('call' , call => {
    	call.answer(stream);

    	const video = document.createElement('video');

    	call.on('stream', userVideoStream => {
    		addVideoStream(video,userVideoStream);
    	})
    })
 

    socket.on('user-connected', (userID) => {
		console.log("User-connected "+userID);
		const fc = () => connectToNewUser(userID, stream)
		timerid = setTimeout(fc, 1000 )
	
	})
}).catch((err) => {
	console.log(err);
})


myPeer.on('open', id => {
	socket.emit('join-room', roomID,id);
})


function connectToNewUser(userID,stream) {
   new_user++;
   const call = myPeer.call(userID,stream);
   const video = document.createElement('video');
   call.on('stream', userVideoStream => {
      console.log("omg");
   		addVideoStream(video,userVideoStream);
      currentPeer = call.peerConnection;
   },function(err){
   	  console.log(err);
   });

   call.on('close', () => {
   		video.remove();
   })
}




function addVideoStream(video,stream) {
	video.srcObject = stream;
  count++;
  console.log(video.srcObject+"for "+count);
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
  const innerGrid = document.createElement("div");
  innerGrid.className = "inner";
	innerGrid.append(video);
  outerGrid.append(innerGrid);
  if(count>3 && count<9)
  {
     outerGrid.style.gridTemplateColumns = "repeat("+(count-(count-3))+", 1fr)";
  }
  else if(count === 3)
  {
     outerGrid.style.gridTemplateColumns = "repeat("+(count-1)+", 1fr)";
  }
 
  for(var i=0;i<count;i++)
  {
     var remove_div = document.getElementsByClassName("inner")[i].querySelector('video');
     if(remove_div === null)
     {
        document.getElementsByClassName("inner")[i].remove();
     }
  }
}


document.getElementById("present").addEventListener('click', (e) => {
  navigator.mediaDevices.getDisplayMedia({
    video : {
      cursor : 'always'
    },
    audio : {
      echoCancellation : true,
      noiseSupression : true
    }
  }).then((stream) => { 
      let videoTracks = stream.getVideoTracks()[0];
      let sender = currentPeer.getSenders().find(function(s) {
        return s.track.kind == videoTracks.kind;
      }) 
      sender.replaceTrack(videoTracks);
  }).catch((err) => {
    console.log("Unable to get display media");
  });
})


function add()
{
   $("#join_link").show();
}

function signup()
{
   $("#exampleModalCenter1").modal("show");
   $("#signin-container").css("display","none");
   $("#signup-container").show();
   $("#signin-head").css("border-bottom","none");
   $("#signup-head").css("border-bottom","5px solid #284E78");

}

function signin()
{
   $("#exampleModalCenter1").modal("show");
   $("#signup-container").css("display","none");
   $("#signin-container").show();
   $("#signin-head").css("border-bottom","5px solid #5D8233");
   $("#signup-head").css("border-bottom","none");
}




function copy() {
  var copyText = document.getElementById("newLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied: " + copyText.value;
}

function outFunc() {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy to clipboard";
}

var open = 0;

function openNav() {
  if(open % 2 == 0)
  {
    document.getElementById("mySidebar").style.width = "350px";
    document.getElementById("main").style.width = "calc(100% - 350px)"
    document.getElementById("mySidebar").style.padding = "10px";
  }
  else
  {
    closeNav();
  }
  open++;
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("mySidebar").style.padding = "0";
  document.getElementById("main").style.width = "100%";
}

const form = document.getElementById("send-message");
const messageInput = document.getElementById("message");
const container = document.getElementById("message-container");



 document.getElementById("send-message").addEventListener("submit", function(event){
    event.preventDefault();
    const message = messageInput.value;
    messageInput.value = '';
    const new_div = document.createElement('div');
    new_div.className = 'chat';
    new_div.innerText = message;
    container.append(new_div);

    socket.emit("send",roomID,message);

});


socket.on('receive', (message) => {
    const new_div = document.createElement('div');
    new_div.className = 'chat';
    new_div.innerText = message;
    container.append(new_div);
});


function signupData()
{
    const user = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
}



function invokeSignup()
{
   $("#signin-container").css("display","none");
   $("#signup-container").show();
  $("#signin-head").css("border-bottom","none");
   $("#signup-head").css("border-bottom","5px solid #284E78");
}


function invokeSignin()
{
   $("#signup-container").css("display","none");
   $("#signin-container").show();
   $("#signin-head").css("border-bottom","5px solid #5D8233");
  $("#signup-head").css("border-bottom","none");
}
