async function getTodo() {
  const response = await fetch(
    "https://nu.instructure.com/api/v1/users/self/todo"
  );
  const data = await response.json();
  return cleansingDatada(data);
}

function utc2jst(time) {
  const utcDate = new Date(time);

  // JSTに変換
  const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒で計算
  const jstDate = new Date(utcDate.getTime() + jstOffset);

  return jstDate.toISOString().replace("Z", "+09:00");
}

function isTimePassed(todoTime) {
  const nowDate = new Date();
  const todoTimeDate = new Date(todoTime);
  return nowDate < todoTimeDate;
}

function cleansingDatada(data) {
  return data
    .filter((d) => isTimePassed(d.assignment.due_at))
    .map((d) => {
      const obj = {
        assignment_id: d.assignment.id,
        summary: d.assignment.name,
        description: `${d.context_name}\n${d.assignment.html_url}`,
        start: {
          dateTime: utc2jst(d.assignment.due_at),
          timeZone: "Asia/Tokyo",
        },
        end: {
          dateTime: utc2jst(d.assignment.due_at),
          timeZone: "Asia/Tokyo",
        },
        recurrence: [],
        attendees: [],
        reminders: {
          useDefault: true,
        },
      };
      return obj;
    });
}

function getCanvasLmsTodoId(url) {
  const regex =
    /https:\/\/nu\.instructure\.com\/courses\/[^\/]+\/assignments\/([^\/]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function getUserEvents() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "getUserEvents" },
      function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.data);
        }
      }
    );
  });
}

function insertTodo(event) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "insertTodo", data: event }
      // function (response) {
      // if (chrome.runtime.lastError) {
      //   reject(chrome.runtime.lastError);
      // } else {
      //   resolve(response.data);
      // }
      // }
    );
  });
}

async function getRegisteredCanvasLmsEvents() {
  const userEvents = await getUserEvents();
  return userEvents
    .map((e) => {
      if (e.description) {
        return getCanvasLmsTodoId(e.description);
      }
      return null;
    })
    .filter((id) => id);
}

// ボタンの作成
const button = document.createElement("button");
button.innerText = "登録";
button.id = "register-button";

// ボタンにクリックイベントを追加
button.addEventListener("click", () => {
  (async () => {
    const registeredEventIds = await getRegisteredCanvasLmsEvents();
    const todo = await getTodo();
    const filteredTodo =
      registeredEventIds.length === 0
        ? todo
        : todo.filter(
            (e) => !registeredEventIds.includes(String(e.assignment_id))
          );
    console.log("filteredTodo", filteredTodo);
    if (filteredTodo.length === 0) {
      console.log("nothing todo");
      return;
    }
    filteredTodo.map((todo) => {
      insertTodo(todo);
    });
  })();
});

let target = document.querySelector("#content"); // 追加したい要素を見つけてくる
target.appendChild(button); // 追加する
