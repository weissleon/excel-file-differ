const {
  createDirectoryIfNotAlreadyExists,
  checkIfFileExists,
} = require("../src/fs-handler");

const testRun = async () => {
  const result = await checkIfFileExists("package.json");
  console.log(result);
};

testRun();
