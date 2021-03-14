var lastPeerId = ""
var peer = new Peer(); 
var conn  = ""
$('#header').html("waiting for peer id")
lastPeerId = ""

function initialize(callback, conn) {
  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(null, {
    debug: 2
  });

  peer.on('open', function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
      console.log('Received null id from peer open');
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }

    /* console.log('ID: ' + peer.id) */;
    callback(peer.id);
  });
  peer.on('connection', function (c) {
    // Disallow incoming connections
    c.on('open', function() {
      c.send("Sender does not accept incoming connections");
      setTimeout(function() { c.close(); }, 500);
    });
  });
  peer.on('disconnected', function () {
    status.innerHTML = "Connection lost. Please reconnect";
    console.log('Connection lost. Please reconnect');

    // Workaround for peer.reconnect deleting previous id
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });
  peer.on('close', function() {
    conn = null;
    status.innerHTML = "Connection destroyed. Please refresh";
    console.log('Connection destroyed');
  });
  peer.on('error', function (err) {
    console.log(err);
    alert('' + err);
  });
};


function join() {
  initialize()
  peer.on('open', function() {
    var destId = prompt("Opponent's peer ID:")
    conn = peer.connect(destId, {
      reliable: true
    })
    conn.on('open', function() {
      opponent.peerId = destId
      $('#game .alert p').text("Waiting for opponent's move")
      $('#game').show().siblings('section').hide()
      turn = false
      begin()
    })
  })
}



initialize((id) => {
	console.log(lastPeerId)
  $('#header').html("Peer Id: "+ lastPeerId)
}, conn)
