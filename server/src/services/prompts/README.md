# Prompt风格存档系统

允许从JSON文件中加载和切换不同的AI对话风格。

## 目录结构

```
server/src/services/prompts/
├── styles/
│   ├── default.json    # 默认风格
│   ├── sexy.json       # 性感撩人风格
│   └── eros.json       # 涩涩风格
├── system.prompt.ts    # System prompt生成器
├── user.prompt.ts      # User prompt生成器
├── promptStyle.service.ts  # 风格管理服务
└── README.md           # 本文档
```

## 风格配置文件格式

每个JSON文件包含以下字段:

```json
{
  "name": "风格名称",
  "description": "风格描述",
  "systemPrompt": "系统提示词",
  "style": "风格说明",
  "templates": [
    "场景1：@对象: 对话内容",
    "场景2：@对象: 对话内容"
  ]
}
```

## API接口

### 1. 获取所有可用风格

```bash
GET /api/chat/styles
```

响应:
```json
{
  "styles": [
    { "name": "default", "description": "标准的格斗游戏AI对话风格" },
    { "name": "sexy", "description": "性感诱惑的对话风格，充满挑逗" },
    { "name": "eros", "description": "更加色气湿滑的对话风格，充满暗示" }
  ],
  "currentStyle": "default"
}
```

### 2. 获取当前风格详情

```bash
GET /api/chat/styles/current
```

响应:
```json
{
  "name": "eros",
  "config": {
    "name": "涩涩风格",
    "description": "更加色气湿滑的对话风格，充满暗示",
    "systemPrompt": "格斗游戏AI，极致傲娇毒舌...",
    "style": "15-30字，极致嘲讽+色气挑逗...",
    "templates": [...]
  }
}
```

### 3. 切换风格

```bash
POST /api/chat/styles/switch
Content-Type: application/json

{
  "styleName": "eros"
}
```

响应:
```json
{
  "success": true,
  "message": "已切换到风格: eros",
  "currentStyle": "eros"
}
```

### 4. 重新加载风格列表

```bash
POST /api/chat/styles/reload
```

当你添加了新的风格文件后,调用此接口重新加载:

响应:
```json
{
  "success": true,
  "message": "风格列表已重新加载",
  "count": 3
}
```

## 创建自定义风格

1. 在 `server/src/services/prompts/styles/` 目录下创建新的JSON文件,例如 `my-style.json`:

```json
{
  "name": "我的风格",
  "description": "这是一个自定义风格",
  "systemPrompt": "格斗游戏AI，你的自定义描述",
  "style": "15-30字，你的风格说明",
  "templates": [
    "开局：@所有人: 你的对话模板",
    "击杀：@被杀者: 你的对话模板"
  ]
}
```

2. 调用重新加载接口:
```bash
curl -X POST http://localhost:3001/api/chat/styles/reload
```

3. 切换到你的风格:
```bash
curl -X POST http://localhost:3001/api/chat/styles/switch \
  -H "Content-Type: application/json" \
  -d '{"styleName": "my-style"}'
```

## 当前可用风格

- **default** (默认): 标准的格斗游戏AI对话风格
- **sexy** (性感撩人): 性感诱惑的对话风格，充满挑逗
- **eros** (涩涩风格): 更加色气湿滑的对话风格，充满暗示

## 使用示例

### 使用curl切换风格

```bash
# 切换到涩涩风格
curl -X POST http://localhost:3001/api/chat/styles/switch \
  -H "Content-Type: application/json" \
  -d '{"styleName": "eros"}'

# 查看当前风格
curl http://localhost:3001/api/chat/styles/current

# 查看所有风格
curl http://localhost:3001/api/chat/styles
```

### 使用JavaScript/TypeScript

```typescript
// 切换风格
const response = await fetch('http://localhost:3001/api/chat/styles/switch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ styleName: 'eros' })
});
const data = await response.json();
console.log(data.message); // "已切换到风格: eros"

// 生成对话时会使用当前风格
const chatResponse = await fetch('http://localhost:3001/api/chat/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameState: {...} })
});
```

## 注意事项

1. 风格文件必须是有效的JSON格式
2. `templates` 数组中的每一项格式为 "场景：@对象: 内容"
3. 不能删除 `default` 风格,它是后备默认风格
4. 修改风格文件后需要调用 `/api/chat/styles/reload` 重新加载
5. 风格切换会影响所有后续的对话生成请求
