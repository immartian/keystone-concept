(function () {

  var messages = document.getElementById('messages')
  var gendata = document.getElementById('gendata')
  var hashes = document.getElementById('hashes')
  var fetchKS = document.getElementById('fetch-ks')
  var data

  function freezeFetch(){
    fetchKS.setAttribute('data-ks','freeze')
    fetchKS.textContent = '...'
  }

  fetchKS.addEventListener('click',function(ev){
    fetchKS.getAttribute('data-ks') == 'removed'?(ws.send('abort'),freezeFetch()):fetchKS.getAttribute('data-ks') != 'none' && fetchKS.getAttribute('data-ks') != 'freeze' && (ws.send('decode'),freezeFetch())
  });

  function WebSockets() {
    var ws = new WebSocket("ws://localhost:19999/data");

    ws.onopen = function () {
      ws.send("Initialized");
    };

    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      switch (received_msg) {
        case 'keystone added':
          fetchKS.setAttribute('data-ks', 'added')
          fetchKS.textContent = 'New keystone file detected, decode?'
          break;
        case 'keystone removed':
          fetchKS.setAttribute('data-ks', 'removed')
          fetchKS.textContent = 'The keystone file removed, abort?'
          break;
        case 'keystone changed':
          fetchKS.setAttribute('data-ks', 'changed')
          fetchKS.textContent = 'The keystone file changed, reload and decode?'
          break;
        default:
          try {
            data = JSON.parse(received_msg)
            if (data.chunkKey) {
              messages.classList.add('active')
              gendata.querySelector('h3').textContent = 'original filename: '+data.origFileName
              gendata.querySelector('h4').textContent = 'chunks encryption key: '+data.chunkKey
              var hashul = hashes.querySelector('ul')
              hashul.html = ''
              for (var i = 0; i < data.hashes.length; i++) {
                var liel = document.createElement('li')
                liel.textContent = data.hashes[i]
                hashul.appendChild(liel)
              }
              console.log(data)

            }
          }
          catch (err) {
            console.log('Invalid data')
          }
      }
      console.log(received_msg, fetchKS);
    };

    ws.onclose = function () {
      console.log("Log connection closed...");
    };
    return ws;
  }
  var ws = WebSockets();


})();
