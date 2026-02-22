# GitHub 团队协作指南

**项目名称**：旅居服务站  
**仓库地址**：https://github.com/BuBaiZhi/lvji-service-station  
**创建日期**：2026-02-17

---

## 一、分支策略

### 1.1 分支结构

```
main 分支（生产分支）
    ↑ 版本发布
    │
develop 分支（开发主线）
    ↑ 合并 PR
    │
feature 分支（功能分支）
├── feature/user-center        ✅ 用户中心（已完成）
├── feature/house-api          🔄 民宿模块（开发中）
├── feature/skill-api          🔄 技能模块（开发中）
├── feature/activity-api       🔄 活动模块（开发中）
├── feature/square-api         🔄 广场模块（开发中）
└── feature/message-api        🔄 消息模块（开发中）
```

### 1.2 分支说明

| 分支 | 说明 | 保护规则 |
|------|------|----------|
| main | 生产分支，保存所有发布版本 | ✅ 需要 PR + 审查 |
| develop | 开发主线，集成所有功能分支 | ✅ 需要 PR + 审查 |
| feature/* | 功能开发分支，每个人一条 | ❌ 可直接 push |

---

## 二、初始化步骤

### 2.1 创建 develop 分支（仓库所有者）

在 GitHub 网页操作：

```
1. 进入仓库 → Code 标签
2. Branches → New branch
3. Branch name: develop
4. Branch from: main
5. Create branch
```

### 2.2 克隆仓库（所有开发人员）

```bash
# 首次克隆
git clone https://github.com/BuBaiZhi/lvji-service-station.git
cd lvji-service-station

# 配置用户信息（如果还没配置）
git config user.name "你的名字"
git config user.email "你的邮箱@example.com"

# 配置行尾符自动转换
git config --global core.autocrlf true
```

---

## 三、日常开发流程

### 3.1 开发新功能

```bash
# 1. 切换到 develop 分支并拉取最新代码
git checkout develop
git pull origin develop

# 2. 基于 develop 创建自己的功能分支
git checkout -b feature/your-feature-name

# 3. 开发代码（可以多次提交）
git add .
git commit -m "feat: 添加功能描述"

# 4. 推送到远程
git push origin feature/your-feature-name
```

### 3.2 提交 Pull Request

在 GitHub 网页操作：

```
1. 进入仓库 → Pull requests 标签
2. 点击 "New pull request"
3. Base: develop (目标分支)
4. Compare: feature/your-feature-name (你的分支)
5. 填写标题和描述
6. 点击 "Create pull request"

PR 标题示例：
  feat: 完成民宿列表 API 开发
  fix: 修复订单状态更新 bug
  docs: 更新 API 文档
```

### 3.3 Code Review

**PR 作者**：
- 等待团队成员 review
- 如果有意见，继续在该分支上修改
- 修改后自动更新 PR

**Reviewer（审查者）**：
- 在 GitHub 上 review 代码
- 提出意见或点击 "Approve"
- 有权限的人点击 "Merge" 合并

```bash
# 如果需要修改（基于 review 意见）
git add .
git commit -m "fix: 修改意见反馈"
git push origin feature/your-feature-name
# PR 会自动更新
```

### 3.4 合并到 develop

在 GitHub 网页操作：

```
Pull request 页面 → "Merge pull request" 按钮 → "Confirm merge"

或者选择：
- Create a merge commit（保留完整历史）
- Squash and merge（压缩提交记录）
- Rebase and merge（线性历史）
```

建议选择 **Create a merge commit**（保留完整历史）

### 3.5 同步最新代码

```bash
# 合并完成后，你需要更新本地的 develop
git checkout develop
git pull origin develop

# 删除已合并的远程分支
git push origin --delete feature/your-feature-name

# 删除本地分支
git branch -d feature/your-feature-name
```

---

## 四、提交信息规范

### 4.1 commit message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 4.2 type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(house): 添加民宿列表 API |
| fix | 修复 bug | fix(order): 修复订单状态更新 |
| docs | 文档 | docs(api): 更新 API 文档 |
| style | 代码格式 | style: 调整缩进 |
| refactor | 重构 | refactor(user): 优化用户服务 |
| perf | 性能优化 | perf: 减少 API 调用次数 |
| test | 测试 | test: 添加单元测试 |
| chore | 构建、依赖 | chore: 更新依赖版本 |

### 4.3 scope（作用域）

根据模块名填写，常用的有：

```
user, house, skill, activity, square, message, order, api, db
```

### 4.4 提交示例

```bash
# 简单提交
git commit -m "feat(house): 添加民宿列表 API"

# 详细提交（包含 body）
git commit -m "feat(house): 添加民宿列表 API

- 支持分页和筛选
- 集成 OSS 文件存储
- 添加缓存优化"
```

---

## 五、团队成员管理

### 5.1 邀请成员

仓库所有者操作（GitHub 网页）：

```
1. 进入仓库 → Settings
2. Collaborators → Add people
3. 输入成员的 GitHub 用户名
4. 选择权限：Maintain（推荐）或 Write
5. 发送邀请
```

### 5.2 权限说明

| 权限 | 说明 |
|------|------|
| Pull | 只读，可克隆 |
| Triage | 可分配 issue，不能 merge |
| Write | 可开发，可 merge PR |
| Maintain | 可管理分支保护、邀请成员 |
| Admin | 完全权限 |

---

## 六、冲突解决

### 6.1 合并冲突

**什么时候发生**：
- 多个人修改同一文件的同一行
- pull 时有冲突
- merge PR 时有冲突

### 6.2 解决步骤

```bash
# 1. 拉取最新 develop
git checkout develop
git pull origin develop

# 2. 将 develop 合并到你的分支
git checkout feature/your-feature-name
git merge develop

# 3. 解决冲突（在 IDE 中手动选择保留的代码）
# 文件会显示冲突标记：
# <<<<<<< HEAD
# 你的代码
# =======
# develop 的代码
# >>>>>>> develop

# 4. 删除冲突标记，保留需要的代码

# 5. 提交解决
git add .
git commit -m "fix: 解决合并冲突"
git push origin feature/your-feature-name
```

### 6.3 GitHub 网页解决

如果 PR 中有冲突：

```
1. Pull request 页面中会显示 "This branch has conflicts"
2. 点击 "Resolve conflicts"
3. 在编辑器中手动解决
4. 点击 "Mark as resolved"
5. 点击 "Commit merge"
```

---

## 七、版本发布流程

### 7.1 发布版本（仓库所有者）

**准备阶段**（develop 分支）：
```bash
# 确保 develop 是最新状态
git checkout develop
git pull origin develop

# 如果是正式版本，创建 release 分支
git checkout -b release/v1.0.0
```

**发布到 main**：
```bash
# 1. 在 GitHub 创建 PR：release/v1.0.0 → main
# 2. Review 和 merge

# 3. 在 GitHub Release 页面创建版本
# https://github.com/BuBaiZhi/lvji-service-station/releases
# - Tag version: v1.0.0
# - Release title: Version 1.0.0
# - 描述此版本的更新内容

# 4. 发布完成后，将 main 的更改 merge 回 develop
git checkout develop
git pull origin main
git push origin develop
```

### 7.2 版本命名规范

遵循 [Semantic Versioning](https://semver.org/)：

```
v主版本.次版本.修订版本

v1.0.0 - 初版发布
v1.1.0 - 添加新功能
v1.0.1 - 修复 bug
v2.0.0 - 重大更新（破坏性改动）
```

---

## 八、常见问题

### Q1：我不小心提交到了 main？

```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 或者硬回滚（丢弃更改）
git reset --hard HEAD~1

# 重新推送
git push origin main --force-with-lease
```

### Q2：想查看提交历史？

```bash
# 简洁版
git log --oneline -10

# 图形版（推荐）
git log --oneline --graph --all

# 详细版
git log -p
```

### Q3：想撤销某个 commit？

```bash
# 查看历史
git log --oneline

# 撤销指定 commit（保留更改）
git revert commit-hash

# 重新提交
git push origin feature/your-feature-name
```

### Q4：我的分支落后了，如何同步？

```bash
git checkout feature/your-feature-name
git fetch origin
git rebase origin/develop
git push origin feature/your-feature-name --force-with-lease
```

### Q5：想合并最新的 develop 到自己的分支？

```bash
git checkout feature/your-feature-name
git pull origin develop
# 解决冲突（如有）
git push origin feature/your-feature-name
```

---

## 九、最佳实践

### 9.1 ✅ 应该做的事

- ✅ 经常拉取最新代码（每天工作前）
- ✅ 小的功能分支，快速合并
- ✅ 详细的 commit message
- ✅ 在合并前及时 rebase（保持线性历史）
- ✅ 代码合并前进行自我审查
- ✅ 及时删除已合并的分支

### 9.2 ❌ 不应该做的事

- ❌ 直接在 main 或 develop 上开发
- ❌ 提交大量未相关的更改到一个 commit
- ❌ 长期存在的分支（超过 2 周）
- ❌ 不解释地强制 push（--force）
- ❌ 提交密码、API 密钥等敏感信息
- ❌ 提交 node_modules、dist 等生成文件

---

## 十、一天的工作流程示例

```bash
# 上午来了，拉取最新代码
git checkout develop
git pull origin develop

# 开始开发功能
git checkout -b feature/house-pagination

# 编写代码、多次提交
git add .
git commit -m "feat: 添加民宿列表分页"

git add .
git commit -m "feat: 添加分页参数验证"

# 下午完成，推送
git push origin feature/house-pagination

# GitHub 创建 PR，邀请别人 review

# 审查意见来了，本地修改
git add .
git commit -m "fix: 处理 review 意见"
git push origin feature/house-pagination

# PR 被 approve，merge 到 develop

# 本地同步
git checkout develop
git pull origin develop
git branch -d feature/house-pagination
git push origin --delete feature/house-pagination
```

---

## 十一、团队沟通规范

### 11.1 PR 描述模板

```markdown
## 功能描述
简要说明这个 PR 做了什么

## 更改内容
- [ ] 新增 API 接口
- [ ] 修改数据模型
- [ ] 添加数据库迁移
- [ ] 更新文档

## 测试清单
- [ ] 本地测试通过
- [ ] 没有新的 console 错误
- [ ] 没有性能回退

## 关联 Issue
Closes #123
```

### 11.2 Review 反馈示例

```
❌ 建议修改
- 这里的函数名不太清楚，建议改为 getUserById()

✅ 好的地方
- 代码逻辑很清晰，注释也很详细

❓ 需要澄清
- 这个参数的含义是什么？
```

---

## 十二、快速参考

### 常用命令速查

```bash
# 创建功能分支
git checkout -b feature/your-name

# 提交代码
git add .
git commit -m "feat: 描述"
git push origin feature/your-name

# 拉取最新
git pull origin develop

# 查看状态
git status

# 查看历史
git log --oneline -10

# 切换分支
git checkout develop

# 删除分支
git branch -d feature/your-name

# 强制推送（谨慎使用）
git push origin feature/your-name --force-with-lease
```

---

## 十三、后续完善

- [ ] 设置 GitHub Actions 自动化 CI/CD
- [ ] 配置分支保护规则
- [ ] 添加 code review 规范
- [ ] 建立 issue 模板
- [ ] 定期同步 main 和 develop
- [ ] 定期发布版本

---

**最后提醒**：如有问题，随时在 GitHub Issues 中讨论！
