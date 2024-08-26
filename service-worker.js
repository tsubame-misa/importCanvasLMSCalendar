import {
  getUserEvents,
  insertTodo,
} from "./server/components/googleCalendar.js";

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
  }
  return true;
});
