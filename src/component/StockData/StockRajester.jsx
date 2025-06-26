import React, { useState, useEffect } from "react";
import "./Stock.css";
import Select from "react-select";
function StockRajester() {
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    shopkeeperName: "",
    machineNumber: "",
    villageName: "",
    taluka: "Barshitakli", // Default value
    parker: null,
    month: "",
    date: "",
    openingBalance: "",
    aawak: "",
    total: "",
    sale: "",
    closeBalance: "",
    remark: "",
  });

  const [parkerOptions] = useState([
    { value: "phh_wheat", label: "PHH WHEAT" },
    { value: "phh_rice ", label: "PHH RICE" },
    { value: "phh_jwari", label: "PHH JWARI" },
    { value: "aay_wheat", label: "AAY WHEAT" },
    { value: "aay_rice", label: "AAY RICE" },
    { value: "aay_jwari", label: "AAY JWARI" },
    { value: "sugar", label: "SUGAR" },
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem("stockRegisterEntries");
    if (savedData) {
      setEntries(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("stockRegisterEntries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const opening = parseFloat(formData.openingBalance) || 0;
    const aawak = parseFloat(formData.aawak) || 0;
    const total = (opening + aawak).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      total: total === "0.00" ? "" : total,
    }));
  }, [formData.openingBalance, formData.aawak]);

  useEffect(() => {
    const total = parseFloat(formData.total) || 0;
    const sale = parseFloat(formData.sale) || 0;
    const closeBalance = (total - sale).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      closeBalance: closeBalance === "0.00" ? "" : closeBalance,
    }));
  }, [formData.total, formData.sale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value && !isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value).toFixed(2),
      }));
    }
  };

  const handleParkerChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, parker: selectedOption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      ...formData,
      // Convert parker object to string for display
      parker: formData.parker ? formData.parker.label : "",
    };

    if (editingIndex !== null) {
      // Update existing entry
      const updatedEntries = [...entries];
      updatedEntries[editingIndex] = newEntry;
      setEntries(updatedEntries);
    } else {
      // Add new entry
      setEntries([...entries, newEntry]);
    }

    // Reset form
    setFormData({
      shopkeeperName: "",
      machineNumber: "",
      villageName: "",
      taluka: "Barshitakli",
      parker: null,
      month: "",
      date: "",
      openingBalance:
        entries.length > 0 ? entries[entries.length - 1].closeBalance : "",
      aawak: "",
      total: "",
      sale: "",
      closeBalance: "",
      remark: "",
    });

    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index) => {
    const entryToEdit = entries[index];
    const parkerOption = parkerOptions.find(
      (option) => option.label === entryToEdit.parker
    );

    setFormData({
      ...entryToEdit,
      parker: parkerOption || null,
    });

    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    if (editingIndex === index) {
      setEditingIndex(null);
      setShowForm(false);
    }
  };

  const handleAdd = () => {
    const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;

    setFormData((prev) => ({
      ...prev,
      openingBalance: lastEntry ? lastEntry.closeBalance : "",
      shopkeeperName: "",
      machineNumber: "",
      villageName: "",
      taluka: "Barshitakli",
      parker: null,
      month: "",
      date: "",
      aawak: "",
      total: "",
      sale: "",
      closeBalance: "",
      remark: "",
    }));

    setShowForm(true);
    setEditingIndex(null);
  };

  // const handlePrint = () => {
  //   if (entries.length === 0) return;

  //   const printContent = `
  //     <table border="1" cellspacing="0" cellpadding="5" style="width: 100%;">
  //       <thead>
  //         <tr>
  //           <th>No.</th>
  //           <th>Shopkeeper</th>
  //           <th>Machine No</th>
  //           <th>Village</th>
  //           <th>Date</th>
  //           <th>Opening Bal</th>
  //           <th>Close Bal</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         ${entries
  //           .map(
  //             (entry, index) => `
  //           <tr>
  //             <td>${index + 1}</td>
  //             <td>${entry.shopkeeperName}</td>
  //             <td>${entry.machineNumber}</td>
  //             <td>${entry.villageName}</td>
  //             <td>${entry.date}</td>
  //             <td>${entry.openingBalance}</td>
  //             <td>${entry.closeBalance}</td>
  //           </tr>
  //         `
  //           )
  //           .join("")}
  //       </tbody>
  //     </table>
  //     <div style="margin-top: 20px; text-align: right; font-weight: bold;">
  //       Total Records: ${entries.length}
  //     </div>
  //   `;

  //   const printWindow = window.open("", "", "width=900,height=700");
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Stock Register</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; padding: 20px; }
  //           table { width: 100%; border-collapse: collapse; }
  //           th, td { border: 1px solid #000; padding: 8px; text-align: center; }
  //           th { background-color: #f2f2f2; }
  //         </style>
  //       </head>
  //       <body>
  //         <h2 style="text-align: center;">Stock Register Report</h2>
  //         ${printContent}
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  //   printWindow.close();
  // };
  const handlePrint = () => {
    if (entries.length === 0) return;

    // Get current date for the report header
    const currentDate = new Date().toLocaleDateString();

    // Create print content with enhanced header
    //  //  <p style="margin: 2px 0;"><strong>:</strong> ${currentDate}</p>
    const printContent = `
    <div style="margin-bottom: 20px; text-align: center;">
      <h2 style="margin-bottom: 15px;">Stock Register Report</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <div style="text-align: left;">
          <p style="margin: 2px 0;"><strong>Shopkeeper Name:</strong> ${
            entries[0]?.shopkeeperName || "N/A"
          }</p>
           <p style="margin: 2px 0;"><strong>Village Name:</strong> ${
             entries[0]?.villageName || "N/A"
           }</p>
            <p style="margin: 2px 0;"><strong>Schemes:</strong> ${
              entries[0]?.parker || "N/A"
            }</p>
          
         
        </div>
        <div style="text-align: right;">
         <p style="margin: 2px 0;"><strong>Machine Number:</strong> ${
           entries[0]?.machineNumber || "N/A"
         }</p>

          <p style="margin: 2px 0;"><strong>Taluka:</strong> ${
            entries[0]?.taluka || "N/A"
          }</p>
         
          <p style="margin: 2px 0;"><strong>Month:</strong> ${
            entries[0]?.month || "N/A"
          }</p>
        </div>
      </div>
    </div>

    <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; margin-bottom: 20px;">
      <thead>
        <tr>
          <th>No.</th>
          <th>Date</th>
          <th>Opening Bal</th>
          <th>Aawak</th>
          <th>Total</th>
          <th>Sale</th>
          <th>Close Bal</th>
          <th>Remark</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            (entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry.date || "-"}</td>
            <td>${entry.openingBalance || "0.00"}</td>
            <td>${entry.aawak || "0.00"}</td>
            <td>${entry.total || "0.00"}</td>
            <td>${entry.sale || "0.00"}</td>
            <td>${entry.closeBalance || "0.00"}</td>
            <td>${entry.remark || "-"}</td>
          </tr>
        `
          )
          .join("")}
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
        <div style={{ width: "80px" }}></div>
        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
            textDecoration: "underline",
            textDecorationColor: "#50698d", // Optional: set underline color
            textDecorationThickness: "2px", // Optional: set underline thickness
          }}
        >
          Stock Register
        </span>
        {showForm ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingIndex(null);
              }}
              className="btn"
              // disabled={currentItems.length === 0}
              title="Add"
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
              <i className="fa fa-arrow-circle-left" aria-hidden="true"></i>
            </button>
          </div>
        ) : (
          ""
        )}

        {!showForm ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleAdd}
              className="btn"
              // disabled={currentItems.length === 0}
              title="Add"
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
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>

            <button
              onClick={handlePrint}
              className="btn"
              // disabled={currentItems.length === 0}
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
        ) : (
          ""
        )}
      </div>
      {showForm ? (
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Row 1 */}
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Shopkeeper Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shopkeeperName"
                    value={formData.shopkeeperName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Machine Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="machineNumber"
                    value={formData.machineNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Village Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="villageName"
                    value={formData.villageName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Taluka</label>
                  <input
                    type="text"
                    className="form-control"
                    name="taluka"
                    value={formData.taluka}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Parker</label>
                  {/* <Select
                    value={formData.parker}
                    onChange={handleParkerChange}
                    options={parkerOptions}
                    isSearchable={true}
                    placeholder="Select Parker..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                  /> */}

                  <Select
                    value={formData.parker}
                    onChange={handleParkerChange}
                    options={parkerOptions}
                    isSearchable={true}
                    placeholder="Select Parker..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      singleValue: (provided) => ({
                        ...provided,
                        textAlign: "left", // Left-align selected value
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        textAlign: "left", // Left-align placeholder
                      }),
                      option: (provided) => ({
                        ...provided,
                        textAlign: "left", // Left-align dropdown options
                      }),
                      control: (provided) => ({
                        ...provided,
                        textAlign: "left", // Left-align text in control
                      }),
                    }}
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Month</label>
                  <input
                    type="text"
                    className="form-control"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Opening Balance</label>
                  <input
                    type="text"
                    className="form-control"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleNumberChange}
                    onBlur={handleBlur}
                    inputMode="decimal"
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Aawak</label>
                  <input
                    type="text"
                    className="form-control"
                    name="aawak"
                    value={formData.aawak}
                    onChange={handleNumberChange}
                    onBlur={handleBlur}
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Total</label>
                  <input
                    type="text"
                    className="form-control"
                    name="total"
                    disabled
                    value={formData.total}
                    inputMode="decimal"
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Sale</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sale"
                    value={formData.sale}
                    onChange={handleNumberChange}
                    onBlur={handleBlur}
                    inputMode="decimal"
                  />
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Close Balance</label>
                  <input
                    type="text"
                    className="form-control"
                    name="closeBalance"
                    value={formData.closeBalance}
                    onChange={handleNumberChange}
                    onBlur={handleBlur}
                    inputMode="decimal"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Remark Textarea */}
            <div className="row">
              <div className="col-md-12 mb-3">
                <div className="form-group">
                  <label className="form-label lblName">Remark</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-center gap-2 mb-3">
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "#50698d", color: "#fff" }}
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn "
                style={{ backgroundColor: "#50698d", color: "#fff" }}
              >
                {editingIndex !== null ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card mt-4" id="printable-table">
          <div className="card-body p-0">
            <table className="table table-bordered table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th className="headerColor">Sr No</th>
                  {/*<th className="headerColor">Shopkeeper</th>
                  <th className="headerColor">Machine No</th>
                  <th className="headerColor">Village Name</th>
                  <th className="headerColor">Taluka</th>
                  <th className="headerColor">Parker</th>
                  <th className="headerColor">Month</th> */}
                  <th className="headerColor">Date</th>
                  <th className="headerColor">Opening Bal</th>
                  <th className="headerColor">Aawak</th>
                  <th className="headerColor">Total</th>
                  <th className="headerColor">Sale</th>
                  <th className="headerColor">Close Balance</th>
                  <th className="headerColor">Remark</th>
                  <th className="headerColor">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((entry, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* <td>{entry.shopkeeperName}</td>
                      <td>{entry.machineNumber}</td>
                      <td>{entry.villageName}</td>
                      <td>{entry.taluka}</td>
                      <td>{entry.parker}</td>
                      <td>{entry.month}</td> */}
                      <td>{entry.date}</td>
                      <td>{entry.openingBalance}</td>
                      <td>{entry.aawak}</td>
                      <td>{entry.total}</td>
                      <td>{entry.sale}</td>
                      <td>{entry.closeBalance}</td>
                      <td>{entry.remark}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(index)}
                          className="btn btn-sm btn-primary me-2"
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockRajester;
