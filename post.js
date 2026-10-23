const { getApi } = require("./getApi");

fetch(`${getApi()}/updateGroupById`, {
  method: "POST",
  body: JSON.stringify({
    id: 1,
    name: "group1",
    filePath: "C:\\Users\\ysy\\sss\\cartoon",
  }),
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((json) => console.log(json));
