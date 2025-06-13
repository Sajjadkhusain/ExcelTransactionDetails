import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Transactiondetails.css";
import "font-awesome/css/font-awesome.min.css";

const parseDate = (str) => {
  const [dd, mm, yyyy] = str.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
};

const formatDateTime = (value) => {
  if (!value) return "";

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return value;
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(date.d)}-${pad(date.m)}-${date.y} ${pad(date.H)}:${pad(
      date.M
    )}:${pad(date.S)}`;
  }

  const date = new Date(value);
  if (isNaN(date)) return value;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
};

const Transactiondetails = () => {
  const [excelData, setExcelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

      const headersIndex = jsonData.findIndex(
        (row) => row.includes("Sl No") && row.includes("Date")
      );

      const rows = jsonData
        .slice(headersIndex + 1)
        .filter((row) => row.length >= 7);

      const normalizedData = rows.map((row) => ({
        "Sl No": row[0],
        "SRC No": row[1],
        Scheme: row[2],
        "Avail Type": row[3],
        Date: formatDateTime(row[4]),
        "Wheat (Kgs)": row[5],
        "FRice (Kgs)": row[6],
        Portability: row[7],
      }));

      setExcelData(normalizedData);
      setFilteredData(normalizedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const filterData = (text, from, to, scheme) => {
    const filtered = excelData.filter((row) => {
      const matchText = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(text.toLowerCase());

      const dateStr = row["Date"].slice(0, 10);
      const date = parseDate(dateStr);

      const matchFrom = from ? date >= new Date(from) : true;
      const matchTo = to ? date <= new Date(to) : true;

      const matchScheme = scheme
        ? row["Scheme"].toLowerCase() === scheme.toLowerCase()
        : true;

      return matchText && matchFrom && matchTo && matchScheme;
    });
    filtered.sort((a, b) => {
      const dateA = parseDate(a["Date"].slice(0, 10));
      const dateB = parseDate(b["Date"].slice(0, 10));
      return dateA - dateB;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    filterData(value, fromDate, toDate, filterScheme);
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    filterData(searchText, value, toDate, filterScheme);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    filterData(searchText, fromDate, value, filterScheme);
  };

  const handleSchemeFilter = (e) => {
    const value = e.target.value;
    setFilterScheme(value);
    filterData(searchText, fromDate, toDate, value);
  };

  const handleDownload = () => {
    const totals = filteredData.reduce(
      (totals, row) => {
        const wheat = parseFloat(row["Wheat (Kgs)"]) || 0;
        const frice = parseFloat(row["FRice (Kgs)"]) || 0;
        return {
          wheat: totals.wheat + wheat,
          frice: totals.frice + frice,
        };
      },
      { wheat: 0, frice: 0 }
    );

    const dataWithTotal = [
      ...filteredData,
      {
        "Sl No": "",
        "SRC No": "",
        Scheme: "",
        "Avail Type": "",
        Date: "",
        "Wheat (Kgs)": `Total: ${totals.wheat.toFixed(2)}`,
        "FRice (Kgs)": `Total: ${totals.frice.toFixed(2)}`,
        Portability: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(dataWithTotal);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "FilteredData_with_Total.xlsx");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const calculateTotals = () => {
    return filteredData.reduce(
      (totals, row) => {
        const wheat = parseFloat(row["Wheat (Kgs)"]) || 0;
        const frice = parseFloat(row["FRice (Kgs)"]) || 0;
        return {
          wheat: totals.wheat + wheat,
          frice: totals.frice + frice,
        };
      },
      { wheat: 0, frice: 0 }
    );
  };
  const handlePrint = () => {
    const printContent = document.getElementById("printable-table").innerHTML;

    const { wheat, frice } = calculateTotals();

    const totalsHtml = `
    <div style="margin-top: 20px; font-weight: bold; text-align: right;">
      Total Wheat (Kgs): ${wheat.toFixed(2)} &nbsp; | &nbsp;
      Total FRice (Kgs): ${frice.toFixed(2)}
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
        ${totalsHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="container text-center card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          fontFamily: "sans-serif",
          position: "relative",
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
          Transaction Details for FPS
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <label
            htmlFor="uploadExcel"
            style={{
              borderRadius: "50%",
              backgroundColor: "#50698d",
              color: "#fff",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
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
              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            disabled={filteredData.length === 0}
          >
            <i className="bi bi-download"></i>
          </button>
          <button
            onClick={handlePrint}
            className="btn"
            title="Print"
            style={{
              borderRadius: "50%",
              backgroundColor: "#50698d",
              color: "#fff",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 0,
            }}
          >
            <i className="fa fa-print" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div className="row align-items-center mt-3 gx-2 justify-content-center">
        <div className="col-md-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            className="form-control"
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="form-control"
          />
        </div>

        <div className="col-md-1 text-center">
          <span className="fw-bold">TO</span>
        </div>

        <div className="col-md-2">
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            className="form-control"
          />
        </div>

        <div className="col-md-2">
          <select
            value={filterScheme}
            onChange={handleSchemeFilter}
            className="form-control"
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
      <div className="card mt-4" id="printable-table">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th>Sl No</th>
                <th>SRC No</th>
                <th>Scheme</th>
                <th>Avail Type</th>
                <th>Date</th>
                <th>Wheat (Kgs)</th>
                <th>FRice (Kgs)</th>
                <th>Portability</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row["Sl No"]}</td>
                    <td>{row["SRC No"]}</td>
                    <td>{row["Scheme"]}</td>
                    <td>{row["Avail Type"]}</td>
                    <td>{row["Date"]}</td>
                    <td>{row["Wheat (Kgs)"]}</td>
                    <td>{row["FRice (Kgs)"]}</td>
                    <td>{row["Portability"]}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
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
          {totalPages > 1 && (
            <div
              className="pagination-container"
              style={{ padding: "15px", textAlign: "center" }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
                style={{ marginRight: "5px" }}
              >
                &lt; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && page - arr[index - 1] > 1 && (
                      <span
                        className="pagination-ellipsis"
                        style={{ margin: "0 5px" }}
                      >
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`pagination-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                      style={{
                        marginRight: "5px",
                        padding: "5px 10px",
                        backgroundColor:
                          currentPage === page ? "#50698d" : "#f8f9fa",

                        color: currentPage === page ? "#fff" : "#000",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, fontWeight: "bold", textAlign: "right" }}>
        {(() => {
          const { wheat, frice } = calculateTotals();
          return (
            <div>
              Total Wheat (Kgs): {wheat.toFixed(2)} &nbsp; | &nbsp; Total FRice
              (Kgs): {frice.toFixed(2)}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Transactiondetails;
