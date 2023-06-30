const fs = require("fs/promises");
const path = require("path");
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

const joinPath = (...paths) => {
  return path.join(...paths);
};

module.exports = {
  checkIfFileExists,
  createDirectoryIfNotAlreadyExists,
  joinPath,
};
