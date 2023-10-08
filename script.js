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
    if (chats[i].lastElementChild) {
      window.scrollTo({
        top: chats[i].lastElementChild.offsetTop,
        behavior: "smooth"
      });
    } else {
      console.log("No chiled element found for " + chats[i])
    }
  }
}

window.onload = scrollToBottom()
