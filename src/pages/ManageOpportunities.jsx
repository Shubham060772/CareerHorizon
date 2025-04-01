import React, { useState } from "react";
import PostInternships from "./PostInternships";
import EditInternships from "./EditInternships";

const ManageOpportunities = () => {
  const [view, setView] = useState("default"); // 'default', 'add', 'edit'
  const [selectedInternship, setSelectedInternship] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Manage Opportunities
      </h1>

      {/* Buttons for switching views */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("add")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300"
        >
          Add Internship
        </button>

        <button
          onClick={() => setView("edit")}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300"
        >
          Edit Internship
        </button>
      </div>

      {/* Conditional Rendering */}
      <div className="mt-6">
        {view === "add" && <PostInternships />}
        {view === "edit" && <EditInternships internship={selectedInternship} />}
      </div>
    </div>
  );
};

export default ManageOpportunities;
