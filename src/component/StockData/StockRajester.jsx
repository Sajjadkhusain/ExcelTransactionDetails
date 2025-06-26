import React, { useState } from "react";
import "./Stock.css";

const StockRajester = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      srNo: 1,
      date: "",
      openingBal: "",
      aawak: "",
      total: "",
      sale: "",
      closeBalance: "",
      remark: "",
    },
  ]);

  const [editingId, setEditingId] = useState(null);

  // Helper function to format numbers to 2 decimal places
  const formatNumber = (value) => {
    if (value === "" || isNaN(value)) return "";
    const num = parseFloat(value);
    return num.toFixed(2);
  };

  const handleInputChange = (id, field, value) => {
    // Limit to 2 decimal places for numeric fields
    if (["openingBal", "aawak", "sale"].includes(field)) {
      if (value.includes(".") && value.split(".")[1].length > 2) {
        value = parseFloat(value).toFixed(2);
      }
    }

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // Auto-calculate total when openingBal or aawak changes
        if (field === "openingBal" || field === "aawak") {
          const opening = parseFloat(updatedRow.openingBal) || 0;
          const aawak = parseFloat(updatedRow.aawak) || 0;
          updatedRow.total = (opening + aawak).toFixed(2);
        }

        // Auto-calculate closeBalance when total or sale changes
        if (field === "total" || field === "sale") {
          const total = parseFloat(updatedRow.total) || 0;
          const sale = parseFloat(updatedRow.sale) || 0;
          updatedRow.closeBalance = (total - sale).toFixed(2);
        }

        return updatedRow;
      }
      return row;
    });

    setRows(updatedRows);
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSubmit = (id) => {
    setEditingId(null);
    const currentRowIndex = rows.findIndex((row) => row.id === id);
    const isLastRow = id === rows[rows.length - 1].id;

    if (
      isLastRow &&
      rows[currentRowIndex].date &&
      rows[currentRowIndex].openingBal
    ) {
      // Get the close balance from current row to use as next row's opening balance
      const nextOpeningBal = rows[currentRowIndex].closeBalance || "0.00";

      setRows([
        ...rows,
        {
          id: rows.length + 1,
          srNo: rows.length + 1,
          date: "",
          openingBal: nextOpeningBal,
          aawak: "",
          total: nextOpeningBal,
          sale: "",
          closeBalance: nextOpeningBal,
          remark: "",
        },
      ]);
    }
  };

  const handleDelete = (id) => {
    const rowIndex = rows.findIndex((row) => row.id === id);
    const updatedRows = rows
      .filter((row) => row.id !== id)
      .map((row, index) => ({ ...row, srNo: index + 1 }));

    if (rowIndex < updatedRows.length && rowIndex > 0) {
      updatedRows[rowIndex].openingBal =
        updatedRows[rowIndex - 1].closeBalance || "0.00";
      updatedRows[rowIndex].total = updatedRows[rowIndex].openingBal;
    }

    setRows(updatedRows);

    if (editingId === id) {
      setEditingId(null);
    }
  };

  // Calculate totals for the summary row
  const calculateTotals = () => {
    const totals = {
      openingBal: 0,
      aawak: 0,
      total: 0,
      sale: 0,
      closeBalance: 0,
    };

    rows.forEach((row) => {
      totals.openingBal += parseFloat(row.openingBal) || 0;
      totals.aawak += parseFloat(row.aawak) || 0;
      totals.total += parseFloat(row.total) || 0;
      totals.sale += parseFloat(row.sale) || 0;
      totals.closeBalance += parseFloat(row.closeBalance) || 0;
    });

    return totals;
  };

  const totals = calculateTotals();

  const handlePrint = () => {
    if (rows.length === 0) return;

    // Get current date for the report header
    const currentDate = new Date().toLocaleDateString();

    // Create print content with enhanced header
    const printContent = `
      <div style="margin-bottom: 20px; text-align: center;">
        <h2 style="margin-bottom: 15px;">Stock Register Report</h2>
        <p style="margin: 2px 0;"><strong>Report Date:</strong> ${currentDate}</p>
      </div>

      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; margin-bottom: 20px;">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Date</th>
            <th>Opening Bal</th>
            <th>Aawak</th>
            <th>Total</th>
            <th>Sale</th>
            <th>Close Balance</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td>${row.srNo}</td>
              <td>${row.date || "-"}</td>
              <td>${row.openingBal ? formatNumber(row.openingBal) : "0.00"}</td>
              <td>${row.aawak ? formatNumber(row.aawak) : "0.00"}</td>
              <td>${row.total ? formatNumber(row.total) : "0.00"}</td>
              <td>${row.sale ? formatNumber(row.sale) : "0.00"}</td>
              <td>${
                row.closeBalance ? formatNumber(row.closeBalance) : "0.00"
              }</td>
              <td>${row.remark || "-"}</td>
            </tr>
          `
            )
            .join("")}
          <tr style="font-weight: bold;">
            <td colspan="2">Totals</td>
            <td>${formatNumber(totals.openingBal)}</td>
            <td>${formatNumber(totals.aawak)}</td>
            <td>${formatNumber(totals.total)}</td>
            <td>${formatNumber(totals.sale)}</td>
            <td>${formatNumber(totals.closeBalance)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    `;

    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Register Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 25px; 
              color: #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: center; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            h2 {
              color: #50698d;
              margin-top: 0;
            }
            @media print {
              body { padding: 0; }
              @page { size: auto; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
            textDecorationColor: "#50698d",
            textDecorationThickness: "2px",
          }}
        >
          Stock Register
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handlePrint}
            className="btn"
            disabled={rows.length === 0}
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
      <div className="card mt-4" id="printable-table">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th className="headerColor text-center align-middle">
                    Sr No
                  </th>
                  <th className="headerColor text-center align-middle">Date</th>
                  <th className="headerColor text-center align-middle">
                    Opening Bal
                  </th>
                  <th className="headerColor text-center align-middle">
                    Aawak
                  </th>
                  <th className="headerColor text-center align-middle">
                    Total
                  </th>
                  <th className="headerColor text-center align-middle">Sale</th>
                  <th className="headerColor text-center align-middle">
                    Close Balance
                  </th>
                  <th className="headerColor text-center align-middle">
                    Remark
                  </th>
                  <th className="headerColor text-center align-middle">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="text-center align-middle">{row.srNo}</td>
                    <td className="align-middle">
                      {editingId === row.id ? (
                        <input
                          className="form-control form-control-sm"
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            handleInputChange(row.id, "date", e.target.value)
                          }
                        />
                      ) : (
                        row.date || "—"
                      )}
                    </td>
                    <td className="align-middle">
                      {editingId === row.id ? (
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          step="0.01"
                          value={row.openingBal}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "openingBal",
                              e.target.value
                            )
                          }
                        />
                      ) : row.openingBal ? (
                        formatNumber(row.openingBal)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="align-middle">
                      {editingId === row.id ? (
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          step="0.01"
                          value={row.aawak}
                          onChange={(e) =>
                            handleInputChange(row.id, "aawak", e.target.value)
                          }
                        />
                      ) : row.aawak ? (
                        formatNumber(row.aawak)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      {row.total ? formatNumber(row.total) : "—"}
                    </td>
                    <td className="align-middle">
                      {editingId === row.id ? (
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          step="0.01"
                          value={row.sale}
                          onChange={(e) =>
                            handleInputChange(row.id, "sale", e.target.value)
                          }
                        />
                      ) : row.sale ? (
                        formatNumber(row.sale)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      {row.closeBalance ? formatNumber(row.closeBalance) : "—"}
                    </td>
                    <td className="align-middle">
                      {editingId === row.id ? (
                        <input
                          className="form-control form-control-sm"
                          type="text"
                          value={row.remark}
                          onChange={(e) =>
                            handleInputChange(row.id, "remark", e.target.value)
                          }
                        />
                      ) : (
                        row.remark || "—"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <div className="d-flex gap-2 justify-content-center">
                        {editingId === row.id ? (
                          <button
                            onClick={() => handleSubmit(row.id)}
                            className="btn btn-sm p-1"
                            title="Save"
                          >
                            <i
                              className="fa fa-save"
                              style={{ color: "#50698d", fontSize: "18px" }}
                            ></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(row.id)}
                            className="btn btn-sm p-1"
                            title="Edit"
                          >
                            <i
                              className="fa fa-edit"
                              style={{ color: "#50698d", fontSize: "18px" }}
                            ></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="btn btn-sm p-1"
                          title="Delete"
                        >
                          <i
                            className="fa fa-trash"
                            style={{ color: "#50698d", fontSize: "18px" }}
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="fw-bold">
                  <td className="text-center align-middle" colSpan="2">
                    Totals
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge bg-primary">
                      {formatNumber(totals.openingBal)}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge bg-primary">
                      {formatNumber(totals.aawak)}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge bg-primary">
                      {formatNumber(totals.total)}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge bg-primary">
                      {formatNumber(totals.sale)}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className="badge bg-primary">
                      {formatNumber(totals.closeBalance)}
                    </span>
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4"></div>
    </div>
  );
};

export default StockRajester;
