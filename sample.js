// ボタンの作成
const button = document.createElement("button");
button.innerText = "登録";
button.id = "register-button";

// ボタンにクリックイベントを追加
button.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "registerTodo" }, function (response) {
    if (response.message >= 0) {
      console.log(response.message + "件のtodoが登録されました");
    } else {
      console.log("エラーが発生しました。");
    }
  });
});

let target = document.querySelector("#content"); // 追加したい要素を見つけてくる
target.appendChild(button); // 追加する

//////////

const dayCheckButton = document.createElement("button");
dayCheckButton.innerText = "定期実行を行う";
dayCheckButton.id = "day-check-button";
target.appendChild(dayCheckButton); // 追加する

const cancelCheckButton = document.createElement("button");
cancelCheckButton.innerText = "定期実行をキャンセルする";
cancelCheckButton.id = "cancel-check-button";
target.appendChild(cancelCheckButton); // 追加する

const countDisplay = document.createElement("div");
countDisplay.id = "countDisplay";
target.appendChild(countDisplay); // 追加する

document.getElementById("day-check-button").addEventListener("click", () => {
  console.log("start clicked");
  chrome.runtime.sendMessage({ action: "startAlarm" }, (response) => {
    console.log(response.message);
  });
});

document.getElementById("cancel-check-button").addEventListener("click", () => {
  console.log("stop clicked");
  chrome.runtime.sendMessage({ action: "stopAlarm" }, (response) => {
    console.log(response.message);
  });
});

function getStatusMessage(updateCnt) {
  return updateCnt >= 0
    ? updateCnt + "件のtodoが新たに登録されました。"
    : "更新失敗。開発者に確認してください。";
}

// ストレージからカウントを取得して表示
chrome.storage.local.get(["time", "cnt", "autoUpdate"], (data) => {
  console.log(data);
  document.getElementById("countDisplay").textContent =
    "最終更新: " +
    (data.time || "-----") +
    " " +
    getStatusMessage(data.cnt) +
    "autoUpdate:" +
    data.autoUpdate;
});

// カウントが更新されるたびに表示を更新する
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.time) {
    console.log(changes);
    document.getElementById("countDisplay").textContent =
      "最終更新: " +
      changes.time.newValue +
      " " +
      getStatusMessage(changes.cnt.newValue) +
      "autoUpdate:" +
      changes.autoUpdate.newValue;
  }
});
