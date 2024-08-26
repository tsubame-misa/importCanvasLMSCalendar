// ボタンの作成
const button = document.createElement("button");
button.innerText = "登録";
button.id = "register-button";

// ボタンにクリックイベントを追加
button.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "registerTodo" });
});

let target = document.querySelector("#content"); // 追加したい要素を見つけてくる
target.appendChild(button); // 追加する





  });

  });

});

