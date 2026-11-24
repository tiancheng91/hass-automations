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
# 按类型加载辅助输入，避免将 input_text 当成 input_number
input_number: !include inputs/nnleaf_light.yaml
input_text: !include inputs/air_purifier.yaml

# 包含所有 automation 配置
automation: !include_dir_merge_list automations/

# 包含所有 script 配置
script: !include_dir_merge_named scripts/

# 包含所有 rest_command 配置
rest_command: !include_dir_merge_named rest_commands/

# 包含所有 template 配置
template: !include_dir_merge_list templates/

# 婴儿护理 Package（需放在 homeassistant.packages 下）
homeassistant:
  packages:
    baby_feeding: !include packages/baby_feeding.yaml
    camera_monitor: !include packages/camera_monitor.yaml
    home_lighting: !include packages/home_lighting.yaml
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
| 配置备份 | 每周一 02:00 | 调用 `backup.create_automatic`，使用系统备份设置 |
| 清理旧备份 | 由备份管理器执行 | 按备份界面设置的保留策略清理自动备份 |


### 备份与旧配置迁移

1. 在“设置 → 系统 → 备份”中配置自动备份的内容、位置和保留策略，并保存恢复所需的应急套件。
2. 本仓库保留每周一 02:00 的自动化触发；使用它时关闭备份界面中的额外定时，避免重复备份。
3. 原 `hass_cleanup_backups` 自动化引用的 `python_script.cleanup_backups` 不存在，现已移除。自动备份由备份管理器清理；既有手动备份应在备份页面核对后处理。
4. 实际 `configuration.yaml` 也需按上面的示例修改 include：自动化合并列表，脚本合并字典，inputs 按类型加载。`scripts/xiaoai.yaml` 已定义 `xiaoai_speak`，无需删除净化器中的播报调用。
5. 若修复页面提示 HTTP 配置已迁移，先在“设置 → 系统 → 网络”核对代理等配置，再移除实际 `configuration.yaml` 中的旧 `http:` 块。
6. 部署后先运行 Home Assistant 的配置检查，再重启一次；确认备份成功、脚本存在，以及插件重启提示已消失。

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

- **灯光**（`/home-lighting/rooms`）— 分为「客厅 · 书房」和「玄关 · 厨房 · 卫生间」两组，磁贴标明所属房间。包含 4 个灯具实体和 7 个开关控制的照明回路。客厅米家主灯通过 S1E 左键通断电，接通后显示灯具亮度、颜色和色温控件，面板不提供灯具自身的软开关；书房灯带、卫生间筒灯组也可直接调光。
- **监控** — 默认播放客厅，点击顶部房间标签可直接切换到书房小方、次卧或阳台小方，每次显示一路。右栏需要 HACS 前端卡片 auto-entities 和 button-card，以 Metro 风格磁贴优先显示视频流和存储卡状态，每个房间最多显示六项摘要；card-mod 统一磁贴间距与活动卡片样式。下方列出最近 24 小时活动，管理员可从「查看设备详情」查看全部实体。将 `packages/camera_monitor.yaml` 和 `lovelace/camera_monitor.yaml` 按目录放入 HA 配置目录，按上例加载 package（已通过 `!include_dir_named packages` 加载的可跳过），检查配置并重启后打开侧栏的「监控」。若手动管理 YAML 前端资源，请将 `/webrtc/webrtc-camera.js` 加入资源列表，类型为 `module`。

- **婴儿护理面板** — 喂奶/换尿布记录操作面板，含 24h 喂养间隔图表
- **环境温度控制面板** — 主卧/次卧自动化开关，空调风扇状态，24h 温度趋势图
