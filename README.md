# Home Assistant 智能家居自动化配置

模块化的 Home Assistant 自动化配置集合，覆盖灯光控制、温度管理、离家/回家模式、婴儿护理、宠物监控、天气提醒等场景。

## 项目结构

```
├── configuration.yaml.example   # 主配置示例
├── secrets.yaml.example         # 密钥模板
├── automations/                 # 自动化规则
│   ├── alert.yaml               # 天气提醒（雨雪）
│   ├── baby_feeding.yaml        # 婴儿喂养与换尿布记录
│   ├── device_air_purifier.yaml # 书房空气净化器
│   ├── device_cat_litter.yaml   # 猫砂盆监控
│   ├── device_fan.yaml          # 主卧风扇调速
│   ├── hass.yaml                # 系统维护（主题/备份/清理）
│   ├── home_state_control.yaml  # 离家/回家模式
│   ├── light_entrance.yaml      # 玄关灯光
│   ├── light_kitchen.yaml       # 厨房灯光
│   ├── light_living.yaml        # 客厅灯光（无线开关）
│   ├── light_nnleaf.yaml        # 书房 nnleaf 灯光
│   └── light_wash.yaml          # 卫生间灯光
├── packages/                    # 设备 + 自动化 + Helpers 集成包
│   ├── baby_feeding.yaml        # 婴儿护理 Helpers 与模板传感器
│   ├── climate_master.yaml      # 主卧空调与风扇
│   └── climate_baby.yaml        # 次卧（婴儿房）空调
├── scripts/                     # 可复用脚本
│   ├── claw.yaml                # Claw (OpenClaw) 自然语言任务执行
│   ├── serverchan.yaml          # Server酱 消息推送
│   └── xiaoai.yaml              # 小爱音箱 TTS 播报与指令执行
├── templates/                   # 模板实体
│   ├── binary_sensor.yaml       # 门状态、在家状态、空气质量
│   ├── sensor.yaml              # 自定义传感器（预留）
│   └── trigger.yaml             # 客厅人在检测（摄像头 AI）
├── inputs/                      # input_number / input_text
│   ├── air_purifier.yaml        # 空气净化器播报日期记录
│   └── nnleaf_light.yaml        # nnleaf 亮度模式状态
├── rest_commands/               # REST API 命令
│   ├── claw.yaml                # Claw Chat Completions API
│   └── serverchan.yaml          # Server酱 推送 API
└── lovelace/                    # 仪表盘面板
    ├── baby_feeding_panel.yaml  # 婴儿护理面板
    └── climate_control_panel.yaml # 环境温度控制面板
```

## 使用方法

### 1. 主配置文件

将 [configuration.yaml.example](configuration.yaml.example) 中的配置合并到你的 `configuration.yaml`：

```yaml
# 包含所有 input_number 配置
input_number: !include_dir_merge_named inputs/

# 包含所有 automation 配置
automation: !include_dir_list automations/

# 包含所有 script 配置
script: !include_dir_list scripts/

# 包含所有 rest_command 配置
rest_command: !include_dir_merge_named rest_commands/

# 包含所有 template 配置
template: !include_dir_merge_list templates/

# 婴儿护理 Package（需放在 homeassistant.packages 下）
homeassistant:
  packages:
    baby_feeding: !include packages/baby_feeding.yaml
```

### 2. 配置密钥

```bash
cp secrets.yaml.example secrets.yaml
```

编辑 `secrets.yaml`，填入：

| 密钥 | 用途 |
|------|------|
| `serverchan_token` | Server酱 API Token，用于天气提醒、喂奶提醒等推送 |
| `claw_token` | Claw OpenClaw API Bearer Token，用于猫砂盆提醒等微信消息 |

### 3. 重启 Home Assistant

配置完成后重启 Home Assistant 使配置生效。

## 自动化功能

### 灯光控制

