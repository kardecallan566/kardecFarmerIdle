const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Keep NativeWind virtual CSS modules enabled so Metro can patch their
  // SHA-1 handling during headless web export.
  forceWriteFileSystem: false,
});
