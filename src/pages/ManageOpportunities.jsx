import React, { useState } from "react";
import PostInternships from "./PostInternships";
import EditInternships from "./EditInternships";

const ManageOpportunities = () => {
  const [view, setView] = useState("default"); // 'default', 'add', 'edit'
  const [selectedInternship, setSelectedInternship] = useState(null);

  return (
    <div>
      <h1>Manage Opportunities</h1>
      {/* Buttons for switching views */}
      <button onClick={() => setView("add")}>Add</button>
      <button onClick={() => setView("edit")}>Edit</button>

      {/* Conditional Rendering */}
      {view === "add" && <PostInternships />}
      {view === "edit" && (
        <EditInternships internship={selectedInternship} />
      )}
    </div>
  );
};

export default ManageOpportunities;
