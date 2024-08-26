import {
  getUserEvents,
  insertTodo,
} from "./server/components/googleCalendar.js";
import {
  getTodo,
  getRegisteredCanvasLmsEvents,
} from "./server/components/canvasLMS.js";

//////////////////

//拡張機能をインストールしたときに呼ばれる
chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.clearAll();
});

// ボタンが押された時にアラームを設定するリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startAlarm") {
    console.log("start alerm");
    setDailyAlarm();
    sendResponse({ message: "Alarm started" });
  } else if (request.action === "stopAlarm") {
    // アラームを停止する
    console.log("stop alerm");
    chrome.alarms.clear("dailyAlarm");
    sendResponse({ message: "Alarm stopped" });
  }
});

// 毎日24時（深夜0時）に実行するアラームを設定
function setDailyAlarm() {
  // 現在の日時を取得
  const now = new Date();

  // 次の24時を計算
  let nextMidnight = new Date(now);
  // nextMidnight.setHours(24, 0, 0, 0);

  // アラームを設定
  chrome.alarms.create("dailyAlarm", {
    when: nextMidnight.getTime(),
    // periodInMinutes: 24 * 60, // 24時間ごとに繰り返し
    periodInMinutes: 1, // 1分
  });
}

// アラームが発生した時にカウントを増やす
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyAlarm") {
    const now = new Date();
    console.log("time: ", now.toLocaleString());

    // カウントをストレージに保存する
    chrome.storage.local.set({ time: now.toLocaleString() });
  }
});

////////////////////////

async function registerTodo() {
  const userEvent = await getUserEvents();
  const registeredEventIds = await getRegisteredCanvasLmsEvents(userEvent.data);
  const todo = await getTodo();
  console.log("todo", todo);
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
    insertTodo(todo).catch((e) => {
      console.log(e);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "registerTodo") {
    registerTodo();
  }
  return true;
});
