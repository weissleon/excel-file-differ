const Xlsx = require("xlsx");

class ExcelWorkbook {
  #workbookName = "";
  #workbook = Xlsx.utils.book_new();
  #currentWorksheet = null;
  #currentWorksheetName = "";

  static diff(originalWb, targetWb) {
    const newWorkbook = Xlsx.utils.book_new();
    const deletedWorkbook = Xlsx.utils.book_new();

    const overlapWorksheetNames = [];
    const deletedWorksheetNames = new Set();
    const newWorksheetNames = new Set(targetWb.getAllSheetNames());

    const originalWorksheetNames = originalWb.getAllSheetNames();
    for (let i = 0; i < originalWorksheetNames.length; i++) {
      const originalWorksheetName = originalWorksheetNames[i];
      if (newWorksheetNames.has(originalWorksheetName)) {
        newWorksheetNames.delete(originalWorksheetName);
        overlapWorksheetNames.push(originalWorksheetName);
      } else {
        deletedWorksheetNames.add(originalWorksheetName);
      }
    }

    for (let i = 0; i < overlapWorksheetNames.length; i++) {
      const overlapworksheetName = overlapWorksheetNames[i];
      const originalData = originalWb
        .changeSheetTo(overlapworksheetName)
        .getAllRowsAsArray();

      const targetData = targetWb
        .changeSheetTo(overlapworksheetName)
        .getAllRowsAsArray();

      const newRows = new Set();
      const deletedRows = new Set();
      let originalRowCursor = 0;
      let targetRowCursor = 0;

      const originalHeader =
        originalData.length > 0
          ? originalData[0].filter((col) => !isValueEmpty(col))
          : [];
      const targetHeader =
        targetData.length > 0
          ? targetData[0].filter((col) => !isValueEmpty(col))
          : [];
      // If the column length does not match, these sheets are considered different
      if (originalHeader.length !== targetHeader.length) {
        deletedWorksheetNames.add(overlapworksheetName);
        newWorksheetNames.add(overlapworksheetName);
        continue;
      }

      // If the columns does not match, these sheets are considered different
      let isColumnIdentical = true;
      for (let j = 0; j < originalHeader.length; j++) {
        const originalCol = originalHeader[j];
        const targetCol = targetHeader[j];
        if (originalCol !== targetCol) {
          isColumnIdentical = false;
          break;
        }
      }
      if (!isColumnIdentical) {
        deletedWorksheetNames.add(overlapworksheetName);
        newWorksheetNames.add(overlapworksheetName);
        continue;
      }

      // Compare each row
      while (
        originalRowCursor < originalData.length &&
        targetRowCursor < targetData.length
      ) {
        const originalRow = originalData[originalRowCursor].filter(
          (cell) => !isValueEmpty(cell)
        );
        const targetRow = targetData[targetRowCursor].filter(
          (cell) => !isValueEmpty(cell)
        );

        let isRowIdentical = true;
        for (let k = 0; k < originalRow.length; k++) {
          const originalCell = originalRow[k];
          const targetCell = targetRow[k];

          if (originalCell !== targetCell) {
            isRowIdentical = false;
            break;
          }
        }

        if (!isRowIdentical) {
          for (let k = 0; k < originalData.length; k++) {
            const originalRowString = originalData[k].join(" ");
            for (const newRow of newRows) {
              const newRowString = newRow.join(" ");
              if (originalRowString !== newRowString) break;
              newRows.delete(newRow);
              isRowIdentical = true;
            }
          }
        }

        if (!isRowIdentical) {
          deletedRows.add(originalRow);
          newRows.add(targetRow);
        }

        originalRowCursor++;
        targetRowCursor++;
      }

      if (originalData.length > targetData.length) {
        for (let k = originalRowCursor; k < originalData.length; k++) {
          deletedRows.add(originalData[k]);
        }
      }
      if (targetData.length > originalData.length) {
        for (let k = targetRowCursor; k < targetData.length; k++) {
          newRows.add(targetData[k]);
        }
      }

      for (const deletedRow of deletedRows) {
        if (newRows.has(deletedRow)) {
          newRows.delete(deletedRow);
          deletedRows.delete(deletedRow);
        }
      }
      Xlsx.utils.book_append_sheet(
        newWorkbook,
        Xlsx.utils.aoa_to_sheet([originalHeader, ...newRows]),
        overlapworksheetName
      );
      Xlsx.utils.book_append_sheet(
        deletedWorkbook,
        Xlsx.utils.aoa_to_sheet([originalHeader, ...deletedRows]),
        overlapworksheetName
      );
    }

    for (const worksheetName of newWorksheetNames) {
      Xlsx.utils.book_append_sheet(
        newWorkbook,
        targetWb.getWorksheet(worksheetName),
        worksheetName
      );
    }
    for (const worksheetName of deletedWorksheetNames) {
      Xlsx.utils.book_append_sheet(
        deletedWorkbook,
        originalWb.getWorksheet(worksheetName),
        worksheetName
      );
    }

    return [
      new ExcelWorkbook().changeWorkbook(
        newWorkbook,
        `${originalWb.getWorkbookName()}_new`
      ),
      new ExcelWorkbook().changeWorkbook(
        deletedWorkbook,
        `${originalWb.getWorkbookName()}_deleted`
      ),
    ];
  }

