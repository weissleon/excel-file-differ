const {
  showWelcomeMessage,
  showGetExcelFilePathDialog,
} = require("./src/ui-handler");
const { ExcelWorkbook } = require("./src/excel-handler");

const OUT_DIR = "./out";

const run = async () => {
  showWelcomeMessage();

  const originalFilePath = await showGetExcelFilePathDialog(
    "Please specify the original file path"
  );

  const targetFilePath = await showGetExcelFilePathDialog(
    "Please specify the target file path"
  );

  const originalWb = await new ExcelWorkbook().readFromFile(originalFilePath);
  const targetWb = await new ExcelWorkbook().readFromFile(targetFilePath);

  const [wbWithNewData, wbWithDeletedData] = ExcelWorkbook.diff(
    originalWb,
    targetWb
  );

  await wbWithNewData.writeToFile(OUT_DIR);
  await wbWithDeletedData.writeToFile(OUT_DIR);
};

run();
