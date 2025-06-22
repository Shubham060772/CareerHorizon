import React, { useState } from "react";
import AddHackathon from "./AddHackathon";
import EditHackathons from "./EditHackathons";

const ManageHackathonsPanel = () => {
  const [view, setView] = useState("default"); // 'default', 'add', 'edit'
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Manage Hackathons
      </h1>

      {/* Buttons for switching views */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setView("add")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300"
        >
          Add Hackathon
        </button>

        <button
          onClick={() => setView("edit")}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300"
        >
          Edit Hackathon
        </button>
      </div>

      {/* Conditional Rendering */}
      <div className="mt-6">
        {view === "add" && <AddHackathon />}
        {view === "edit" && <EditHackathons hackathon={selectedHackathon} />}
      </div>
    </div>
  );
};

export default ManageHackathonsPanel;
