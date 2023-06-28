const { configData, configDataKeys } = require("./config-handler");

const showWelcomeMessage = () => {
  const name = configData[configDataKeys.name];
  const version = configData[configDataKeys.version];
  console.log(`Welcome to ${name} v${version}`);
};

module.exports = {
  showWelcomeMessage,
};
