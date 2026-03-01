/**
 * 消息模块测试脚本
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
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(data) }) }
        catch (e) { resolve({ statusCode: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function test(name, fn) {
  try { await fn(); console.log(`  ✅ ${name}`); passed++ }
  catch (error) { console.log(`  ❌ ${name}`); console.log(`     错误: ${error.message}`); failed++ }
}

function assert(condition, message) { if (!condition) throw new Error(message || '断言失败') }

function generateToken() {
  return jwt.sign({ id: 99999, openid: 'test', nickname: 'test', type: 'access' }, JWT_SECRET, { expiresIn: '1h' })
}

async function runTests() {
  console.log('\n' + '='.repeat(50))
  console.log('🧪 消息模块测试')
  console.log('='.repeat(50) + '\n')

  const token = generateToken()

  console.log('📋 认证测试')
  await test('GET /api/message/list 未认证返回401', async () => {
    const res = await request({ path: '/api/message/list', method: 'GET' })
    assert(res.statusCode === 401, `应返回401`)
  })

  await test('GET /api/message/unread 未认证返回401', async () => {
    const res = await request({ path: '/api/message/unread', method: 'GET' })
    assert(res.statusCode === 401, `应返回401`)
  })

  console.log('\n📋 业务逻辑测试')
  await test('GET /api/message/list Token验证通过', async () => {
    const res = await request({ path: '/api/message/list', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('GET /api/message/unread Token验证通过', async () => {
    const res = await request({ path: '/api/message/unread', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  await test('PUT /api/message/read-all Token验证通过', async () => {
    const res = await request({ path: '/api/message/read-all', method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }, {})
    assert(res.statusCode !== 401, 'Token验证失败')
  })

  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: 通过 ${passed} / 失败 ${failed}`)
  console.log('='.repeat(50) + '\n')

  if (failed > 0) process.exit(1)
}

runTests().catch(console.error)
