chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "buttonClicked") {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error("Failed to get auth token:", chrome.runtime.lastError);
        return;
      }
      fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data, data.items);
          sendResponse({ data: data.items });
        })
        .catch((error) => console.error("Error:", error));
    });
  }
  return true;
});
