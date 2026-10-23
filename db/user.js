const path = require('path');
const s = require('lowdb/node')
const { v4 } = require('uuid')
const { Low, JSONFilePreset } = s;
let db;

// 用户管理

const initLowDb = async () => {
    const dataDir = process.env.DATA_DIR || '.';
    const dbPath = path.join(dataDir, 'db.json');
    // fallback to legacy relative path if DATA_DIR not set
    const finalPath = process.env.DATA_DIR ? dbPath : '../../db.json';
    db = await JSONFilePreset(finalPath, { users: [] })
}



const addUser = async (user) => {
    // 判断user是否存在
    const theUser = getUserByName(user.name);
    console.log(theUser, 'jjjj')
    if (theUser) {
        return { msg: 'user already exists' };
    } else {

        db.data.users.push({ id: v4(), ...user });
        await db.write();
        return user;
    }
}

const updateUserById = async (id, user) => {
    const theUser = getUserById(id);
    if (theUser) {
        Object.assign(theUser, user);
        await db.write();
        return user;
    } else {
        return { msg: 'user not found' };
    }
}



const getAllUsers = () => db.data.users;
const getUserById = (id) => db.data.users.find(u => u.id === id);
const getUserByName = (name) => db.data.users.find(u => u.name === name);

module.exports = {
    initLowDb,
    addUser,
    updateUserById,
    getAllUsers,
    getUserById,
    getUserByName,
}