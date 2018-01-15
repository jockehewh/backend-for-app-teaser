var HOME_CACHE = "app-teaser-cache";
var filesToCache =[
    '/',
    '/backend.css',
    '/fullbuild.js',
    '/scripts/peer.min.js',
    '/scripts/peerConnecter.js',
    '/scripts/zepto.min.js',
    '/scripts/dexie.js'
];
self.addEventListener('install', function(e){
    e.waitUntil(
        caches.open(HOME_CACHE)
        .then(function(cache){
            console.log('Cache ouvert');
            return cache.addAll(filesToCache);
        })
    );
});
self.addEventListener('fetch', function(e){
    e.respondWith(
        caches.match(e.request).then(function(response){
            if (response){
                return response;
            }
            var fetchRequest = e.request.clone();
            return fetch(fetchRequest).then(function(response){
                if(!response || response.status !== 200 || response.type !== 'basic'){
                    return response;
                }
                var responseToCache = response.clone();
                caches.open(HOME_CACHE).then(function(cache){
                    cache.put(e.request, responseToCache);
                });
                return response;
            });
        })
    )
})