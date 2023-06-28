const fs = require("fs/promises");

const checkIfFileExists = async (filePath) => {
  try {
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const checkIfDirectoryExists = async (directoryPath) => {
  try {
    await fs.readdir(directoryPath, { encoding: "utf-8", recursive: true });
    return true;
  } catch (error) {
    return false;
  }
};

const createDirectory = async (directoryPath) => {
  await fs.mkdir(directoryPath, { recursive: true });
};

const createDirectoryIfNotAlreadyExists = async (directoryPath) => {
  const directoryExists = await checkIfDirectoryExists(directoryPath);
  if (!directoryExists) createDirectory(directoryPath);
};

module.exports = {
  checkIfFileExists,
  createDirectoryIfNotAlreadyExists,
};
