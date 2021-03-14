// https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel


var ownPeerId = [];
var connectedObjects = {};
var master = null;

function initialize() {
    if(master != null) return master;
    var peer = new Peer('', {
        debug: 2
    })
    peer.on('open', function(id) {
        ownPeerId.push(id);
    })
    peer.on('error', function(err) {
        alert(''+err)
    })
    peer.on('connection', (c) => {
        c.on('data', function(data) {
            console.log("recieved from " + c.peer + " :" , data);
        })
    });
    console.log(peer);
    master = peer;
    return peer;
}

function updateClusterDetails(data) {
    let clusterInfo = JSON.parse(data.msg);
    console.log(ownPeerId)
    for(let i of clusterInfo) {
        if(!connectedObjects[i])
            connectedObjects[i] = null;
    }
    console.log("Updated cluster table");
}

function start() {
    var peer = initialize();

    peer.on('open', function(c) {
        console.log("My peer id: " ,  peer.id );
        alert('Ask your friend to join using your peer ID: '+ peer.id );
    })
   
    peer.on('connection', (c) => {
        c.on('data', function(data) {
            if(data.type == "clusterdetails") {
                updateClusterDetails(data);
            } else {
                console.log(data);
            }
        });
        connectedObjects[c.peer] = c;       
    })
    setTimeout(ping, 1000);
    setInterval(ping, 10000);
    return peer;
}



const joinPromise = (destId) => {
    return new Promise((resolve, reject) => {
        var peer = initialize();
        peer.on('connection', (c) => {
        });
        peer.on('open', function() {        
            console.log("My peer id: " + ownPeerId );
            var conn = peer.connect(destId, {
                reliable: true
            })
            conn.on('open', () => {
                resolve(conn);
            })

            conn.on('data', function(data) {
                if(data.type == "clusterdetails") {
                    updateClusterDetails(data)
                } else {
                    console.log(data);
                }
            });
            conn.on('error', (rej) => {
                reject(rej);
            })
        });
    })
}


function ping() {
    for( let c in connectedObjects) {
        if(connectedObjects[c] != null && c != ownPeerId) {
            connectedObjects[c].send({
                type: 'clusterdetails',
                msg : JSON.stringify(Object.keys(master.co))
            })
        } 
    }   
}


function broadcast(data) {

    // master.send(data);
    for( let c in connectedObjects) {
        if(c != ownPeerId) {
            if(connectedObjects[c] != null) {
                connectedObjects[c].send(data);
            } else {
                joinPromise(c).then((conn) => {
                    connectedObjects[c] = conn;
                    conn.send(data);
                }).catch(err => {
                    connectedObjects.delete(conn.peer);
                })
            }
        } 
    }   
}

function joinFirst() {
    var destId = prompt("Opponent's peer ID:")
    joinPromise(destId).then((conn) => {
        connectedObjects[destId] = conn;
        console.log("connected to: " + conn.peer);
    })
}



