// Uses HA's own overview and area cards. Native strategy APIs may change on upgrade.
const AREA_STRATEGY_TAG = "home-area-view-strategy";

function toMasonry(view) {
  // Empty-state views already use a panel and should keep their native actions.
  if (!view.sections) return view;

  const { sections, max_columns, dense_section_placement, ...rest } = view;
  const cards = sections.flatMap((section) => {
    if (section.strategy || section.sections) {
      throw new Error("原生区域页结构已变化，请更新 native-home-masonry.js");
    }
    const content = (section.cards || []).filter(
      (card) => card.type !== "heading" || card.heading || card.badges?.length
    );
    if (!content.length) return [];

    const heading = content[0].type === "heading" ? content[0] : undefined;
    const items = heading ? content.slice(1) : content;
    const group = [];
    if (heading) group.push(heading);
    if (items.length) {
      group.push({ type: "grid", columns: 2, square: false, cards: items });
    }
    return [{ type: "vertical-stack", cards: group }];
  });
  return { ...rest, type: "masonry", cards };
}

class NativeHomeMasonryDashboard extends HTMLElement {
  static registryDependencies = ["areas", "floors"];

  static async generate(config, hass) {
    const areas = Object.values(hass.areas);
    const { type, ...overviewOptions } = config;
    return {
      title: "首页",
      views: [
        {
          title: "全部",
          path: "overview",
          icon: "mdi:home",
          strategy: { ...overviewOptions, type: "home-overview" },
        },
        // HA lazy-loads native strategies. This hidden view loads the original
        // area generator through HA's own versioned module loader.
        ...(areas.length
          ? [{
              title: "原生区域模板",
              path: "native-area-template",
              visible: false,
              subview: true,
              strategy: { type: "home-area", area: areas[0].area_id },
            }]
          : []),
        ...areas.map((area) => ({
          title: area.name,
          path: `areas-${area.area_id}`,
          subview: true,
          strategy: {
            type: "custom:native-home-masonry-area",
            area: area.area_id,
          },
        })),
        {
          title: "媒体播放器",
          path: "media-players",
          subview: true,
          strategy: { type: "home-media-players" },
        },
        {
          title: "其他设备",
          path: "other-devices",
          subview: true,
          strategy: { type: "home-other-devices" },
        },
      ],
    };
  }
}

class NativeHomeMasonryArea extends HTMLElement {
  static registryDependencies = ["entities", "devices", "areas", "panels"];

  static async generate(config, hass) {
    // The dashboard starts the native template view before the custom area views.
    let timer;
    try {
      await Promise.race([
        customElements.whenDefined(AREA_STRATEGY_TAG),
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("原生区域策略未加载，请确认 HA 支持 home-area 策略")),
            15000
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
    const native = customElements.get(AREA_STRATEGY_TAG);
    const view = await native.generate({ type: "home-area", area: config.area }, hass);
    return toMasonry(view);
  }
}

customElements.define("ll-strategy-native-home-masonry", NativeHomeMasonryDashboard);
customElements.define("ll-strategy-native-home-masonry-area", NativeHomeMasonryArea);
