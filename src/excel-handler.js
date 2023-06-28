const Xlsx = require("xlsx");

class ExcelWorkbook {
  #workbook = null;

  constructor(filePath) {
    this.#workbook = Xlsx.readFile(filePath);
    console.log(this.#workbook.Sheets["Sheet1"]);
  }
}

module.exports = { ExcelWorkbook };
