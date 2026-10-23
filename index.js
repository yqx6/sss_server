#!/usr/bin/env node

const fs = require("fs");
const http = require("http");

const {
  addUser,
  getUserByName,
  initLowDb,
  getAllUsers,
} = require("./db/user.js");
const {
  addGroup,
  getGroupByName,
  initLowDb2,
  getAllGroups,
  updateGroupById,
} = require("./db/group.js");

const { getAllVideos } = require("./utils/getAllVideos.js");
const { getAllSeasons } = require("./utils/getAllSeasons.js");
const { getPostData } = require("./utils/getPostData.js");
const { getFileType } = require("./utils/getFileType.js");
// 初始化 lowdb}

initLowDb();
initLowDb2();

// http://localhost:8001/getAll?p=/Users/y/Downloads/sss
// http://localhost:8001/getOne?p=/Users/y/Downloads/sss/a.mp4
const thePort = process.argv[2] || 8001;

http
  .createServer(async (req, res) => {
    // 放开所有 CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/addGroup") {
      console.log("jjj");
      getPostData(req, res, async (group) => {
        console.log(group, "3333");
        try {
          const rst = await addGroup(group);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: "Success", rst }));
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: err.message }));
        }
      });
      return;
    }

    if (url.pathname === "/updateGroupById") {
      console.log("updateGroupById", "jjjj");
      getPostData(req, res, async (group) => {
        console.log(group, "3333");
        try {
          const rst = await updateGroupById(group.id, group);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: "Success", rst }));
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: err.message }));
        }
      });
      return;
    }

    if (url.pathname === "/getAllGroups") {
      const allGroups = await getAllGroups();
      console.log("allGroups, function", allGroups);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ rst: allGroups, msg: "success" }));
      return;
    }

    if (url.pathname === "/getAllSeasons") {
      const seasonsRst = getAllSeasons(url);

      console.log("allSeasons", seasonsRst);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(seasonsRst));
      return;
    }

    if (url.pathname === "/addUser") {
      getPostData(req, res, async (user) => {
        try {
          const rst = await addUser(user);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: "Success", rst }));
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ msg: err.message }));
        }
      });
      return;
    }

    if (url.pathname === "/getAllUsers") {
      const allUsers = await getAllUsers();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ rst: allUsers, msg: "success" }));
      return;
    }

    if (url.pathname === "/getUserByName") {
      const name = url.searchParams.get("name");
      const user = await getUserByName(name);
      if (user == null) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ msg: "user not exists", exists: false }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ...user, exists: true }));
      }
      return;
    }

    // 增加一个getPart路由，根据page和pageSize返回分页数据
    if (url.pathname === "/getPart") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const videoRst = getAllVideos(url);
      const allVideos = videoRst.rst;
      let isEnd = false;
      if (end >= allVideos.length) {
        isEnd = true;
      }

      const partVideos = allVideos.slice(start, end);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ rst: partVideos, isEnd, msg: videoRst.msg }));
      return;
    }

    // ✅ 新增 /getAll 路由
    if (url.pathname === "/getAll") {
      const videoRst = getAllVideos(url);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(videoRst));
      return;
    }

    // 获取图片
    if (url.pathname === "/getOneImg") {
      const imgPath = url.searchParams.get("p") || "img/default.jpg";
      res.setHeader("Content-Type", "image/jpg");
      const imgStream = fs.createReadStream(imgPath);
      imgStream.pipe(res);
      imgStream.on("error", (err) => {
        console.error("图片读取错误:", err);
        res.statusCode = 500;
        res.end("Error loading image");
      });
      return;
    }

    // 支持 HTTP Range 请求，实现视频分段加载（边下边播）
    if (url.pathname === "/getOneRange") {
      const videoPath = url.searchParams.get("p") || "a.mp4";

      fs.stat(videoPath, (err, stats) => {
        if (err) {
          res.statusCode = 404;
          res.end("Not Found");
          return;
        }

        const total = stats.size;
        const range = req.headers.range;

        // 记录Range请求信息
        console.log(`[视频请求] 文件: ${videoPath}`);
        console.log(`[视频请求] Range: ${range}`);
        console.log(`[视频请求] 总大小: ${total} bytes`);

        if (!range) {
          // 无 Range 头，返回文件信息但不传输内容
          console.log("[视频请求] 无Range头，返回文件信息");
          res.setHeader("Content-Type", `video/${getFileType(videoPath)}`);
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Content-Length", total);
          res.end();
          return;
        }

        // 解析 Range 头，如 "bytes=0-1023"
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : total - 1;

        // 限制每个分片的大小（例如：5MB）
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
        if (end - start >= CHUNK_SIZE) {
          end = start + CHUNK_SIZE - 1;
        }

        // 验证范围的有效性
        if (start >= total || end >= total || start > end) {
          res.statusCode = 416; // Range Not Satisfiable
          res.setHeader("Content-Range", `bytes */${total}`);
          res.end();
          return;
        }

        const chunkSize = end - start + 1;

        // 记录分片信息
        console.log(`[视频请求] 分片范围: ${start}-${end}`);
        console.log(`[视频请求] 分片大小: ${chunkSize} bytes`);

        // 设置响应头
        res.statusCode = 206; // Partial Content
        res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", chunkSize);
        res.setHeader("Content-Type", `video/${getFileType(videoPath)}`);
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 支持客户端缓存

        // 创建文件流并处理错误
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.on("error", (err) => {
          console.error("Range 视频流错误:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Error streaming video");
          } else {
            res.end();
          }
        });

        // 处理客户端断开连接
        req.on("close", () => {
          stream.destroy();
        });

        stream.pipe(res);
      });
      return;
    }
    if (url.pathname === "/getOne") {
      // ✅ 原有视频流逻辑
      res.setHeader("Content-Type", `video/${getFileType(videoPath)}`);
      console.log(req.url);
      const videoPath = url.searchParams.get("p") || "a.mp4";
      const videoStream = fs.createReadStream(videoPath);
      videoStream.pipe(res);
      videoStream.on("error", (err) => {
        console.error("Error:", err);
        res.statusCode = 500;
        res.end("Error streaming video");
      });
    }
  })
  .listen(thePort, () => {
    console.log("Server running at http://localhost:" + thePort);
  });
