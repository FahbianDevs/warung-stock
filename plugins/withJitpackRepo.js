const { withProjectBuildGradle } = require("@expo/config-plugins");

function ensureJitpackInAllprojectsRepositories(buildGradle) {
  if (buildGradle.includes("https://www.jitpack.io")) return buildGradle;

  const repoLine = "maven { url 'https://www.jitpack.io' }";

  // Try to inject into existing allprojects { repositories { ... } } block
  const allprojectsReposRe =
    /allprojects\s*\{\s*repositories\s*\{\s*([\s\S]*?)\s*\}\s*\}/m;
  const match = buildGradle.match(allprojectsReposRe);
  if (match) {
    const body = match[1];
    const injectedBody = `${body}\n        ${repoLine}`;
    return buildGradle.replace(match[0], match[0].replace(body, injectedBody));
  }

  // Fallback: append a new allprojects repositories block at the end
  return (
    buildGradle +
    `\n\nallprojects {\n  repositories {\n    mavenCentral()\n    google()\n    ${repoLine}\n  }\n}\n`
  );
}

module.exports = function withJitpackRepo(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") return config;
    config.modResults.contents = ensureJitpackInAllprojectsRepositories(
      config.modResults.contents
    );
    return config;
  });
};

