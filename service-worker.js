const USER_EVENTS =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const CANVAS_LMS = "https://nu.instructure.com";

function createUserEventsURL() {
  const now = new Date();
  const now_string = now.toISOString();
  const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
  return `${USER_EVENTS}?maxResults=100&orderBy=startTime&q=${CANVAS_LMS}&singleEvents=true&timeMin=${now_string}&timeMax=${nextMonth.toISOString()}&`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getUserEvents") {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error("Failed to get auth token:", chrome.runtime.lastError);
        return;
      }
      fetch(createUserEventsURL(), {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          sendResponse({ data: data.items });
        })
        .catch((error) => console.error("Error:", error));
    });
  }
  if (message.action === "insertTodo") {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error("Failed to get auth token:", chrome.runtime.lastError);
        return;
      }
      fetch(USER_EVENTS, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          ContentType: "application/json",
        },
        body: JSON.stringify(message.data),
        mode: "cors",
      })
        .then((response) => {
          if (response.status === 200) {
            return "success";
          } else {
            new Error("failed insert event", response);
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }
  return true;
});
