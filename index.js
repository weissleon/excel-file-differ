const {
  showWelcomeMessage,
  showGetExcelFilePathDialog,
} = require("./src/ui-handler");
const { ExcelWorkbook } = require("./src/excel-handler");

const run = async () => {
  showWelcomeMessage();

  const originalFilePath = await showGetExcelFilePathDialog(
    "Please specify the original file path"
  );

  const targetFilePath = await showGetExcelFilePathDialog(
    "Please specify the target file path"
  );

  const originalWb = new ExcelWorkbook(originalFilePath);
};

run();
