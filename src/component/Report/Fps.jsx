import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Fps.css";
import "font-awesome/css/font-awesome.min.css";

const Fps = () => {
  const [excelData, setExcelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterScheme, setFilterScheme] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !(file instanceof Blob)) {
      alert("Please upload a valid Excel file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      let currentScheme = "";
      const dataRows = [];

      let currentRow = null;
      let currentNames = [];

      jsonData.forEach((row) => {
        // Detect scheme name rows
        if (typeof row[0] === "string" && row[0].startsWith("Scheme Name")) {
          const match = row[0].match(/Scheme Name\s*:\s*(.*?)\s*(\[|$)/);
          if (match) {
            currentScheme = match[1].trim();
          }
        }
        // Main row with S.No (new group starts)
        else if (typeof row[0] === "number" && row.length >= 7) {
          // If previous group exists, push the parent with count
          if (currentRow && currentNames.length > 0) {
            dataRows.push({
              ...currentRow,
              "Name Count": currentNames.length,
            });
          }

          // Start new group
          currentRow = {
            "S.No": row[0],
            "Ration Card No": row[1],
            "Member Name(in Eng)": row[6]?.toString().trim() || "",
            Scheme: currentScheme,
          };

          currentNames = [];

          if (row[6]) {
            currentNames.push(row[6].toString().trim());
          }
        }

        // Sub-rows with only additional member names
        else if (!row[0] && row.length >= 7) {
          const name = row[6]?.toString().trim();
          if (name) {
            currentNames.push(name);
          }
        }
      });

      // Push the last group
      if (currentRow && currentNames.length > 0) {
        dataRows.push({
          ...currentRow,
          "Name Count": currentNames.length,
        });
      }

      setExcelData(dataRows);
      setFilteredData(dataRows);
      setSearchText("");
      setFilterScheme("");
      setCurrentPage(1);
    };

    reader.readAsArrayBuffer(file);
  };

  const filterData = (text, scheme) => {
    const filtered = excelData.filter((row) => {
      const matchesText = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(text.toLowerCase());

      const matchesScheme = scheme === "" || row.Scheme === scheme;

      return matchesText && matchesScheme;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    filterData(value, filterScheme);
  };

  const handleSchemeFilter = (e) => {
    const scheme = e.target.value;
    setFilterScheme(scheme);
    filterData(searchText, scheme);
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);

    const totalRowIndex = filteredData.length + 1;
    const targetCell = `C${totalRowIndex + 1}`;

    // Add leading spaces for visual indent (Excel respects these)
    const indent = "     "; // ~5 spaces
    const totalText = `${indent}Total Members: ${filteredData.length}`;

    ws[targetCell] = {
      t: "s",
      v: totalText,
    };

    // Update range to include the new row
    const range = XLSX.utils.decode_range(ws["!ref"]);
    range.e.r = totalRowIndex;
    ws["!ref"] = XLSX.utils.encode_range(range);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "FilteredData.xlsx");
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-table").innerHTML;
    const totalRowHtml = `
    <div style="margin-top: 20px; text-align: right; font-weight: bold;">
      Total Members: ${filteredData.length}
    </div>
  `;

    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
    <html>
      <head>
        <title>Transaction Details</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center;">Transaction Details</h2>
        ${printContent}
        ${totalRowHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container text-center card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <div style={{ width: "80px" }}></div>
        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
          }}
        >
          FPS - D1
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <label
            htmlFor="uploadExcel"
            style={{
              borderRadius: "50%",
              backgroundColor: "#50698d",
              color: "#fff",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            title="Upload Excel"
          >
            <i className="fa fa-upload" aria-hidden="true"></i>
            <input
              id="uploadExcel"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={handleDownload}
            className="btn"
            title="Download"
            style={{
              borderRadius: "50%",
              backgroundColor: filteredData.length === 0 ? "#ccc" : "#50698d",
              color: "#fff",
              cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            disabled={filteredData.length === 0}
          >
            <i className="fa fa-download"></i>
          </button>
          <button
            onClick={handlePrint}
            className="btn"
            title="Print"
            style={{
              borderRadius: "50%",
              backgroundColor: filteredData.length === 0 ? "#ccc" : "#50698d",
              color: "#fff",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
            }}
            disabled={filteredData.length === 0}
          >
            <i className="fa fa-print" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6 d-flex align-items-center gap-2">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-white">
              <i className="fa fa-search text-muted" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              className="form-control custom-search-input"
            />
          </div>
          <div className="dropdown-wrapper" style={{ minWidth: "250px" }}>
            <select
              value={filterScheme}
              onChange={handleSchemeFilter}
              className="form-control custom-dropdown"
            >
              <option value="">All Schemes</option>
              {Array.from(new Set(excelData.map((row) => row["Scheme"])))
                .filter(Boolean)
                .map((scheme, index) => (
                  <option key={index} value={scheme}>
                    {scheme}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card mt-4" id="printable-table">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th className="headerColor">S.No</th>
                <th className="headerColor">Ration Card No</th>
                <th className="headerColor">Member Name</th>
                <th className="headerColor">Family Member Count</th>
                <th className="headerColor">Scheme</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row["S.No"]}</td>
                    <td>{row["Ration Card No"]}</td>
                    <td>{row["Member Name(in Eng)"]}</td>
                    <td>{row["Name Count"]}</td>
                    <td>{row["Scheme"]}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    No Record Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length > 0 && (
        <div className="pagination-controls my-3 d-flex justify-content-between align-items-center px-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>
            {(() => {
              const totalPages = Math.ceil(filteredData.length / itemsPerPage);
              let startPage = Math.max(currentPage - 1, 1);
              let endPage = startPage + 2;

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(endPage - 2, 1);
              }

              const pageButtons = [];

              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <button
                    key={i}
                    className={`btn ${
                      currentPage === i ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setCurrentPage(i)}
                    style={{
                      marginRight: "5px",
                      padding: "5px 10px",
                      backgroundColor:
                        currentPage === i ? "#50698d" : "#f8f9fa",
                      color: currentPage === i ? "#fff" : "#000",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {i}
                  </button>
                );
              }
              return (
                <>
                  {pageButtons}
                  {endPage < totalPages && (
                    <span
                      className="pagination-ellipsis"
                      style={{ margin: "0 5px" }}
                    >
                      ...
                    </span>
                  )}
                </>
              );
            })()}
            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(filteredData.length / itemsPerPage)
                    ? prev + 1
                    : prev
                )
              }
              disabled={
                currentPage === Math.ceil(filteredData.length / itemsPerPage)
              }
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
      <div className="text-end mt-3 mb-2">
        <span className="badge-custom">
          Total Members: {filteredData.length}
        </span>
      </div>
    </div>
  );
};

export default Fps;
