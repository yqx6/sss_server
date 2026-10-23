const s = require('lowdb/node')
const { v4 } = require('uuid')
const { Low, JSONFilePreset } = s;
let db;

// 合集管理

const initLowDb2 = async () => {
    db = await JSONFilePreset('../../cartoon_group.json', { groups: [] })
}

const addGroup = async (group) => {
    const theGroup = getGroupByName(group.name);
    if (theGroup) {
        return { msg: 'group already exists' };
    } else {

        db.data.groups.push({ id: v4(), ...group });
        await db.write();
        return group;
    }
}

const updateGroupById = async (id, group) => {
    const theGroup = getGroupById(id);
    console.log(theGroup, 'jjjj333')
    if (theGroup) {
        Object.assign(theGroup, group);
        await db.write();
        return group;
    } else {
        return { msg: 'group not found' };
    }
}

const getAllGroups = () => db.data.groups;
const getGroupById = (id) => db.data.groups.find(u => u.id === id);
const getGroupByName = (name) => db.data.groups.find(u => u.name === name);

module.exports = {
    initLowDb2,
    addGroup,
    updateGroupById,
    getAllGroups,
    getGroupById,
    getGroupByName,
}
