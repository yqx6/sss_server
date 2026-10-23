const fs = require("fs");
const path = require("path");
const { getFileType } = require("./getFileType");
const { getApi } = require("./getApi");

const getAllVideos = (url) => {
  const dir = url.searchParams.get("p") || "."; // 默认当前目录

  // 判断dir是否存在
  if (!fs.existsSync(dir)) {
    return { rst: [], msg: dir + "目录不存在" };
  }

  try {
    const rst = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".mp4") || file.endsWith(".mkv"))
      .map((file) => {
        const title = file.split("_")[0];
        const serial = title.split(" ")[0];
        return {
          path:
            `${getApi()}/getOne?p=` + encodeURIComponent(path.join(dir, file)),
          title: title.replace(" ", ". "),
          serial: serial,
          imgPath:
            `${getApi()}/getOneImg?p=` +
            encodeURIComponent(path.join(dir, "img", `${serial}.jpg`)),
        };
      })
      .sort((a, b) => b.serial.localeCompare(a.serial));

    // 处理空结果的情况
    if (rst.length === 0) {
      return {
        rst: [],
        fileType: "video/mp4", // 或者 null / undefined
        msg: "目录中没有找到视频文件",
      };
    }

    return {
      rst: rst,
      fileType: `video/${getFileType(rst[0].path)}`,
      msg: "success",
    };
  } catch (e) {
    console.log(e);
    return {
      rst: [],
      msg: "读取目录失败：" + e.message,
    };
  }
};
module.exports = {
  getAllVideos,
};
