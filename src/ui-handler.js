const { configData, configDataKeys } = require("./config-handler");
const prompts = require("prompts");
const path = require("path");
const cliProgress = require("cli-progress");
const { checkIfFileExists } = require("./fs-handler");

const showWelcomeMessage = () => {
  const name = configData[configDataKeys.name];
  const version = configData[configDataKeys.version];
  console.log(`Welcome to ${name} v${version}`);
};

const showGetFilePathDialog = async (message, validateCondition = null) => {
  return await showTextInputDialog(message, validateCondition);
};

const showGetExcelFilePathDialog = async (message) => {
  return await showGetFilePathDialog(message, async (filePath) => {
    const fileExists = await checkIfFileExists(filePath);
    if (!fileExists) return "No such file exists";

    const isExcelFile = path.extname(filePath) === ".xlsx";
    if (!isExcelFile) return "This is not an Excel file";

    return true;
  });
};

const showTextInputDialog = async (message, validateCondition = null) => {
  const { input } = await prompts({
    type: "text",
    name: "input",
    message: message,
    validate: validateCondition,
  });

  return input;
};
module.exports = {
  showWelcomeMessage,
  showGetExcelFilePathDialog,
};
