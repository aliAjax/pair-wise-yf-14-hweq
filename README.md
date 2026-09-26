# hxyfront-62002 剧场灯光Cue表管理

源提示词编号：2

给剧场灯光师使用的排演工作台：按光位筛选灯具，调整通道、色片、焦点与亮度，舞台平面图与当前场景实时联动；Cue 列表支持新增、改名、上下排序，序号自动保持连续；被 Cue 引用的灯具无法直接移除，会列出相关 Cue 并挡住操作；所有排演调整自动保存为浏览器本地草稿。

## 功能

- **光位筛选**：面光 / 侧光 / 逆光 / 效果光，舞台图与灯具清单同步过滤
- **舞台平面图**：俯视灯位图，点击选中灯具，可直接拖动焦点；当前 Cue 点亮的灯具显示彩色光束
- **灯具调整**：通道号（1–512，占用冲突提示）、色片、焦点 X/Y、亮度，改动即时反映到舞台图与场景预览
- **Cue 列表**：新增、双击改名、上移/下移排序，序号始终连续；点击切换当前场景
- **移除保护**：灯具被 Cue 引用时弹出相关 Cue 清单并阻止移除，未引用时可正常移除
- **本地草稿**：调整防抖自动写入 localStorage，也可手动「保存草稿」或「重置示例」
- **演出信息**：演出名称与版本备注可直接编辑

## 技术栈

React + Vite + TypeScript

## 目录结构（数据 / 规则 / 界面分离）

```
src/
├── types.ts               # 领域类型（Fixture / Cue / Draft …）
├── data/                  # 数据层：光位、色片、初始灯具与 Cue
│   ├── positions.ts
│   ├── gels.ts
│   └── initialDraft.ts
├── rules/                 # 规则层：纯函数业务逻辑，不依赖 UI
│   ├── fixtureRules.ts    #   通道校验、光位筛选
│   ├── cueRules.ts        #   Cue 引用查找、移除拦截、排序、连续序号
│   ├── lighting.ts        #   光束/锚点/透明度等舞台图计算
│   └── storage.ts         #   本地草稿读写
├── hooks/
│   └── useRehearsalDraft.ts  # 草稿状态与自动保存
└── components/            # 界面层：只负责渲染与交互
    ├── StagePlot.tsx      #   舞台平面图（可拖焦点）
    ├── PositionFilter.tsx #   光位筛选
    ├── FixtureInspector.tsx
    ├── FixtureTable.tsx
    ├── CueList.tsx
    ├── ScenePreview.tsx   #   当前场景预览
    └── RemoveBlockedDialog.tsx
```

## 本地运行

```bash
npm install
npm run dev
```

开发端口：62002
