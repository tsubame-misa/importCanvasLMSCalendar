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
