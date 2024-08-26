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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getUserEvents") {
    getUserEvents(sendResponse);
  }
  if (message.action === "insertTodo") {
    insertTodo(message.data);

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
