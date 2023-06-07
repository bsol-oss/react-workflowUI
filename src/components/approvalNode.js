import React, { memo } from "react";
import { Handle, Position } from "reactflow";

export default memo(({ data, isConnectable }) => {

  const [method, setMethod] = React.useState(data.method);
  const [approver, setApprover] = React.useState(data.approver);
  const [taskname, setTaskName] = React.useState(data.name);
  console.log('data: ', data)
  const handleChange = (event) => {
    data.method = event.target.value;
    setMethod(event.target.value);
  };

  const handleApproverChange = (event) => {
    data.approver = event.target.value;
    setApprover(event.target.value);
  }
  const handleNameChange = (event) => {
    data.name = event.target.value;
    setTaskName(event.target.value);
  }
  return (
    <div >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555", width: "15px", height: '15px', marginTop: '-10px', borderRadius: '0px' }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div
        style={{
          width: "250px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          alignItems: "center"
        }}
      >
        <div style={{ width: "200px" }}>
          <label>Task ID:</label>
          <input value={data.taskId} disabled style={{ width: '192px' }} />
        </div>
        <div style={{ width: "200px", paddingBottom: '10px' }}>
          <label>Name:</label>
          <input value={taskname} style={{ width: '192px' }} onChange={(e) => { handleNameChange(e)}} />
        </div>
        <div style={{ width: "200px" }}>
          <label>Method:</label>
          <select value={method} style={{ width: "200px" }} onChange={(e) => handleChange(e)} >
            <option value=""></option>
            <option value="ALL">ALL</option>
            <option value="ONE">ONE</option>
            <option value="MAJORITY">MAJORITY</option>
            <option value="VETTING">VETTING</option>
          </select>
        </div>
        <div style={{ width: "200px", paddingBottom: '10px' }}>
          <label>Approver:</label>
          <select value={approver} style={{ width: '200px' }} onChange={(e) => { handleApproverChange(e)}} >
            <option  value=""></option>
            {
              data.approverOpt.map((item, index) => {
                return <option key={index} value={item}>{item}</option>
              })
            }
          </select>
        </div>
        {
          <div
            style={{
              width: "200px",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div style={{ border: "1px solid #555", width: "90px",textAlign:"center" }}>
              Approved
            </div>
            <div style={{ border: "1px solid #555", width: "90px",textAlign:"center" }}>
              Rejected
            </div>
          </div>
        }
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ background: "#555", width: "15px", height: '15px', marginBottom: '-8px', Bottom: 10, left: 90, borderRadius: '0px' }}
        isConnectable={isConnectable}
      />


      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ background: "#555", width: "15px", height: '15px', marginBottom: '-8px', Bottom: 10, left: 180, borderRadius: '0px' }}
        isConnectable={isConnectable}
      />

    </div>
  );
});
