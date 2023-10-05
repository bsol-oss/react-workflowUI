import React, { memo } from "react";
import { 
  Handle, 
  Position
} from "reactflow";

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
      <div style={{borderRadius:'10px',border:'1px solid',background:'#fff',padding:'15px 5px'}}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#555", width: "15px", height: '15px', marginTop: '-10px', borderRadius: '0px' }}
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={isConnectable}
        />
        <div
          style={{
            width: "225px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "center"
          }}
        >
          <div style={{ width: "200px" }}>
            <label>Task ID:</label>
            <input type="text" value={data.taskId} disabled style={{ padding: '0px 0px 0px 5px',width: '100%',height:'25px',borderRadius:'5px',border: "1px solid #555" }} />
          </div>
          <div style={{ width: "200px" }}>
            <label>Name:</label>
            <input type="text" value={taskname} style={{padding: '0px 0px 0px 5px', width: '100%',height:'25px',borderRadius:'5px',border: "1px solid #555" }} onChange={(e) => { handleNameChange(e)}} />
          </div>
          <div style={{ width: "200px" }}>
            <label>Method:</label>
            <select value={method} style={{ width: "100%",height:'25px',borderRadius:'5px',border: "1px solid #555" }} onChange={(e) => handleChange(e)} >
              <option value=""></option>
              <option value="ALL">ALL</option>
              <option value="ONE">ONE</option>
              <option value="MAJORITY">MAJORITY</option>
              <option value="VETTING">VETTING</option>
            </select>
          </div>
          <div style={{ width: "200px", paddingBottom: '10px' }}>
            <label>Approver:</label>
            <select  value={approver} style={{ width: '100%',height:'25px',borderRadius:'5px',border: "1px solid #555" }} onChange={(e) => { handleApproverChange(e)}} >
              <option value=""></option>
              {
                data.approverOpt.map((item, index) => {
                  return <option key={item.label} value={item.value}>{item.label}</option>
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
              <div style={{ borderRadius:'5px',border: "1px solid #555", width: "90px",textAlign:"center" }}>
                Approve
              </div>
              <div style={{ borderRadius:'5px',border: "1px solid #555", width: "90px",textAlign:"center" }}>
                Reject
              </div>
            </div>
          }
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          style={{ background: "#555", width: "15px", height: '15px', marginBottom: '-8px', Bottom: 10, left: 70, borderRadius: '0px' }}
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
