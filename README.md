# Jingqing Liu · Personal website

Next.js 15 / React 19，静态导出到 GitHub Pages。

```bash
npm ci
npm run dev
```

## 一起学 · Study together

预览入口：`/studyshare/`。Books 与一起学的公开导航入口暂时隐藏，相关页面设置为不被搜索引擎收录。

- **学习总览**：多书籍 / 多项目书架、每个人的完成率、小组平均、共同完成与章节路线。
- **多人打卡**：每本书单独选择成员，每人独立填写，可筛选比较对象，退出后历史保留。
- **学习日历**：按学习分钟或首次完成包数显示固定档位热力图，查看当天实际内容。
- **习题与笔记**：答案与笔记自动保存、按题号跳转、添加实际原书题、学习完成与互检分别记录。
- **学习时间**：同一包可分多天多次完成；专注计时跨午夜拆分，手动补录及修改 / 撤销。
- **备份与共享**：本机 JSON 导出 / 恢复；云端使用负责人预建的邮箱与密码账号，按书授权、离线待同步和版本冲突提示。

已导入《计算机网络：自顶向下方法》第八版的 8 章学习计划。第一章按提供的教材题页覆盖为 R1–R28、P1–P34，并加入三个独立 Wireshark 实验阶段；其余章节保留原学习计划。第一章总复习入口复用各节答案，无需重复作答。

已存在的计算机网络书籍可由创建者在本书页面替换第一章或删除旧学习包。旧包及所有成员对应的答案、打卡、互检和学习时间永久删除；新版记录及其他章节保留。「习题与笔记」中的「管理习题」集中提供题目搜索、新增、编辑和删除，并显示每题已作答人数：编辑保留作答，删除同时清除所有成员对应作答，保留打卡和学习时间。首次需执行 [`supabase/study-curriculum-api.sql`](supabase/study-curriculum-api.sql) 安装管理接口；全新数据库直接执行完整 `study.sql` 即可。

配置位置在 [.env.example](.env.example)，需要的值保持留白。负责人参考 [Supabase 接入与账号准备](docs/study-setup.md) 配置；学习网页只呈现登录与学习功能，不提供数据库教程。没有配置时，记录仅保存在当前浏览器，本机身份切换用于体验。

多人版的计算与边界规则见 [设计说明](docs/study-next-design.md)。

## 验证

```bash
npm run test:study
npx tsc --noEmit
npm run lint
npm run build
```

测试命令建议使用 Node.js 24 或更新版本，覆盖学习计划完整性、个人完成与互检、成员隔离、跨日计时、备份迁移、撤销记录、同步竞态和 Supabase HTTP 适配器。数据库权限回归见 [SQL 测试](supabase/study-security-test.sql)，应在安装 schema 的开发数据库执行。

生产构建输出到 `out/`；开发预览与生产构建应分别运行，避免缓存互相覆盖。网站使用原有系统字体栈，无需联网下载字体。

## 学习计划维护

默认计划由 `src/data/study/networking.ts` 组合原交接计划、`networking-chapter-one.ts` 的教材题和 `networking-wireshark.ts` 的实验步骤。若需要从原交接包重新生成：

```bash
python3 scripts/import-study-plan.py /path/to/CODEX_自顶向下第8版_完整学习交接包.md
```

此脚本重新生成原交接计划，并保留独立维护的第一章题目与实验覆盖层，不导入个人完成记录。一般添加新书或习题可直接使用页面中的表单。
