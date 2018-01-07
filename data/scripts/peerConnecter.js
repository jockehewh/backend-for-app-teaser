let db = window.db = new Dexie('localmem')
db.version(1).stores({
    friends: 'name'
});
db.open().catch(function(err){console.log(err)})
console.log(db.friends)
let selfId = db.friends.toCollection();
selfId.first((item)=>{
    if(!item){
        return dbFirstItem = ""
    }else{
        return dbFirstItem = item.name
    }
    })
    .then((dbFirstItem)=>{
        if(dbFirstItem === ""){
            name = prompt("please enter your user name", "")
            db.friends.add({name})
            return name
        }else{
            return name = dbFirstItem;
        }
    })
    .then((name)=>{
        return name;
    })
    .catch((err)=>{
        console.log(err)
    })

function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
}

let peerconf = {
    debug: 3,
    config: {"iceServers":
    [
        {url: `stun:${name}@js.perspective3d.online:3478?transport=udp`, credential: name}]},
    host: "js.perspective3d.online",
    port:3478
}

setTimeout(function(){
    let peer = window.peer = new Peer(name, peerconf);
    peer.on('open', function(){
        $('.status').css("background-color", "green");
    })
},700)

