import React, { useState } from "react";
import "./Stock.css";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const StockRajester = () => {
  const [formData, setFormData] = useState({
    shopkeeperName: "",
    machineNumber: "",
    villageName: "",
    taluka: "Barshitakli",
    month: "",
    managerName: "",
    contactNumber: "",
    parker: null,
  });

  const [parkerOptions] = useState([
    { value: "phh_wheat", label: "PHH WHEAT" },
    { value: "phh_rice", label: "PHH RICE" },
    { value: "phh_jwari", label: "PHH JWARI" },
    { value: "aay_wheat", label: "AAY WHEAT" },
    { value: "aay_rice", label: "AAY RICE" },
    { value: "aay_jwari", label: "AAY JWARI" },
    { value: "sugar", label: "SUGAR" },
  ]);

  // Table rows state
  const [rows, setRows] = useState([
    {
      id: 1,
      srNo: 1,
      date: "",
      openingBal: "0.00",
      aawak: "0.00",
      total: "0.00",
      sale: "0.00",
      closeBalance: "0.00",
      remark: "",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const formatNumber = (value) => {
    if (value === "" || isNaN(value)) return "0.00";
    const num = parseFloat(value);
    return num.toFixed(2);
  };

  const handleInputChange = (id, field, value) => {
    if (["openingBal", "aawak", "sale"].includes(field)) {
      if (value.includes(".") && value.split(".")[1].length > 2) {
        value = parseFloat(value).toFixed(2);
      }
    }

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        if (field === "openingBal" || field === "aawak") {
          const opening = parseFloat(updatedRow.openingBal) || 0;
          const aawak = parseFloat(updatedRow.aawak) || 0;
          updatedRow.total = (opening + aawak).toFixed(2);
        }

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

  const handleParkerChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, parker: selectedOption }));
  };

  const handleRowSubmit = (id) => {
    const currentRow = rows.find((row) => row.id === id);

    if (!currentRow.date || !currentRow.openingBal) {
      toast.success("Please Enter Date fields!", {
        className: "custom-toast",
        progressClassName: "custom-progress",
        icon: (
          <span
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#ffff",
              color: "#50698d",
              textAlign: "center",
              lineHeight: "24px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ✔
          </span>
        ),
      });
      // alert("Please fill in Date and Opening Balance fields");
      return;
    }

    setEditingId(null);

    const nextOpeningBal = currentRow.closeBalance || "0.00";

    setRows([
      ...rows,
      {
        id: rows.length + 1,
        srNo: rows.length + 1,
        date: "",
        openingBal: nextOpeningBal,
        aawak: "0.00",
        total: nextOpeningBal,
        sale: "0.00",
        closeBalance: nextOpeningBal,
        remark: "",
      },
    ]);
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

  const handlePrint1 = () => {
    if (rows.length === 0) {
      toast.success("No Data To Print!", {
        className: "custom-toast",
        progressClassName: "custom-progress",
        icon: (
          <span
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#ffff",
              color: "#50698d",
              textAlign: "center",
              lineHeight: "24px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ✔
          </span>
        ),
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const printContent = `
      <div style="margin-bottom: 20px; text-align: center;">
        <h2 style="margin-bottom: 15px;">स्टॉक रजिस्टर अहवाल</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div style="text-align: left;">
            <p style="margin: 2px 0;"><strong>रास्तभाव दुकानदाराचे नाव:</strong> ${
              formData.shopkeeperName || "N/A"
            }</p>
            <p style="margin: 2px 0;"><strong>गाव:</strong> ${
              formData.villageName || "N/A"
            }</p>
            <p style="margin: 2px 0;"><strong>धान्याचे प्रकार:</strong> ${
              formData.parker ? formData.parker.label : "N/A"
            }</p>
          </div>
          <div style="text-align: left;">
            <p style="margin: 2px 0;"><strong>पॉस मशीन न:</strong> ${
              formData.machineNumber || "N/A"
            }</p>
            <p style="margin: 2px 0;"><strong>तालुका:</strong> ${
              formData.taluka || "N/A"
            }</p>
            <p style="margin: 2px 0;"><strong>महिना:</strong> ${
              formData.month || "N/A"
            }</p>
          </div>
        </div>
      </div>

      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; margin-bottom: 20px;">
        <thead>
          <tr>
           <th>अनुक्रमांक</th>
            <th>दिनांक</th>
            <th>पूर्वीची शिल्लक</th>
            <th>आवक</th>
            <th>एकूण</th>
            <th>विक्री</th>
            <th>शिल्लक</th>
            <th>शेरा</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td>${row.srNo}</td>
              <td>${formatDateToDDMMYYYY(row.date) || "-"}</td>
              <td>${formatNumber(row.openingBal)}</td>
              <td>${formatNumber(row.aawak)}</td>
              <td>${formatNumber(row.total)}</td>
              <td>${formatNumber(row.sale)}</td>
              <td>${formatNumber(row.closeBalance)}</td>
              <td>${row.remark || "-"}</td>
            </tr>
          `
            )
            .join("")}
          <tr style="font-weight: bold;">
            <td colspan="2">एकूण</td>
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

    const printWindow = window.open("", "PRINT", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Register Report</title>
         <style>
          @page {
            margin: 20mm;
            @bottom-center {
              content: "पृष्ठ क्रमांक: " counter(page) " / " counter(pages);
              font-size: 12px;
              font-family: Arial, sans-serif;
            }
          }

            body {
              font-family: Arial, sans-serif;
              padding: 10mm;
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

            h2, h3 {
              color: #50698d;
              margin-top: 0;
            }
          </style>

        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const handlePrint = () => {
    if (rows.length === 0) {
      alert("No data to print");
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const printContent = `
    <div style="margin-bottom: 20px; text-align: center;">
      <h2 style="margin-bottom: 15px;">स्टॉक रजिस्टर अहवाल</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <div style="text-align: left;">
          <p style="margin: 2px 0;"><strong>रास्तभाव दुकानदाराचे नाव:</strong> ${
            formData.shopkeeperName || "N/A"
          }</p>
          <p style="margin: 2px 0;"><strong>गाव:</strong> ${
            formData.villageName || "N/A"
          }</p>
          <p style="margin: 2px 0;"><strong>धान्याचे प्रकार:</strong> ${
            formData.parker ? formData.parker.label : "N/A"
          }</p>
        </div>
        <div style="text-align: left;">
          <p style="margin: 2px 0;"><strong>पॉस मशीन न:</strong> ${
            formData.machineNumber || "N/A"
          }</p>
          <p style="margin: 2px 0;"><strong>तालुका:</strong> ${
            formData.taluka || "N/A"
          }</p>
          <p style="margin: 2px 0;"><strong>महिना:</strong> ${
            formData.month || "N/A"
          }</p>
        </div>
      </div>
    </div>

    <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; margin-bottom: 20px;">
      <thead>
        <tr>
         <th>अनुक्रमांक</th>
          <th>दिनांक</th>
          <th>पूर्वीची शिल्लक</th>
          <th>आवक</th>
          <th>एकूण</th>
          <th>विक्री</th>
          <th>शिल्लक</th>
          <th>शेरा</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${row.srNo}</td>
            <td>${formatDateToDDMMYYYY(row.date) || "-"}</td>
            <td>${formatNumber(row.openingBal)}</td>
            <td>${formatNumber(row.aawak)}</td>
            <td>${formatNumber(row.total)}</td>
            <td>${formatNumber(row.sale)}</td>
            <td>${formatNumber(row.closeBalance)}</td>
            <td>${row.remark || "-"}</td>
          </tr>
        `
          )
          .join("")}
        <tr style="font-weight: bold;">
          <td colspan="2">एकूण</td>
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
         @page {
            margin: 20mm;
            @bottom-center {
              content: "पृष्ठ क्रमांक: " counter(page) " / " counter(pages);
              font-size: 12px;
              font-family: Arial, sans-serif;
            }
          }
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
          h2, h3 {
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
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }, 200);
          }
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    toast.success("Form data saved successfully!", {
      className: "custom-toast",
      progressClassName: "custom-progress",
      icon: (
        <span
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#ffff",
            color: "#50698d",
            textAlign: "center",
            lineHeight: "24px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ✔
        </span>
      ),
    });

    setIsFormSubmitted(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Date formate : 12-June-2025

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${monthName}-${year}`;
  };
  return (
    <>
      <div className="container mainDiv">
        <div className="subDiv">
          <div style={{ width: "80px" }}></div>
          <span className="mainHeading">
            <span style={{ color: "white", fontSize: "2rem" }}>
              {" "}
              STOCK REGISTER
            </span>
          </span>
          {isFormSubmitted ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsFormSubmitted(false)}
                className="btn circleIcon"
                title="Back to list"
              >
                <i className="fa fa-arrow-circle-left" aria-hidden="true"></i>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsFormSubmitted(true)}
                className="btn circleIcon"
                title="Add"
              >
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>

              <button
                onClick={handlePrint}
                className="btn circleIcon"
                disabled={rows.length === 0}
                title="Print"
              >
                <i className="fa fa-print" aria-hidden="true"></i>
              </button>
            </div>
          )}
        </div>
        <div className="ThirdDiv">
          {isFormSubmitted ? (
            <form onSubmit={handleFormSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">
                      Shopkeeper Name (रास्तभाव दुकानदाराचे नाव)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="shopkeeperName"
                      value={formData.shopkeeperName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">
                      Machine Number (पॉस मशीन न)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="machineNumber"
                      value={formData.machineNumber}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">
                      Village Name (गाव)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="villageName"
                      value={formData.villageName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">
                      Taluka (तालुका)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="taluka"
                      value={formData.taluka}
                      onChange={handleFormChange}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">
                      Schemes (धान्याचे प्रकार)
                    </label>
                    <Select
                      value={formData.parker}
                      onChange={handleParkerChange}
                      options={parkerOptions}
                      isSearchable={true}
                      placeholder="Select Scheme..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPlacement="auto" // or "top" to always open on top
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          textAlign: "left",
                          minHeight: "38px",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          textAlign: "left",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          textAlign: "left",
                        }),
                        option: (provided) => ({
                          ...provided,
                          textAlign: "left",
                          color: "#333",
                          backgroundColor: "white",
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                          },
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                          marginBottom: "0px", // Adjust for top placement
                          marginTop: "0px",
                          position: "absolute",
                          bottom: "100%", // Positions menu above the control
                          top: "auto", // Override default top positioning
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          padding: 0,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }),
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="form-group">
                    <label className="form-label lblName">Month (महिना)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="month"
                      value={formData.month}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mb-3 mt-4">
                <button
                  type="button"
                  className="btn"
                  style={{ border: "1px solid #fff", color: "#fff" }}
                  onClick={() => setIsFormSubmitted(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ border: "1px solid #fff", color: "#fff" }}
                >
                  Submit
                </button>
              </div>
            </form>
          ) : (
            <div
              className="scrollable-wrapper"
              style={{ border: "1px solid balck" }}
            >
              <table
                className="table table-bordered table-striped mb-0 scrollable-table"
                style={{ border: "1px solid balck" }}
              >
                <thead className="table-light">
                  <tr>
                    <th
                      style={{ width: "80px" }}
                      className="text-center align-middle headingColor "
                    >
                      Sr No
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Date
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Opening Balance
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Income
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Total
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Sale
                    </th>
                    <th
                      style={{ width: "120px" }}
                      className="text-center align-middle headingColor "
                    >
                      Close Balance
                    </th>
                    <th className="text-center align-middle headingColor ">
                      Remark
                    </th>
                    <th className="text-center align-middle headingColor ">
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
                            required
                          />
                        ) : row.date ? (
                          formatDateToDDMMYYYY(row.date)
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
                            value={row.openingBal}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "openingBal",
                                e.target.value
                              )
                            }
                            required
                          />
                        ) : (
                          formatNumber(row.openingBal)
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
                        ) : (
                          formatNumber(row.aawak)
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {formatNumber(row.total)}
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
                        ) : (
                          formatNumber(row.sale)
                        )}
                      </td>
                      <td className="text-center align-middle">
                        {formatNumber(row.closeBalance)}
                      </td>
                      <td className="align-middle">
                        {editingId === row.id ? (
                          <input
                            className="form-control form-control-sm"
                            type="text"
                            value={row.remark}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "remark",
                                e.target.value
                              )
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
                              onClick={() => handleRowSubmit(row.id)}
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
                                style={{ color: "#6e5c5c", fontSize: "18px" }}
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
                              style={{ color: "#6e5c5c", fontSize: "18px" }}
                            ></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td
                      className="text-center align-middle headingColor "
                      colSpan="2"
                    >
                      Totals
                    </td>
                    <td className="text-center align-middle headingColor ">
                      {formatNumber(totals.openingBal)}
                    </td>
                    <td className="text-center align-middle headingColor ">
                      {formatNumber(totals.aawak)}
                    </td>
                    <td className="text-center align-middle headingColor ">
                      {formatNumber(totals.total)}
                    </td>
                    <td className="text-center align-middle headingColor ">
                      {formatNumber(totals.sale)}
                    </td>
                    <td className="text-center align-middle headingColor ">
                      {formatNumber(totals.closeBalance)}
                    </td>

                    <td
                      className="text-center align-middle headingColor "
                      colSpan="2"
                    ></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <div className="mt-3"></div>
        </div>
      </div>
    </>
  );
};

export default StockRajester;
