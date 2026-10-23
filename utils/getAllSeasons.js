const fs = require("fs");
const path = require("path");
const { getApi } = require("./getApi");

const getAllSeasons = (url) => {
  const dir = url.searchParams.get("p") || ".";
  if (!fs.existsSync(dir)) {
    return { rst: [], msg: dir + "目录不存在" };
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const seasons = entries
      .filter((entry) => {
        if (!entry.isDirectory()) return false;
        const name = entry.name.toLowerCase();
        return name.startsWith("season");
      })
      .map((entry) => {
        const name = entry.name;
        const seasonNum = name.replace(/season\s*/i, "").trim();
        return {
          partPath: path.join(dir, entry.name),
          path:
            `${getApi()}/getAll?p=` +
            encodeURIComponent(path.join(dir, entry.name)),
          name: name,
          season: seasonNum || "1",
        };
      })
      .sort((a, b) => {
        const numA = parseInt(a.season) || 0;
        const numB = parseInt(b.season) || 0;
        return numA - numB;
      });

    return { rst: seasons, msg: "success" };
  } catch (e) {
    console.log(e);
    return { rst: [], msg: e.message };
  }
};

module.exports = {
  getAllSeasons,
};
