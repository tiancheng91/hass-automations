# HASS 项目设备与配置参考

## 空调设备

### 主卧空调
- **entity_id**: `climate.090615_cn_proxy_681594875_00003_ktf`
- 自动化仅做 turn_on/turn_off，不设置 hvac_mode/温度

### 次卧空调（婴儿房）
- **entity_id**: `climate.090615_cn_proxy_681594875_00002_ktf`
- **friendly_name**: 次卧空调 空调
- **hvac_modes**: cool, heat, fan_only, dry, off
- **fan_modes**: 自动, 低风, 中风, 高风
- **min_temp**: 16 / **max_temp**: 32 / **target_temp_step**: 1
- **supported_features**: 393
- 自动化会设置 hvac_mode=cool、temperature=27、fan_mode=自动，并根据温差动态调风速

### 客厅空调
- **entity_id**: `climate.090615_cn_proxy_681594875_00004_ktf`
- 无独立自动化开关；每30分钟在空调开启时维持目标温度（10:00-21:00 为28°C，其它时间为29°C）、fan_mode=自动

## 辅助实体

### input_boolean.hass_mode
- **名称**: HASS 自动化总开关
- 定义在 `inputs/hass_mode.yaml`
- 所有自动化（temp.yaml 等）均受此开关控制，关闭时自动化不触发

### 风扇
- **主卧风扇 entity_id**: `fan.dmaker_cn_659430584_p5c_s_2_fan`
