let reloadInterval;
let isReloadEnabled = true

function startReloadInterval() {
  reloadInterval = setInterval(function () {
      location.reload()
  }, 60000)
}

function stopReloadInterval() {
  clearInterval(reloadInterval)
}

function toggleReload() {
  const reloadButton = document.getElementById("reload-button");

  if (isReloadEnabled) {
    stopReloadInterval();
    console.log('Auto Reload disabled');
    reloadButton.innerHTML = "Auto Reload <b>OFF</b>";
    reloadButton.style.backgroundColor = "#9d2933"; 
  } else {
    startReloadInterval();
    console.log('Auto Reload enabled');
    reloadButton.innerHTML = "Auto Reload <b>ON</b>";
    reloadButton.style.backgroundColor = "#26C281"; 
  }

  isReloadEnabled = !isReloadEnabled;
}

startReloadInterval()

function scrollToBottom() {
  const chats = document.getElementsByClassName("chat-scrollable")
  
  for (let i = 0; i < chats.length; i++) {
    let children = chats[i].children
    if (children.length < 1) {
      console.log("No children found");
      continue;
    }
    window.scrollTo({
      top: children[children.length - 1],
      behavior: "smooth"
    });
  }
}

window.onload = scrollToBottom()
