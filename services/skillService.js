// 技能服务 - 支持云数据库和本地存储双模式
const LOCAL_STORAGE_KEY = 'local_skills'

// 尝试获取云开发模块
let cloudModule = null
try {
  cloudModule = require('../utils/cloud.js')
} catch (e) {
  console.log('[skillService] 云开发模块不可用，使用本地存储模式')
}

// 开发模式：使用模拟数据
const USE_MOCK = false

// 模拟技能数据
const mockSkills = [
  {
    _id: 'skill_1',
    type: 'task',
    title: '周末徒步活动招募',
    description: '本周六组织徒步活动，有兴趣的朋友可以一起参加！',
    images: ['https://via.placeholder.com/400x300?text=Skill+1'],
    price: 0,
    unit: '免费',
    author: { id: 'user_1', name: '户外达人', avatar: 'https://via.placeholder.com/100x100?text=User+1' },
    viewCount: 234,
    likeCount: 45,
    status: 'active',
    createTime: '2026-02-25T10:00:00.000Z'
  },
  {
    _id: 'skill_2',
    type: 'video',
    title: '吉他入门教学',
    description: '提供吉他入门教学视频，适合零基础学员。',
    images: ['https://via.placeholder.com/400x300?text=Skill+2'],
    price: 29,
    unit: '元',
    author: { id: 'user_2', name: '音乐人阿杰', avatar: 'https://via.placeholder.com/100x100?text=User+2' },
    viewCount: 512,
    likeCount: 89,
    status: 'active',
    createTime: '2026-02-24T14:00:00.000Z'
  },
  {
    _id: 'skill_3',
    type: 'resource',
    title: '二手摄影器材转让',
    description: '闲置相机和镜头，九成新，价格实惠。',
    images: ['https://via.placeholder.com/400x300?text=Skill+3'],
    price: 3500,
    unit: '元',
    author: { id: 'user_3', name: '摄影师小王', avatar: 'https://via.placeholder.com/100x100?text=User+3' },
    viewCount: 156,
    likeCount: 23,
    status: 'active',
    createTime: '2026-02-23T09:00:00.000Z'
  }
]

// ========== 本地存储方法 ==========

function getLocalSkills() {
  try {
    const local = wx.getStorageSync(LOCAL_STORAGE_KEY)
    return local || mockSkills
  } catch (e) {
    return mockSkills
  }
}

function saveLocalSkill(skillData) {
  const skills = getLocalSkills()
  const newSkill = {
    ...skillData,
    _id: 'local_' + Date.now(),
    viewCount: 0,
    likeCount: 0,
    status: 'active',
    createTime: new Date().toISOString()
  }
  skills.unshift(newSkill)
  wx.setStorageSync(LOCAL_STORAGE_KEY, skills)
  return Promise.resolve(newSkill._id)
}

// ========== 云开发方法 ==========

async function getCloudSkillList(type = null, page = 1, pageSize = 20) {
  const { db } = cloudModule
  
  let query = db.collection('skills').where({ status: 'active' })
  if (type) {
    query = query.where({ type: type })
  }
  
  const res = await query
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return res.data
}

async function getCloudSkillById(skillId) {
  const { db } = cloudModule
  
  const res = await db.collection('skills').doc(skillId).get()
  return res.data
}

async function saveCloudSkill(skillData) {
  const { db } = cloudModule
  
  const data = {
    ...skillData,
    // 注意：不要手动设置 _openid，云数据库会自动添加
    viewCount: 0,
    likeCount: 0,
    status: 'active',
    createTime: db.serverDate()
  }
  
  const res = await db.collection('skills').add({ data })
  return res._id
}

async function updateCloudSkill(skillId, skillData) {
  const { db } = cloudModule
  
  await db.collection('skills').doc(skillId).update({
    data: {
      ...skillData,
      updateTime: db.serverDate()
    }
  })
  
  return true
}

async function deleteCloudSkill(skillId) {
  const { db } = cloudModule
  
  await db.collection('skills').doc(skillId).update({
    data: { status: 'deleted' }
  })
  
  return true
}

// ========== 统一接口（带降级） ==========

// 获取技能列表
function getSkillList(type = null, page = 1, pageSize = 20) {
  if (USE_MOCK) {
    let skills = mockSkills
    if (type) {
      skills = skills.filter(s => s.type === type)
    }
    return Promise.resolve(skills)
  }
  
  if (cloudModule && cloudModule.db) {
    return getCloudSkillList(type, page, pageSize).catch(err => {
      console.log('[skillService] 云端获取失败，使用本地数据:', err.message)
      return getLocalSkills()
    })
  }
  return Promise.resolve(getLocalSkills())
}

// 获取技能详情
function getSkillById(skillId) {
  if (USE_MOCK) {
    const skill = mockSkills.find(s => s._id === skillId)
    return Promise.resolve(skill || mockSkills[0])
  }
  
  if (cloudModule && cloudModule.db) {
    return getCloudSkillById(skillId).catch(err => {
      console.log('[skillService] 云端获取详情失败:', err.message)
      const skills = getLocalSkills()
      return skills.find(s => s._id === skillId)
    })
  }
  
  const skills = getLocalSkills()
  return Promise.resolve(skills.find(s => s._id === skillId))
}

// 发布技能
function publishSkill(skillData) {
  // 先保存到本地
  saveLocalSkill(skillData)
  
  // 尝试同步到云端
  if (cloudModule && cloudModule.db && !USE_MOCK) {
    return saveCloudSkill(skillData).catch(err => {
      console.log('[skillService] 云端发布失败，已保存到本地:', err.message)
      return 'local_' + Date.now()
    })
  }
  
  return Promise.resolve('local_' + Date.now())
}

// 更新技能
function updateSkill(skillId, skillData) {
  if (cloudModule && cloudModule.db && !USE_MOCK) {
    return updateCloudSkill(skillId, skillData).catch(err => {
      console.log('[skillService] 云端更新失败:', err.message)
      return false
    })
  }
  return Promise.resolve(true)
}

// 删除技能
function deleteSkill(skillId) {
  if (cloudModule && cloudModule.db && !USE_MOCK) {
    return deleteCloudSkill(skillId).catch(err => {
      console.log('[skillService] 云端删除失败:', err.message)
      return false
    })
  }
  return Promise.resolve(true)
}

// 按类型获取
function getSkillsByType(type) {
  return getSkillList(type)
}

// 搜索技能
function searchSkills(keyword) {
  if (USE_MOCK) {
    const results = mockSkills.filter(s => 
      s.title.includes(keyword) || s.description.includes(keyword)
    )
    return Promise.resolve(results)
  }
  
  if (cloudModule && cloudModule.db) {
    const { db, _ } = cloudModule
    return db.collection('skills')
      .where(_.or([
        { title: db.RegExp({ regexp: keyword, options: 'i' }) },
        { description: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]))
      .where({ status: 'active' })
      .get()
      .then(res => res.data)
      .catch(() => [])
  }
  
  return Promise.resolve([])
}

module.exports = {
  getSkillList,
  getSkillById,
  publishSkill,
  updateSkill,
  deleteSkill,
  getSkillsByType,
  searchSkills,
  // 暴露本地方法供调试
  getLocalSkills
}
