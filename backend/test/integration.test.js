/**
 * 后端API集成测试 - 带Token的完整测试
 * 运行方式: node backend/test/integration.test.js
 * 
 * 注意：运行前请确保MySQL已启动且数据库已创建
 * 创建数据库：mysql -u root -p < backend/database.sql
 */

const http = require('http')
const jwt = require('jsonwebtoken')

// 测试配置
const JWT_SECRET = 'd92f8a1e5b7c4d3f6a9b0c2e8f1a7d5c9e3b1f6a2d8c4e7'

// 测试结果统计
let passed = 0
let failed = 0

// 测试用的模拟用户
const testUser = {
  userId: 99999,
  openid: 'test_openid_integration',
  nickname: '集成测试用户'
}

let accessToken = null

/**
 * 发送HTTP请求
 */
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          })
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (error) {
    console.log(`  ❌ ${name}`)
    console.log(`     错误: ${error.message}`)
    failed++
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || '断言失败')
}

function generateTestToken() {
  return jwt.sign(
    { id: testUser.userId, openid: testUser.openid, nickname: testUser.nickname, type: 'access' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

async function runTests() {
  console.log('\n' + '='.repeat(50))
  console.log('🧪 后端API集成测试（带Token）')
  console.log('='.repeat(50) + '\n')

  accessToken = generateTestToken()
  console.log(`📝 生成测试Token\n`)

  // ---------- 用户模块测试（带Token） ----------
  console.log('📋 用户模块测试（需要认证）')

  await test('GET /api/user/me Token验证通过', async () => {
    const res = await request({
      path: '/api/user/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    // Token验证通过即可，数据库可能不存在
    assert(res.statusCode !== 401, `Token验证失败`)
  })

  await test('PUT /api/user/info Token验证通过', async () => {
    const res = await request({
      path: '/api/user/info',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }, { nickname: '测试昵称', bio: '测试简介' })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('POST /api/user/identity Token验证通过', async () => {
    const res = await request({
      path: '/api/user/identity',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }, { identity: 'villager' })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('PUT /api/user/settings Token验证通过', async () => {
    const res = await request({
      path: '/api/user/settings',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }, { theme: 'dark' })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  // ---------- Token边界测试 ----------
  console.log('\n📋 Token边界测试')

  await test('过期Token返回401', async () => {
    const expiredToken = jwt.sign(
      { id: 1, openid: 'test', type: 'access' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    )
    const res = await request({
      path: '/api/user/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    })
    assert(res.statusCode === 401, `应返回401，实际${res.statusCode}`)
  })

  await test('错误格式Token返回401', async () => {
    const res = await request({
      path: '/api/user/me',
      method: 'GET',
      headers: { 'Authorization': 'InvalidFormat' }
    })
    assert(res.statusCode === 401, `应返回401`)
  })

  await test('缺少Bearer前缀返回401', async () => {
    const res = await request({
      path: '/api/user/me',
      method: 'GET',
      headers: { 'Authorization': accessToken }
    })
    assert(res.statusCode === 401, `应返回401`)
  })

  // ---------- 公开接口测试 ----------
  console.log('\n📋 公开接口测试')

  await test('GET /api/user/:userId 公开可访问', async () => {
    const res = await request({ path: '/api/user/1', method: 'GET' })
    assert(res.statusCode !== 401, `不应返回401`)
  })

  await test('GET /api/user/search 公开可访问', async () => {
    // 使用英文避免编码问题
    const res = await request({ path: '/api/user/search?keyword=test', method: 'GET' })
    assert(res.statusCode !== 401, `不应返回401`)
  })

  // ---------- 测试结果 ----------
  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: 通过 ${passed} / 失败 ${failed}`)
  
  if (failed === 0) {
    console.log('\n💡 提示: 如果数据库未创建，部分接口会返回500错误')
    console.log('   创建数据库: mysql -u root -p < backend/database.sql')
  }
  
  console.log('='.repeat(50) + '\n')

  if (failed > 0) process.exit(1)
}

runTests().catch(console.error)
