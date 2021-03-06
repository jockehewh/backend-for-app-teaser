
$(document).ready(function(){
    let fileBtn = $('#sendFiles');
    let dataConnect = $('#data_connect');
    let disconnect = $('.disconnect');
    let vStarter = $('#vStarter');
    let gStarter = $('#gStarter');
    peer = window.peer;
//////////////////****************ESTABLISH LOCAL DATABASE****************////////////////////
    db = window.db;
    collection = window.collection = db.friends.toCollection();

    collection.each(function(user){
        var option = document.createElement('option');
        option.setAttribute('value', user.name);
        option.innerText = user.name;
        $('select').append(option);
    }).catch(function(err){
        console.log(err)
    });
    
//////////////////****************ESTABLISH CONNECTION****************////////////////////
    dataConnect.click(function(){
        $('.is_main nav').show();
        $('.disconnect').show();
        var distantId = $('#distant_id').val();
        var conn = peer.connect(distantId);
        window.caller = conn;
        db.friends.add({name: distantId});
        //AJOUTER DATAS
        conn.on('open', function(){
            $('.peer_selector').hide();
            $('.files_element').show();
            $('#vStarter').show();
            $('#send').click(function(){
                let message = $('#text').val();
                conn.send(message);
                var li = document.createElement('li');
                li.classList.add('you');
                li.innerHTML = `<p>you: ${message}</p>`
                $('#messages').append(li);
                $('#text').val('');
            })
            $('#fileSend').click(function(){
                fileBtn.click();
            })
            fileBtn.change(function(){
                console.log(this.files[0])
                //$('.files_element').append(`<p>${this.files[0].name}, size: ${this.files[0].size/1000} Ko</p>`)
                conn.send(this.files[0])
            })
        })
        vStarter.click(function(){
            var fullhd = {width:720, height:1280}
            var sdHigh = {width:360, height:480}
            var sd = {width:144, height:176}
            $('.video_module').show();
            $('.stop_video').show();
            $('.stop_video').click(function(){
                if(window.localStream){
                    URL.revokeObjectURL(window.localStream)
                    delete(window.localStream);
                    $('.my_video').remove();
                    conn.send('close video')
                }
                if(window.streamUrl){
                    URL.revokeObjectURL(window.streamUrl)
                    delete(window.streamUrl);
                    $('.their_video').remove();
                }
                $('.stop_video').hide();
                $('#vStarter').show();
            })
            vStarter.hide();
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            console.log(peer.peer)
                conn.send('ping');
                window.ping = Date.now();
                conn.on('data', function(data){
                    if(typeof data === 'string' && data === 'pong'){
                        window.pong = Date.now()
                        window.delta = (window.pong - window.ping)/1000;
                        if ( 0.751 < window.delta ) {
                            pseudoNetworkConditionSizedVideo(sd)
                        }else if ( 0.351 < window.delta < 0.750 ) {
                            pseudoNetworkConditionSizedVideo(sdHigh)
                        }else if ( 0 < window.delta < 0.350 ) {
                            pseudoNetworkConditionSizedVideo(fullhd)
                        }
                    }
                    if(typeof data === 'string' && data === 'close video'){
                        if(window.localStream){
                            URL.revokeObjectURL(window.localStream)
                            delete(window.localStream);
                            $('.my_video').remove();
                            conn.send('close video')
                        }
                        if(window.streamUrl){
                            URL.revokeObjectURL(window.streamUrl)
                            delete(window.streamUrl);
                            $('.their_video').remove();
                        }
                        $('.stop_video').hide();
                        $('#vStarter').show();
                    }
                })
            })
        gStarter.click(function(){
            conn.send('game?');
            conn.on('data', function(data){
                if(data === 'yes‼'){
                    $('.mg_module').show();
                    $('.game_box').show();
                    conn.send('yes‼');
                }
                if(data === 'end‼'){
                    $('.game_box').hide();
                    setTimeout(function(){
                        $('.mg_module').hide();
                        meCount = theyCount = 0;
                        yourScore.innerText = 0;
                        theirScore.innerText = 0;
                    },2000)
                    if(!getWinner(meCount, theyCount)){
                        yourScore.innerText = 'You win‼'
                    }else{
                        yourScore.innerText = 'You Loose‼'
                    }
                }
                if(typeof data === 'number'){
                    if(data === 0){
                        conn.send(0);
                        gamebtn.addEventListener('click', function(){
                            meCount++;
                            yourScore.innerText = meCount;
                            conn.send(meCount);
                            if(meCount === 22){
                                conn.send('end‼')
                                $('.game_box').hide();
                                setTimeout(function(){
                                    $('.mg_module').hide();
                                    meCount = theyCount = 0;
                                    yourScore.innerText = 0;
                                    theirScore.innerText = 0;
                                },2000)
                                if(!getWinner(meCount, theyCount)){
                                    yourScore.innerText = 'You win‼'
                                }else{
                                    yourScore.innerText = 'You Loose‼'
                                }
                            }
                        })
                    }
                    if(data <= 22){
                        theyCount = data;
                        theirScore.innerText = data;
                    }
                }
                
            })
        })
    })
    disconnect.click(function(){
        peer.disconnect();
        $('.peer_selector').show();
        $('.files_element').hide();
        $('.video_module').hide();
        window.URL.revokeObjectURL(window.localStream);
        window.URL.revokeObjectURL(window.streamUrl);
        disconnect.hide();
        $('.is_main nav').hide();
    });

//SERVICE WORKER
if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
        navigator.serviceWorker.register('/app-teaser-sw.js').then((registration)=>{
            console.log('Service Worker ok');
        }, function(err){
            console.log(err)
        })
    })
}

