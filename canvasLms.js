function utc2jst(time) {
  // UTC日時を指定
  const utcDate = new Date(time);

  // JSTに変換
  const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒で計算
  const jstDate = new Date(utcDate.getTime() + jstOffset);

  // JST形式で日時を表示
  return jstDate.toISOString().replace("Z", "+09:00");
}

function cleansingDatada(data) {
  return data.map((d) => {
    // 日付の初期化
    const date = new Date(d.assignment.due_at);

    // 出力
    console.log(d.assignment.due_at, utc2jst(d.assignment.due_at));

    const obj = {
      id: d.assignment.id,
      name: d.assignment.name,
      course_name: d.context_name,
      course_id: d.course_id,
      due_at: utc2jst(d.assignment.due_at),
      html_url: d.assignment.html_url,
    };
    return obj;
  });
}

async function getTodo() {
  const response = await fetch(
    "https://nu.instructure.com/api/v1/users/self/todo",
    {
      headers: {
        // eslint-disable-next-line no-undef
        authorization: `Bearer ${process.env.CANVAS_LMS_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data;
}

getTodo().then(function (value) {
  console.log("value", cleansingDatada(value));
});
