const getPostData = async (req, res, callback) => {
    let body = '';

    // 监听data事件，接收请求体数据
    req.on('data', (chunk) => {
        // 拼接数据片段
        body += chunk.toString();
    });

    // 监听end事件，所有数据接收完成
    req.on('end', async () => {
        try {
            // 解析JSON格式的请求体
            const user = JSON.parse(body);
            callback(user)

        } catch (error) {
            // 处理JSON解析错误
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: false,
                message: 'not a json body or not post method',
                error: error.message
            }));
        }
    });
}

module.exports = {
    getPostData,
}