//SERVICE WORKER
})//DOM READY
    var gamebtn = document.querySelector('.game_btn');
    var yourScore = document.querySelector('#yoScore');
    var theirScore = document.querySelector('#tyScore');
    var meCount = 0;
    var theyCount = 0;

function getWinner(localScore, distantScore){
    return localScore < distantScore;
}

function pseudoNetworkConditionSizedVideo(quality){
    navigator.getUserMedia({audio: true, video: quality}, function(stream){
        var distantId = $('#distant_id').val();
        let video = document.createElement('video');
        video.src = URL.createObjectURL(stream);
        video.classList.add('my_video');
        window.localStream = stream;
        let videoCall = peer.call(distantId, window.localStream);
        $('.video').append(video)
    }, function(err){
        console.log(err)
        })
}
setTimeout(function(){
    peer.on('connection', function(conn){
        let distantPeer = conn.peer;
        window.called = conn;
        let imgControler = new RegExp (/(\.jpeg|\.jpg|\.png|\.gif|\.bmp)/)
        conn.on('data', function(data){
            if (data.constructor === ArrayBuffer){
                var bloeb = new Blob([data]);
                var dataUrl = URL.createObjectURL(bloeb)
                let img = document.createElement('img');
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.download = dataUrl;
                img.src = dataUrl;
                a.appendChild(img)
                li.appendChild(a);
                $('#messages').append(li)
            }
            if(typeof data === 'number'){
                if(data === 0){
                    gamebtn.addEventListener('click',function(){
                        meCount++;
                        yourScore.innerText = meCount;
                        conn.send(meCount);
                        if(meCount === 22){
                            conn.send('end‼')
                            $('.game_box').hide();
                            setTimeout(function(){
                                $('.mg_module').hide();
                                meCount = theyCount = 0;
                                yourScore.innerText = 0;
                                theirScore.innerText = 0;
                            },2000)
                            if(!getWinner(meCount, theyCount)){
                                yourScore.innerText = 'You win‼'
                            }else{
                                yourScore.innerText = 'You Loose‼'
                            }
                        }
                    })
                }
                if(data<=22){
                    theyCount = data;
                    theirScore.innerText = data;
                }
            }
            if(typeof data === 'string'){
                if(data === 'game?'){
                    if(confirm('Should we play a game?')){
                        conn.send('yes‼');
                        $('.mg_module').show();
                        $('.game_box').show();
                    }
                }
                if(data === 'end‼'){
                    $('.game_box').hide();
                    setTimeout(function(){
                        $('.mg_module').hide();
                        meCount = theyCount = 0;
                        yourScore.innerText = 0;
                        theirScore.innerText = 0;
                    },2000)
                    if(!getWinner(meCount, theyCount)){
                        yourScore.innerText = 'You win‼'
                    }else{
                        yourScore.innerText = 'You Loose‼'
                    }
                }
                if(data === 'yes‼'){
                    conn.send(0);
                }
                if(data === 'ping'){
                    conn.send('pong');
                }
                if(data === 'close video'){
                    if(window.localStream){
                        URL.revokeObjectURL(window.localStream)
                        delete(window.localStream);
                        $('.my_video').remove();
                        conn.send('close video')
                    }
                    if(window.streamUrl){
                        URL.revokeObjectURL(window.streamUrl)
                        delete(window.streamUrl);
                        $('.their_video').remove();
                    }
                    $('.stop_video').hide();
                    $('#vStarter').show();
                }
                if(imgControler.test(data)){
                    window.fileName = data;
                }else{
                    var li = document.createElement('li');
                    li.classList.add('theirs');
                    li.innerHTML = `<p>they: ${data}</p>`
                    $('#messages').append(li);
                }
            }
        })
    });
    peer.on('call', function(conn){
        if(confirm('accept incomming call?')){
            $('.stop_video').show();
            conn.answer(window.localStream);
            conn.on('stream', function(stream){
                let video = document.createElement('video');
                window.streamUrl = URL.createObjectURL(stream);
                video.src = window.streamUrl;
                video.classList.add('their_video')
                $('.video').append(video);
                })
        }
        $('.stop_video').click(function(){
            if(window.localStream){
                URL.revokeObjectURL(window.localStream)
                delete(window.localStream);
                $('.my_video').remove();
                conn.send('close video')
            }
            if(window.streamUrl){
                URL.revokeObjectURL(window.streamUrl)
                delete(window.streamUrl);
                $('.their_video').remove();
            }
            $('.stop_video').hide();
            $('#vStarter').show();
        })
        conn.on('data', function(data){
            if(typeof data === 'string' && data === 'close video'){
                if(window.localStream){
                    URL.revokeObjectURL(window.localStream)
                    delete(window.localStream);
                    $('.my_video').remove();
                    conn.send('close video')
                }
                if(window.streamUrl){
                    URL.revokeObjectURL(window.streamUrl)
                    delete(window.streamUrl);
                    $('.their_video').remove();
                    conn.send('close video')
                }
                $('.stop_video').hide();
                $('#vStarter').show();
            }
        })
    })
    },1200);