  constructor(workbookName = "Untitled", worksheetNames = ["Sheet1"]) {
    for (let i = 0; i < worksheetNames.length; i++) {
      const worksheetName = worksheetNames[i];
      const newWorksheet = Xlsx.utils.aoa_to_sheet([[]]);
      Xlsx.utils.book_append_sheet(this.#workbook, newWorksheet, worksheetName);
    }

    this.changeSheetTo(worksheetNames[0]);
    this.#workbookName = workbookName;
  }

  changeWorkbook(workbook, workbookName) {
    this.#workbook = workbook;
    this.#workbookName = workbookName;
    this.#currentWorksheetName = workbook.Sheets[workbook.SheetNames[0]];
    this.#currentWorksheet = this.#workbook.Sheets[this.#currentWorksheetName];

    return this;
  }

  async readFromFile(filePath) {
    const { checkIfFileExists } = require("./fs-handler");
    const fileExists = await checkIfFileExists(filePath);
    if (!fileExists) throw new Error("No such file exists");

    this.#workbook = Xlsx.readFile(filePath);
    const firstSheetName = this.getAllSheetNames()[0];
    this.#currentWorksheet = this.#workbook.Sheets[firstSheetName];

    const path = require("path");
    this.#workbookName = path.basename(filePath, ".xlsx");

    return this;
  }

  changeSheetTo(sheetName) {
    if (!this.getAllSheetNames().includes(sheetName))
      throw new Error("Such sheet does not exist.");
    this.#currentWorksheet = this.#workbook.Sheets[sheetName];
    this.#currentWorksheetName = sheetName;

    return this;
  }

  getCurrentSheetname() {
    return this.#currentWorksheetName;
  }

  getWorkbookName() {
    return this.#workbookName;
  }

  getAllSheetNames() {
    return this.#workbook.SheetNames;
  }

  getWorksheet(worksheetName) {
    return this.#workbook.Sheets[worksheetName];
  }

  getAllRowsAsArray() {
    const rows = Xlsx.utils
      .sheet_to_json(this.#currentWorksheet, { header: 1 })
      .filter((row) => row.length !== 0);
    return rows;
  }

  async writeToFile(directoryPath) {
    const {
      createDirectoryIfNotAlreadyExists,
      joinPath,
    } = require("./fs-handler");

    await createDirectoryIfNotAlreadyExists(directoryPath);
    const outputPath = joinPath(directoryPath, `${this.#workbookName}.xlsx`);

    Xlsx.writeFile(this.#workbook, outputPath);
  }
}

const isValueEmpty = (val) => val === null || val === undefined || val === "";

module.exports = { ExcelWorkbook };
