import React from 'react'
import { useNavigate } from "react-router-dom";

function ManageOpp() {
    const navigate=useNavigate();
  return (
    <div>
        <h1>Manage Opportunities</h1>
        <button onClick={()=>navigate("/post-internships")}>Add</button>
        <button onClick={()=>navigate("/edit-internships")}>Edit</button>
    </div>
  )
}

export default ManageOpp