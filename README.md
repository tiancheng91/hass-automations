# Home Assistant 自动化配置

Home Assistant 智能家居自动化配置集合，包含灯光控制、温度管理、离家/回家模式等功能。

## 项目概要

本项目是一个模块化的 Home Assistant 配置项目，通过 YAML 文件组织各种自动化场景，实现智能家居的自动化控制。

## 使用方法

### 1. 配置文件

在 `configuration.yaml` 中添加以下配置：

```yaml
# 包含所有 input_number 配置
input_number: !include_dir_merge_named inputs/

# 包含所有 automation 配置
automation: !include_dir_list automations/

# 包含所有 script 配置
script: !include_dir_list scripts/

# 包含所有 rest_command 配置
rest_command: !include_dir_merge_named rest_commands/

# 包含所有 binary_sensor 配置
binary_sensor: !include_dir_merge_list sensors/
```

### 2. 配置密钥

复制 `secrets.yaml.example` 为 `secrets.yaml`，并配置必要的密钥（如 Server酱 token）：

```bash
cp secrets.yaml.example secrets.yaml
```

**注意**：请确保将 `secrets.yaml` 添加到 `.gitignore` 以避免泄露敏感信息。

### 3. 重启 Home Assistant

配置完成后，重启 Home Assistant 使配置生效。

## 自动化列表

### 灯光控制
- **客厅灯光** - 无线开关控制（单击切换、双击切换模式）
- **玄关灯光** - 人体感应自动开关
- **厨房灯光** - 自动关灯
- **卫生间灯光** - 人体感应自动调节亮度
- **nnleaf 灯光** - 自定义灯光控制

### 环境控制
- **主卧温度** - 根据温度自动开关空调
- **主卧风扇** - 根据回家状态和温度自动控制
- **风扇控制** - 独立风扇自动化

### 场景模式
- **离家模式** - 自动关闭灯光自动化
- **回家模式** - 自动开启灯光自动化

### 提醒服务
- **天气提醒** - 雨雪天气推送提醒（Server酱）

### 系统维护
- **初始化** - 系统启动时设置主题
- **日志清理** - 定期清理日志数据
- **数据库清理** - 定期清理数据库
- **配置备份** - 每周自动备份配置
- **备份清理** - 清理旧备份文件

