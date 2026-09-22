# 「一起学」管理员接入与维护

此文档供站点负责人配置后台，不放进学习页面。页面路径为 `/studyshare/`，网站仍静态部署到 GitHub Pages，账号与共享数据保存在 Supabase。朋友只需要你预建的邮箱和密码；页面没有注册、验证码、邀请或配置入口。

## 1. 建立项目并关闭公开注册

1. 在你自己的 Supabase 账号下创建项目。
2. 打开 **Authentication → Sign In / Providers**，启用 **Email**，关闭 **Allow new users to sign up** 和匿名登录。必须先关闭公开注册，再启用下面的自动加入空间机制。
3. 在 **SQL Editor** 以默认 `postgres` 身份运行 [`supabase/study.sql`](../supabase/study.sql) 全文。脚本支持全新安装与旧版升级，可重复执行，不会清空已有记录。
4. API 的 Exposed schemas 保留 `public`；不要添加 `study_private`。保留三张 `study_*` 表的 RLS，勿添加开放读写策略。

该专用 Supabase 项目中的预建账号共享一个账号目录；每本书再独立分配学习成员。因此建议此项目只用于「一起学」。公开注册开关见 [Supabase Auth 配置](https://supabase.com/docs/guides/auth/general-configuration)。

## 2. 手动创建自己和朋友的账号

在 **Authentication → Users → Add user → Create new user** 填写邮箱与密码，勾选 **Auto confirm user?**。先创建自己的账号。不要选择通过邮件邀请的选项。

这种管理员创建且自动确认的账号可直接使用密码登录，**不需要 SMTP，也不会发送确认邮件**。账号邮箱仍应填写你和朋友实际控制的邮箱，密码通过你选择的私下方式交付。官方 [Dashboard 创建用户表单](https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/Auth/Users/CreateUserModal.tsx) 明确提供自动确认选项并说明此表单不发确认邮件；账号与密码机制见 [密码登录文档](https://supabase.com/docs/guides/auth/passwords)。

然后在 SQL Editor 执行一次，替换邮箱、空间名和昵称：

```sql
select study_private.configure_workspace(
  '我们的学习空间',
  '你的真实邮箱@example.com',
  '你的昵称'
);
```

之后按相同方式创建朋友账号，数据库会自动把新账号加入这个空间的账号目录。默认昵称为邮箱 `@` 前的部分。朋友没有加入任何书时会看到空项目列表，这是正常状态。

若朋友账号在配置空间之前就已创建，或需要修改昵称，执行：

```sql
select study_private.admin_add_member(
  (select workspace_id from study_private.settings where singleton),
  '朋友的真实邮箱@example.com',
  '朋友昵称'
);
```

这两个函数只有数据库管理员能执行，网页账号不能调用。当前每个账号只属于一个空间；学习小组没有原来的两人上限。自动加入通过 `auth.users` 触发器实现，[官方说明](https://supabase.com/docs/guides/auth/managing-user-data) 提醒触发器错误可能阻止账号创建；如创建失败，先查看数据库日志，不要关闭权限检查来绕过。

页面暂不提供找回密码。需要重置时由你在 Dashboard 的账号管理中处理；若将来增加邮件找回或邮件邀请，再单独配置 SMTP。

## 3. 获取两个公开连接值

在项目顶部的 **Connect** 对话框获取 **Project URL** 和 **Publishable key**。也可在 **Settings → API Keys** 找到 Publishable key。新 key 通常以 `sb_publishable_` 开头。旧项目可用 `anon` key。路径及公开/私有 key 的区分见 [Supabase API Keys](https://supabase.com/docs/guides/getting-started/api-keys)。

复制 `.env.example` 为 `.env.local`，仅填写这两个公开值：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的_publishable_key
```

旧项目可用 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 替代第二项。不要提供或填写 secret key、`service_role`、数据库密码；浏览器权限依赖用户登录和数据库 RLS，而非隐藏公开 key。`.env.local` 已被 Git 忽略。

本地重新启动 `npm run dev`，访问 `/studyshare/`。静态站点需要在 GitHub 仓库 **Settings → Secrets and variables → Actions → Variables** 添加相同名称的 Repository variables：

| 名称 | 值 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 仅使用旧 anon key 时填，与上一项二选一 |

部署工作流已读取这些变量。重新运行 **Deploy Next.js to GitHub Pages** 构建部署，公开连接值才会编入静态网页。密码登录无需 callback URL 或邮件模板；如果维护 Auth Site URL，可设置为实际站点的 `/studyshare/` 地址。

## 4. 开始学习与管理每本书的成员

分别用预建邮箱和密码登录。新建项目时创建者成为负责人，从空间账号目录勾选一起学的人，也可导入计算机网络模板。每本书拥有自己的学习小组：

- 只有在学成员可读取该书及其历史学习记录。空间里其他账号即使猜到书 ID，也不能读取或自行加入。
- 负责人可增减成员。其他在学成员可维护书籍内容、追加学习包和习题，但不能变更成员或负责人。
- 移除成员后，该成员失去整本书的访问权限；已写的历史记录仍保留给当前小组。重新加入可恢复访问。
- 每个人只能修改自己的答案、进度、学习时长和审核；审核必须面向同书另一位在学成员，且对应实际提交的准确版本。
- 所有记录保存都检查版本。两台设备同时编辑时会提示冲突并保留待处理草稿，不以最后写入静默覆盖。先同步，再比较和处理冲突。

同一浏览器使用 Web Locks 保护学习编辑会话，另一标签页只读；关闭编辑页后刷新另一页即可接管。不支持该能力的旧浏览器会显示单页面编辑提示。

同步是定期拉取和保存后同步，不是即时聊天。断网时本机草稿保留，恢复网络后同步；留意页面同步状态。退出后页面不展示上一账号云端内容；不要在公共设备长期保持登录。未接入后台时，本机体验的数据仍只属于当前浏览器，不能当作跨设备共享。

### 空间总览的统计口径

登录后先进入空间总览，再打开具体书籍。总览展示空间成员、成员与书籍的进度对照、累计和本周专注时间，以及跨书学习日历；书架可按自己的学习状态筛选。

总览只汇总当前账号有权访问的书籍 / 项目及各书当前成员，不扩大书籍权限。没有共同项目的成员仍显示在目录中，未参与的书显示「未参与」，不能据此推断对方在其他书籍中的学习量。

个人总进度 = 已完成基础学习包数 / 本人参与书籍的基础学习包总数；空间总进度按每位当前成员应完成的包数合计，均不直接平均各书百分比。没有基础计划时显示「暂无计划」。同一包分多天学习的有效时间会累加，完成只计一次；撤销的时间不计入。本周按各项目当地周一至今天统计，跨项目学习天数按已记录的当地日期去重。

本次总览复用原有学习记录，不需要新增 Supabase 表或再次执行数据库迁移。

## 5. 升级和维护

直接再次执行 `study.sql` 即可升级。旧邀请与自助创建空间接口会撤销；原两人空间扩展为管理员预建账号目录。已有项目首次迁移时原空间成员会成为该书成员，后续重复执行不会恢复已移除的成员。

旧客户端曾允许先保存内置计算机网络记录、后上传项目。迁移仅在真实旧记录引用 `computer-networking` 且缺少项目时，补入完整的 8 章、60 个学习包、132 道题模板，并保留原答案和进度。其他未知项目的孤立记录不会被删除，也不会生成虚构章节；管理员应从备份恢复真实项目结构后再开放。升级前建议导出数据库备份。

数据库保护已有章节、学习包和习题的 ID；普通保存不能删除结构，只有创建者可新增、编辑学习包和习题。删除必须使用下述事务接口。单条 JSON 上限 1 MB，时长大于 0 且不超过 1500 分钟，以兼容夏令时回退的 25 小时日。计时原始片段须为合法、正向且不重叠的时间区间；手动调整日期或分钟可以保留原始片段，不要求二者相等。时长记录的更正与撤销也使用版本检查。首次完成日期保留。

不要直接删除 `auth.users`、成员表或学习记录来处理退出学习；应使用页面的每书成员管理。定期备份，并按实际 Supabase 方案安排数据库备份和容量维护。数据库不会自动判题或证明真实学习时长。

### 删除账号后，同邮箱重建导致无法进入空间

邮箱相同不代表 Supabase 用户 UUID 相同。如果删除 `study_members` 中的成员行和对应 Auth 账号，再重新建号，既有书籍可能仍引用旧 UUID，整个空间会因成员引用不完整而停止同步。前端会保留本机数据和待同步内容，不会自动把历史记录归给新账号。

在 SQL Editor 以默认 `postgres` 身份运行 [`study-diagnose-members.sql`](../supabase/study-diagnose-members.sql)，查询失效的 `missing_user_id` 与新账号目录。然后在 [`study-repair-member.sql`](../supabase/study-repair-member.sql) 中填写 `v_old`（旧 UUID）和 `v_email`（新账号邮箱），保持 `v_apply := false`，运行全文查看 `NOTICE` 中的成员数组与版本预览，此时不会写入数据。确认新旧账号属于同一位朋友且书籍范围正确，再将 `v_apply` 改为 `true` 并重跑全文保存。脚本只有一条原子 `DO` 语句，不依赖临时表；任何错误都会回滚整次修改，已无匹配引用时重复执行不会再次修改数据。完成后重新连接学习页面；若待同步项目提示版本冲突，先读取云端版本后再重新编辑成员。

此修复只处理旧账号已删除、且没有个人学习记录或项目负责人归属的成员引用，保留书籍内容与其他人的所有记录，并递增版本。涉及真实记录归属、另一个空间、仍存在的旧账号或其他失效成员时会拒绝修改，需要先核对完整诊断，不能直接清空数据。日常退出某本书使用网页的「管理成员」，保留账号目录中的历史身份。

## 6. 验收与已验证范围

上线前用三个独立浏览器账号检查：A 建书并加入 B；C 未加入时看不到该书；B 可以保存自己的答案并看到 A 的提交，但不能更改 A 的记录。A 移除 B 后 B 失去访问，A 仍能看历史；重新加入后恢复。再检查计时、跨午夜日历、审核、退出登录、断网恢复和两设备同时编辑的冲突提示。

开发数据库可在执行迁移后运行 [`supabase/study-security-test.sql`](../supabase/study-security-test.sql)。脚本创建四个测试账号，验证自动预建、多人目录、每书隔离、成员管理权限、旧成员历史、个人所有权、各类 CAS、坏结构、引用约束、精确审核版本与计时片段，最后 **ROLLBACK**，不留下测试账号或修改默认空间。

本地网络模拟测试：

```sh
node --test tests/study-cloud.test.mjs
```

已在临时 PGlite PostgreSQL 环境实际执行新建迁移、重复迁移、权限回归以及真实旧版 SQL 的升级测试；旧版孤立网络记录补齐完整项目，未知孤立记录保留，第三个账号可加入，重复迁移保留成员移除和版本。这模拟了 Supabase 的 `auth.uid()` 与角色，尚未替代你真实项目上的 Dashboard 建号、密码登录、跨浏览器网络及并发验证。

浏览器适配器使用官方 Auth REST / PostgREST，无需额外 SDK，包含自动令牌刷新、跨标签页刷新锁、会话通知和一次 401 重试。机制参考 [Supabase Sessions](https://supabase.com/docs/guides/auth/sessions) 与 [Auth REST 文档](https://github.com/supabase/auth/blob/master/README.md)。


## 学习内容管理接口

已有数据库：在 Supabase → SQL Editor → New query 中粘贴并运行 [`supabase/study-curriculum-api.sql`](../supabase/study-curriculum-api.sql) 全文。脚本可重复运行，仅安装接口和权限校验，不会当场删除学习数据。新数据库的 `study.sql` 已包含这些接口。无需新增环境变量或服务端密钥。

本书创建者（`ownerId`，与「管理成员」相同身份）在「习题与笔记」→「管理习题」中可搜索、新增、编辑、删除题目；删除前会显示题目及受影响的作答人数。普通成员可独立作答和查看伙伴记录，无权改题。

| 操作 | PostgREST RPC | 影响 |
| --- | --- | --- |
| 新增 / 修改题干 | `study_save_record`，`p_kind: project` | 保留原题 ID 和已有作答；新题使用新 ID |
| 删除题目 | `study_delete_question` | 删除指定书、包、题以及所有成员的对应答案；保留其他题和学习时间、打卡 |
| 第一章旧包清理 / 替换 | `study_replace_chapter_one` | 仅处理网络教材第一章旧包，删除其答案、打卡、时间与互检；保留已有新版及其他章节 |

删除题目参数：`p_room_id`、`p_project_id`、`p_pack_id`、`p_question_id`、`p_expected_revision`。第一章替换参数：`p_room_id`、`p_project_id`、`p_chapter`（当前第一章模板）、`p_expected_revision`。请求沿用当前登录 token 和公开客户端 key，返回更新后的 project 记录。

接口在一个事务内校验登录、同空间、本书创建者、成员资格及项目版本，并清除关联数据。旧客户端无法恢复已删 ID；离线答案重连后丢弃已删除题目的待同步条目，过时的书籍编辑进入冲突处理。删除前先同步本书现有改动；有未解决冲突时不会删除。删除后仅保留防止旧设备回传所需的 ID 标记，不保留旧题或旧作答。
