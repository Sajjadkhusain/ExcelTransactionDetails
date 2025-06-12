import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Transactiondetails.css";
import "font-awesome/css/font-awesome.min.css";

// ✅ Parse dd-mm-yyyy into a Date object
const parseDate = (str) => {
  const [dd, mm, yyyy] = str.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
};

// ✅ Format date like 10-06-2025 11:52:00
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

      const dateStr = row["Date"].slice(0, 10); // "dd-mm-yyyy"
      const date = parseDate(dateStr);

      const matchFrom = from ? date >= new Date(from) : true;
      const matchTo = to ? date <= new Date(to) : true;

      const matchScheme = scheme
        ? row["Scheme"].toLowerCase() === scheme.toLowerCase()
        : true;

      return matchText && matchFrom && matchTo && matchScheme;
    });

    // ✅ Sort by date ascending
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

  return (
    <div className="container text-center card">
      <span
        style={{
          padding: "20px",
          fontFamily: "sans-serif",
          display: "block",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Transaction Details for FPS
      </span>
      <div className="row justify-content-center align-items-center mt-3">
        <div className="col-md-2 mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            className="form-control"
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="form-control"
          />
        </div>
        TO
        <div className="col-md-2 mb-2">
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            className="form-control"
          />
        </div>
        <div className="col-md-2 mb-2">
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
        <div className="col-md-1 mb-2">
          <button
            onClick={handleDownload}
            className="search"
            style={{
              marginLeft: 10,
              backgroundColor: filteredData.length === 0 ? "#ccc" : "",
              cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
            }}
            disabled={filteredData.length === 0}
          >
            Download
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <label htmlFor="uploadExcel" className="custom-file-upload">
            <i className="fa fa-upload" aria-hidden="true"></i> Upload File
          </label>
          <input
            id="uploadExcel"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="card mt-4">
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
                      <span style={{ margin: "0 5px" }}>...</span>
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

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import "./Transactiondetails.css";
// import "font-awesome/css/font-awesome.min.css";

// // ✅ Format date like 10-06-2025 11:52:00
// const formatDateTime = (value) => {
//   if (!value) return "";

//   if (typeof value === "number") {
//     const date = XLSX.SSF.parse_date_code(value);
//     if (!date) return value;
//     const pad = (n) => (n < 10 ? "0" + n : n);
//     return `${pad(date.d)}-${pad(date.m)}-${date.y} ${pad(date.H)}:${pad(
//       date.M
//     )}:${pad(date.S)}`;
//   }

//   const date = new Date(value);
//   if (isNaN(date)) return value;
//   const pad = (n) => (n < 10 ? "0" + n : n);
//   return `${pad(date.getDate())}-${pad(
//     date.getMonth() + 1
//   )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
//     date.getMinutes()
//   )}:${pad(date.getSeconds())}`;
// };

// const Transactiondetails = () => {
//   const [excelData, setExcelData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [filterScheme, setFilterScheme] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 50;

//   //   const handleFileUpload = (e) => {
//   //     const file = e.target.files[0];
//   //     const reader = new FileReader();
//   //     reader.onload = (evt) => {
//   //       const data = new Uint8Array(evt.target.result);
//   //       const workbook = XLSX.read(data, { type: "array" });

//   //       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   //       const jsonData = XLSX.utils.sheet_to_json(sheet, {
//   //         header: 1,
//   //         defval: "",
//   //         blankrows: false,
//   //       });

//   //       const headersIndex = jsonData.findIndex(
//   //         (row) => row.includes("Sl No") && row.includes("Date")
//   //       );

//   //       const headers = jsonData[headersIndex];
//   //       const rows = jsonData
//   //         .slice(headersIndex + 1)
//   //         .filter((row) => row.length >= 7);

//   //       const normalizedData = rows.map((row) => ({
//   //         "Sl No": row[0],
//   //         "SRC No": row[1],
//   //         Scheme: row[2],
//   //         "Avail Type": row[3],
//   //         Date: formatDateTime(row[4]),
//   //         "Wheat (Kgs)": row[5],
//   //         "FRice (Kgs)": row[6],
//   //         Portability: row[7],
//   //       }));

//   //       setExcelData(normalizedData);
//   //       setFilteredData(normalizedData);
//   //     };

//   //     reader.readAsArrayBuffer(file);
//   //   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file || !(file instanceof Blob)) {
//       alert("Please upload a valid Excel file.");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });

//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(sheet, {
//         header: 1,
//         defval: "",
//         blankrows: false,
//       });

//       const headersIndex = jsonData.findIndex(
//         (row) => row.includes("Sl No") && row.includes("Date")
//       );

//       const headers = jsonData[headersIndex];
//       const rows = jsonData
//         .slice(headersIndex + 1)
//         .filter((row) => row.length >= 7);

//       const normalizedData = rows.map((row) => ({
//         "Sl No": row[0],
//         "SRC No": row[1],
//         Scheme: row[2],
//         "Avail Type": row[3],
//         Date: formatDateTime(row[4]),
//         "Wheat (Kgs)": row[5],
//         "FRice (Kgs)": row[6],
//         Portability: row[7],
//       }));

//       setExcelData(normalizedData);
//       setFilteredData(normalizedData);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const filterData = (text, date, scheme) => {
//     const filtered = excelData.filter((row) => {
//       const matchText = Object.values(row)
//         .join(" ")
//         .toLowerCase()
//         .includes(text);
//       const matchDate = date
//         ? row["Date"].slice(6, 10) +
//             "-" +
//             row["Date"].slice(3, 5) +
//             "-" +
//             row["Date"].slice(0, 2) ===
//           date
//         : true;
//       const matchScheme = scheme
//         ? row["Scheme"].toLowerCase() === scheme.toLowerCase()
//         : true;

//       return matchText && matchDate && matchScheme;
//     });

//     setFilteredData(filtered);
//     setCurrentPage(1);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchText(value);
//     filterData(value, filterDate, filterScheme);
//   };

//   const handleDateFilter = (e) => {
//     const value = e.target.value;
//     setFilterDate(value);
//     filterData(searchText, value, filterScheme);
//   };

//   const handleSchemeFilter = (e) => {
//     const value = e.target.value;
//     setFilterScheme(value);
//     filterData(searchText, filterDate, value);
//   };

//   const handleDownload = () => {
//     const totals = filteredData.reduce(
//       (totals, row) => {
//         const wheat = parseFloat(row["Wheat (Kgs)"]) || 0;
//         const frice = parseFloat(row["FRice (Kgs)"]) || 0;
//         return {
//           wheat: totals.wheat + wheat,
//           frice: totals.frice + frice,
//         };
//       },
//       { wheat: 0, frice: 0 }
//     );

//     const dataWithTotal = [
//       ...filteredData,
//       {
//         "Sl No": "",
//         "SRC No": "",
//         Scheme: "",
//         "Avail Type": "",
//         Date: "",
//         "Wheat (Kgs)": `Total: ${totals.wheat.toFixed(2)}`,
//         "FRice (Kgs)": `Total: ${totals.frice.toFixed(2)}`,
//         Portability: "",
//       },
//     ];
//     const ws = XLSX.utils.json_to_sheet(dataWithTotal);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
//     const excelBuffer = XLSX.write(wb, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const data = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
//     saveAs(data, "FilteredData_with_Total.xlsx");
//   };
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const calculateTotals = () => {
//     return filteredData.reduce(
//       (totals, row) => {
//         const wheat = parseFloat(row["Wheat (Kgs)"]) || 0;
//         const frice = parseFloat(row["FRice (Kgs)"]) || 0;
//         return {
//           wheat: totals.wheat + wheat,
//           frice: totals.frice + frice,
//         };
//       },
//       { wheat: 0, frice: 0 }
//     );
//   };
//   return (
//     <>
//       <div className="container text-center card    ">
//         <span
//           style={{
//             padding: "20px",
//             fontFamily: "sans-serif",
//             display: "block",
//             fontSize: "20px",
//             fontWeight: "bold",
//           }}
//         >
//           Transaction Details for FPS
//         </span>
//         <div className="row justify-content-center align-items-center mt-3">
//           <div className="col-md-4 mb-2">
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchText}
//               onChange={handleSearch}
//               className="form-control"
//             />
//           </div>

//           <div className="col-md-2 mb-2">
//             <input
//               type="date"
//               value={filterDate}
//               onChange={handleDateFilter}
//               className="form-control"
//             />
//           </div>

//           <div className="col-md-2 mb-2">
//             <select
//               value={filterScheme}
//               onChange={handleSchemeFilter}
//               className="form-control"
//             >
//               <option value="">All Schemes</option>
//               {Array.from(new Set(excelData.map((row) => row["Scheme"])))
//                 .filter(Boolean)
//                 .map((scheme, index) => (
//                   <option key={index} value={scheme}>
//                     {scheme}
//                   </option>
//                 ))}
//             </select>
//           </div>

//           <div className="col-md-2 mb-2">
//             {/* <button onClick={handleDownload} className="search">
//               Download
//             </button> */}
//             <button
//               onClick={handleDownload}
//               className="search"
//               style={{
//                 marginLeft: 10,
//                 backgroundColor: filteredData.length === 0 ? "#ccc" : "",
//                 cursor: filteredData.length === 0 ? "not-allowed" : "pointer",
//               }}
//               disabled={filteredData.length === 0}
//             >
//               Download
//             </button>
//           </div>

//           <div className="col-md-2 mb-2">
//             <label
//               htmlFor="uploadExcel"
//               style={{ marginLeft: 10 }}
//               className="custom-file-upload"
//             >
//               <i class="fa fa-upload" aria-hidden="true"></i> Upload File
//             </label>
//             <input
//               id="uploadExcel"
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={handleFileUpload}
//             />
//           </div>
//         </div>
//         <div className="card mt-4">
//           <div className="card-body p-0">
//             <table className="table table-bordered table-striped mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th>Sl No</th>
//                   <th>SRC No</th>
//                   <th>Scheme</th>
//                   <th>Avail Type</th>
//                   <th>Date</th>
//                   <th>Wheat (Kgs)</th>
//                   <th>FRice (Kgs)</th>
//                   <th>Portability</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((row, idx) => (
//                     <tr key={idx}>
//                       <td>{row["Sl No"]}</td>
//                       <td>{row["SRC No"]}</td>
//                       <td>{row["Scheme"]}</td>
//                       <td>{row["Avail Type"]}</td>
//                       <td>{row["Date"]}</td>
//                       <td>{row["Wheat (Kgs)"]}</td>
//                       <td>{row["FRice (Kgs)"]}</td>
//                       <td>{row["Portability"]}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       style={{
//                         textAlign: "center",
//                         padding: "20px",
//                         fontSize: "bold",
//                       }}
//                     >
//                       No Record Found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>

//             {/* Pagination Block - Placed outside the table */}
//             {totalPages > 1 && (
//               <div
//                 className="pagination-container"
//                 style={{ padding: "15px", textAlign: "center" }}
//               >
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="pagination-btn"
//                   style={{ marginRight: "5px" }}
//                 >
//                   &lt; Prev
//                 </button>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1)
//                   .filter(
//                     (page) =>
//                       page === 1 ||
//                       page === totalPages ||
//                       (page >= currentPage - 1 && page <= currentPage + 1)
//                   )
//                   .map((page, index, arr) => (
//                     <React.Fragment key={page}>
//                       {index > 0 && page - arr[index - 1] > 1 && (
//                         <span
//                           className="pagination-ellipsis"
//                           style={{ margin: "0 5px" }}
//                         >
//                           ...
//                         </span>
//                       )}
//                       <button
//                         onClick={() => setCurrentPage(page)}
//                         className={`pagination-btn ${
//                           currentPage === page ? "active" : ""
//                         }`}
//                         style={{
//                           marginRight: "5px",
//                           padding: "5px 10px",
//                           backgroundColor:
//                             currentPage === page ? "#50698d" : "#f8f9fa",

//                           color: currentPage === page ? "#fff" : "#000",
//                           border: "1px solid #dee2e6",
//                           borderRadius: "4px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         {page}
//                       </button>
//                     </React.Fragment>
//                   ))}

//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="pagination-btn"
//                 >
//                   Next &gt;
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div style={{ marginTop: 20, fontWeight: "bold", textAlign: "right" }}>
//           {(() => {
//             const { wheat, frice } = calculateTotals();
//             return (
//               <div>
//                 Total Wheat (Kgs): {wheat.toFixed(2)} &nbsp; | &nbsp; Total
//                 FRice (Kgs): {frice.toFixed(2)}
//               </div>
//             );
//           })()}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Transactiondetails;
