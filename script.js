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
  var sChat = document.getElementsByClassName("chat-scrollable-stegi")
  sChat[0].lastElementChild.scrollIntoView()
  var dChat = document.getElementsByClassName('chat-scrollable-di1araas')
  dChat[0].lastElementChild.scrollIntoView()
}

window.onload = scrollToBottom