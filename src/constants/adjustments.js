export const adjustmentConfigs = [
  {
    key: "brightness",
    label: "Brightness",
    unit: "%",
    min: 50,
    max: 150,
    defaultValue: 100,
  },
  {
    key: "contrast",
    label: "Contrast",
    unit: "%",
    min: 50,
    max: 150,
    defaultValue: 100,
  },
  {
    key: "saturation",
    label: "Saturation",
    unit: "%",
    min: 50,
    max: 150,
    defaultValue: 100,
  },
  { key: "hue", label: "Hue", unit: "°", min: -180, max: 180, defaultValue: 0 },
  {
    key: "sharpness",
    label: "Sharpness",
    unit: "",
    min: -100,
    max: 100,
    defaultValue: 0,
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "",
    min: -100,
    max: 100,
    defaultValue: 0,
  },
  {
    key: "tint",
    label: "Tint",
    unit: "",
    min: -100,
    max: 100,
    defaultValue: 0,
  },
];

export const initialAdjustments = adjustmentConfigs.reduce((acc, config) => {
  acc[config.key] = config.defaultValue;
  return acc;
}, {});
