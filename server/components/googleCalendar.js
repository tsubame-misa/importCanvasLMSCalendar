const CANVAS_LMS = "https://nu.instructure.com";
const USER_EVENTS =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function createUserEventsURL() {
  const now = new Date();
  const now_string = now.toISOString();
  const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
  // TODO:prams URLで分ける
  return `${USER_EVENTS}?maxResults=100&orderBy=startTime&q=${CANVAS_LMS}&singleEvents=true&timeMin=${now_string}&timeMax=${nextMonth.toISOString()}&`;
}

export function getUserEvents() {
  return new Promise((resolve, reject) => {
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
          resolve({ data: data.items });
        })
        .catch((error) => {
          console.error("Error:", error);
          reject(error);
        });
    });
  });
}

export function insertTodo(data) {
  return new Promise((resolve, reject) => {
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
        body: JSON.stringify(data),
        mode: "cors",
      })
        .then((response) => {
          if (response.status === 200) {
            return resolve("success");
          } else {
            new Error("failed insert event", response);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          reject(error);
        });
    });
  });
}