| 区域 | 功能 | 触发方式 |
|------|------|----------|
| 玄关 | 回家自动开灯（氛围灯+筒灯+客厅灯带） | 回家状态 + 时间段 |
| 玄关 | 移动检测开灯 | 领普人体传感器3 |
| 玄关 | 无移动15分钟关筒灯，25分钟关氛围灯 | 传感器无移动时长 |
| 客厅 | 无线开关单击切换4组设备 | 领普 KS1Pro 无线开关 |
| 客厅 | 按键1双击切换灯1模式（月光/休闲/会客） | 无线开关双击事件 |
| 厨房 | 玄关无人30分钟 + 灯开启25分钟 → 关灯 | 传感器 + 灯状态 |
| 卫生间 | 移动检测渐进调亮（婴儿友好：暖色温+低亮度） | 领普人体传感器2 |
| 卫生间 | 无移动300秒调低至8%，600秒关灯（白天）或降至5% | 传感器无移动时长 |
| 书房 | nnleaf 单击切换开关，双击循环亮度模式（橙色4档） | 无线开关 |

### 环境控制

| 房间 | 功能 | 说明 |
|------|------|------|
| 主卧 | 室温 >29°C 开空调，<28°C 关空调 | 22:00-07:30，有人在家 |
| 主卧 | 动态调风速（≥31°C 高风 → <29°C 自动风） | 每5分钟检查 |
| 主卧 | 风扇温度调速（26°C 起调，21:00-08:00） | 独立于空调运行 |
| 主卧 | 离家10分钟关闭空调+风扇，回家5分钟开风扇 | 受 home_state 控制 |
| 次卧 | 室温 >28°C 开空调（cool 27°C），<26°C 关空调 | 全天候，婴儿房 |
| 次卧 | 动态调风速（≥30°C 高风 → <28°C 自动风） | 每5分钟检查 |
| 书房 | 空气质量优/良30分钟自动关净化器 | 污染时自动开 + 小爱播报 |

### 场景模式

| 模式 | 行为 |
|------|------|
| 离家 | home_state 变为 off 持续5分钟 → 批量关闭所有灯光自动化 |
| 回家 | home_state 变为 on 持续30秒 → 批量开启所有灯光自动化 |

### 婴儿护理

- 喂奶记录：一键记录奶量，累加今日总量，自动写入 Logbook
- 换尿布记录：选择类型（干/湿/便便/干+便便），一键记录
- 喂奶间隔提醒：超过设定小时数（07:00-23:00）通过 Server酱推送
- 每日零点自动重置奶量统计
- 记录按钮防抖：避免重复点击

### 宠物监控

| 设备 | 提醒 | 推送方式 |
|------|------|----------|
| 小佩猫砂盆 MAX2 | 垃圾箱满 4 小时未清理 | Claw → 微信群 |
| 小佩猫砂盆 MAX2 | 猫砂余量 <6kg | Claw → 微信群 |

### 提醒与通知

| 提醒 | 时间 | 推送方式 |
|------|------|----------|
| 雨雪天气 | 每天 08:00 | Server酱 |

### 系统维护

| 任务 | 时间 | 说明 |
|------|------|------|
| 初始化 | 系统启动 | 设置 Metro Red 主题 |
| 清理日志 | 每天 04:00 | 清理传感器高频日志，保留 3 天 |
| 清理数据库 | 每天 03:00 | 保留 30 天数据，执行 repack |
| 配置备份 | 每周一 02:00 | 自动创建压缩备份 |
| 清理旧备份 | 每天 02:30 | 删除超过 30 天的备份，保留最近 4 个 |

## 模板实体

| 实体 | 用途 |
|------|------|
| `binary_sensor.door_state` | 基于小米门磁事件的门开关状态 |
| `binary_sensor.home_state` | 结合门状态 + 原始传感器的在家判断（秒级响应） |
| `binary_sensor.study_air_quality_good` | 书房空气质量优/良/轻度污染判定 |
| `binary_sensor.living_room_presence` | 客厅摄像头 AI 人形检测，5 分钟无事件自动关闭 |

## 脚本

| 脚本 | 用途 |
|------|------|
| `script.serverchan_push` | Server酱 推送消息（title + content） |
| `script.claw_execute` | Claw 自然语言任务执行（如微信发消息） |
| `script.xiaoai_speak` | 小爱音箱 TTS 语音播报 |
| `script.xiaoai_execute` | 小爱音箱文本指令执行（如"打开客厅灯"） |

## 仪表盘面板

- **婴儿护理面板** — 喂奶/换尿布记录操作面板，含 24h 喂养间隔图表
- **环境温度控制面板** — 主卧/次卧自动化开关，空调风扇状态，24h 温度趋势图
