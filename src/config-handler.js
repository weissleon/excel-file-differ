const CONFIG_FILE_PATH = "./config.yaml";

const configDataKeys = {
  name: "name",
  version: "version",
};

const loadConfigData = () => {
  const yaml = require("js-yaml");
  const fs = require("fs");
  const rawConfigData = fs.readFileSync(CONFIG_FILE_PATH, {
    encoding: "utf-8",
  });
  const configData = yaml.load(rawConfigData);

  return configData;
};

module.exports = {
  configData: loadConfigData(),
  configDataKeys,
};
