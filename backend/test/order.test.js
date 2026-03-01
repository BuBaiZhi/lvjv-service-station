/**
 * 订单模块测试脚本
 */

const http = require('http')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'd92f8a1e5b7c4d3f6a9b0c2e8f1a7d5c9e3b1f6a2d8c4e7'

let passed = 0
let failed = 0

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
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) })
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

function generateToken(userId = 99999) {
  return jwt.sign(
    { id: userId, openid: 'test_openid', nickname: '测试用户', type: 'access' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

async function runTests() {
  console.log('\n' + '='.repeat(50))
  console.log('🧪 订单模块测试')
  console.log('='.repeat(50) + '\n')

  const token = generateToken()

  // ---------- 认证测试 ----------
  console.log('📋 认证测试')

  await test('GET /api/order/list 未认证返回401', async () => {
    const res = await request({ path: '/api/order/list', method: 'GET' })
    assert(res.statusCode === 401, `应返回401`)
  })

  await test('GET /api/order/stats 未认证返回401', async () => {
    const res = await request({ path: '/api/order/stats', method: 'GET' })
    assert(res.statusCode === 401, `应返回401`)
  })

  await test('POST /api/order 未认证返回401', async () => {
    const res = await request({ path: '/api/order', method: 'POST' }, {})
    assert(res.statusCode === 401, `应返回401`)
  })

  // ---------- 参数验证测试 ----------
  console.log('\n📋 参数验证测试')

  await test('POST /api/order 缺少参数返回400', async () => {
    const res = await request({
      path: '/api/order',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }, {})
    assert(res.statusCode === 400, `应返回400，实际${res.statusCode}`)
  })

  await test('POST /api/order 无效itemType返回400', async () => {
    const res = await request({
      path: '/api/order',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }, { sellerId: 1, itemId: 1, itemType: 'invalid', price: 100 })
    assert(res.statusCode === 400, `应返回400`)
  })

  // ---------- 业务逻辑测试 ----------
  console.log('\n📋 业务逻辑测试')

  await test('GET /api/order/list Token验证通过', async () => {
    const res = await request({
      path: '/api/order/list',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('GET /api/order/stats Token验证通过', async () => {
    const res = await request({
      path: '/api/order/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('GET /api/order/:id 不存在的订单', async () => {
    const res = await request({
      path: '/api/order/99999',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    // 应该返回404或403（无权限）
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  // ---------- 测试结果 ----------
  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: 通过 ${passed} / 失败 ${failed}`)
  console.log('='.repeat(50) + '\n')

  if (failed > 0) process.exit(1)
}

runTests().catch(console.error)
