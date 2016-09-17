(function () {
  var messages = document.getElementById('messages')

  function dragherehover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
  }

  function fileselect(e) {
    dragherehover(e);
		var ovr = document.getElementById('overlay')
		ovr.setAttribute('data-ovron','upload')
    var files = e.target.files || e.dataTransfer.files;
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
					ovr.setAttribute('data-ovron','done')
					ovr.textContent = files[0].name+' has been uploaded'
          var resp = document.createElement('p')
          resp.textContent = xhr.responseText
					if (document.getElementById("messages").children[0]) {
						resp.parentElement.children[0].remove()
					}
					document.getElementById("messages")
            .appendChild(resp)

        }
        console.log(xhr.readyState, xhr.status);
      };
      var formData = new FormData();
      formData.append("iFile", files[0]);
      xhr.open("POST", "http://localhost:9999/upload");
      xhr.send(formData);
    }
  }

  function start() {
    var fileselectel = document.getElementById("fileselect"),
      draghere = document.getElementById("draghere"),
			messages = document.getElementById('messages')
			ovr = document.getElementById('overlay')
    ovr.addEventListener("click", function(){
			ovr.setAttribute('data-ovron','false')
			messages.children[0] && messages.children[0].remove()
		}, false);
    fileselectel.addEventListener("change", fileselect, false);
    draghere.addEventListener("dragover", dragherehover, false);
    draghere.addEventListener("dragleave", dragherehover, false);
    draghere.addEventListener("drop", fileselect, false);
  }

  start();

})();
