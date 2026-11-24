# HASS 项目设备与配置参考

## 空调设备

共用维持逻辑（空调开启时，每30分钟）：
- 温度：白天目标28 / 夜间29（室温<26时强制29）；当前设定偏低则每次+1，达到后不再改
- 风量：白天自动、夜间低风；室温>=29°C 时临时高风
- 无独立房间自动化开关

### 主卧空调
- **entity_id**: `climate.090615_cn_proxy_681594875_00003_ktf`
- 另有：夜间22:00-06:00过热开、离家关空调与风扇、回家开风扇

### 次卧空调（婴儿房）
- **entity_id**: `climate.090615_cn_proxy_681594875_00002_ktf`
- **friendly_name**: 次卧空调 空调
- **hvac_modes**: cool, heat, fan_only, dry, off
- **fan_modes**: 自动, 低风, 中风, 高风
- **min_temp**: 16 / **max_temp**: 32 / **target_temp_step**: 1
- **supported_features**: 393
- 另有：夜间22:00-06:00且室温>30辅助开（cool/27）、离家关空调

### 客厅空调
- **entity_id**: `climate.090615_cn_proxy_681594875_00004_ktf`
- 仅维持逻辑，不自动开关机

## 辅助实体

### input_boolean.hass_mode
- **名称**: HASS 自动化总开关
- 定义在 `inputs/hass_mode.yaml`
- 所有自动化（temp.yaml 等）均受此开关控制，关闭时自动化不触发

### 风扇
- **主卧风扇 entity_id**: `fan.dmaker_cn_659430584_p5c_s_2_fan`
