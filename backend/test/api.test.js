/**
 * 后端API测试脚本
 * 运行方式: node backend/test/api.test.js
 */

const http = require('http')

// 测试结果统计
let passed = 0
let failed = 0

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

/**
 * 测试用例
 */
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

/**
 * 断言
 */
function assert(condition, message) {
  if (!condition) throw new Error(message || '断言失败')
}

// ============================================
// 测试套件
// ============================================

async function runTests() {
  console.log('\n' + '='.repeat(50))
  console.log('🧪 后端API测试')
  console.log('='.repeat(50) + '\n')

  // ---------- 健康检查测试 ----------
  console.log('📋 健康检查测试')
  
  await test('GET /api/health 返回200', async () => {
    const res = await request({ path: '/api/health', method: 'GET' })
    assert(res.statusCode === 200, `状态码应为200，实际为${res.statusCode}`)
    assert(res.body.code === 0, `业务码应为0`)
    assert(res.body.data.status === 'healthy', '状态应为healthy')
  })

  // ---------- 认证模块测试 ----------
  console.log('\n📋 认证模块测试')

  await test('POST /api/auth/login 缺少参数返回400', async () => {
    const res = await request({ path: '/api/auth/login', method: 'POST' }, {})
    assert(res.statusCode === 400, `状态码应为400，实际为${res.statusCode}`)
    assert(res.body.code === 400, '业务码应为400')
  })

  await test('POST /api/auth/login 缺少userInfo返回400', async () => {
    const res = await request({ path: '/api/auth/login', method: 'POST' }, { code: 'test_code' })
    assert(res.statusCode === 400, `状态码应为400，实际为${res.statusCode}`)
  })

  await test('POST /api/auth/login 无效code返回401', async () => {
    const res = await request({ path: '/api/auth/login', method: 'POST' }, {
      code: 'invalid_code_12345',
      userInfo: { nickName: '测试用户' }
    })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
    assert(res.body.code === 401, '业务码应为401')
  })

  await test('POST /api/auth/refresh 缺少token返回400', async () => {
    const res = await request({ path: '/api/auth/refresh', method: 'POST' }, {})
    assert(res.statusCode === 400, `状态码应为400，实际为${res.statusCode}`)
  })

  await test('POST /api/auth/refresh 无效token返回401', async () => {
    const res = await request({ path: '/api/auth/refresh', method: 'POST' }, { refreshToken: 'invalid_token' })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  // ---------- 用户模块测试 ----------
  console.log('\n📋 用户模块测试')

  await test('GET /api/user/me 未认证返回401', async () => {
    const res = await request({ path: '/api/user/me', method: 'GET' })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  await test('GET /api/user/me 无效token返回401', async () => {
    const res = await request({
      path: '/api/user/me',
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_token' }
    })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  await test('PUT /api/user/info 未认证返回401', async () => {
    const res = await request({ path: '/api/user/info', method: 'PUT' }, { nickname: '测试' })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  await test('POST /api/user/identity 未认证返回401', async () => {
    const res = await request({ path: '/api/user/identity', method: 'POST' }, { identity: 'villager' })
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  await test('POST /api/user/avatar 未认证返回401', async () => {
    const res = await request({ path: '/api/user/avatar', method: 'POST' }, {})
    assert(res.statusCode === 401, `状态码应为401，实际为${res.statusCode}`)
  })

  // ---------- 404测试 ----------
  console.log('\n📋 404测试')

  await test('GET /api/not-exist 返回404', async () => {
    const res = await request({ path: '/api/not-exist', method: 'GET' })
    assert(res.statusCode === 404, `状态码应为404，实际为${res.statusCode}`)
  })

  // ---------- 限流测试 ----------
  console.log('\n📋 限流测试')

  await test('连续请求正常响应', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request({ path: '/api/health', method: 'GET' })
      assert(res.statusCode === 200, `第${i + 1}次请求失败`)
    }
  })

  // ---------- 测试结果 ----------
  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: 通过 ${passed} / 失败 ${failed}`)
  console.log('='.repeat(50) + '\n')

  if (failed > 0) {
    process.exit(1)
  }
}

// 运行测试
runTests().catch(console.error)
