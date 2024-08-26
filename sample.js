// 参照する既存の要素
const referenceElement = document.getElementById("calendar_header");
// 親要素
const parentElement = referenceElement.parentNode;

// 参照要素の次の兄弟要素を取得
const nextSibling = referenceElement.nextElementSibling;

// ボタンの作成
const button = document.createElement("button");
button.innerText = "カレンダーをインポートする";
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

// let target = document.querySelector("#content"); // 追加したい要素を見つけてくる
// target.appendChild(button); // 追加する

//////////

const dailyButton = document.createElement("button");
dailyButton.id = "day-check-button";
dailyButton.innerText = "定期実行モードを実行する";
dailyButton.value = false;
// target.appendChild(dailyButton);

const countDisplay = document.createElement("div");
countDisplay.id = "countDisplay";
countDisplay.hidden = true;
// target.appendChild(countDisplay); // 追加する

if (nextSibling) {
  parentElement.insertBefore(button, nextSibling);
  parentElement.insertBefore(dailyButton, nextSibling);
  parentElement.insertBefore(countDisplay, nextSibling);
} else {
  parentElement.appendChild(button);
  parentElement.insertBefore(dailyButton);
  parentElement.insertBefore(countDisplay);
}

document.getElementById("day-check-button").addEventListener("click", () => {
  const dayCheckButtonElement = document.getElementById("day-check-button");
  const countDisplayElement = document.getElementById("countDisplay");
  if (dayCheckButtonElement.value === "false") {
    console.log("start clicked");
    chrome.runtime.sendMessage({ action: "startAlarm" }, (response) => {
      console.log(response.message);
    });
    dayCheckButtonElement.innerText = "定期実行モード実行をキャンセル";
    dayCheckButtonElement.value = true;
    countDisplayElement.hidden = false;
  } else if (dayCheckButtonElement.value === "true") {
    console.log("stop clicked");
    chrome.runtime.sendMessage({ action: "stopAlarm" }, (response) => {
      console.log(response.message);
    });
    dayCheckButtonElement.innerText = "定期実行モードを実行する";
    dayCheckButtonElement.value = false;
    countDisplayElement.hidden = true;
  }
});

function getStatusMessage(updateCnt) {
  if (updateCnt === undefined) {
    return "更新情報はありません";
  }
  return updateCnt >= 0
    ? updateCnt + "件のtodoが新たに登録されました。"
    : "更新失敗。開発者に確認してください。";
}

// ストレージからカウントを取得して表示
chrome.storage.local.get(["time", "cnt", "autoUpdate"], (data) => {
  document.getElementById("countDisplay").textContent =
    "最終更新: " + (data.time || "-----") + " " + getStatusMessage(data.cnt);
});

// カウントが更新されるたびに表示を更新する
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.time) {
    chrome.storage.local.get(["time", "cnt", "autoUpdate"], (data) => {
      console.log(data);
      document.getElementById("day-check-button").value = data.autoUpdate;
      document.getElementById("countDisplay").textContent =
        "最終更新: " +
        (data.time || "-----") +
        " " +
        getStatusMessage(data.cnt);
    });
  }
});
