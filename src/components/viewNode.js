import React, { memo,useEffect } from "react";
import { 
  Handle, 
  Position
} from "reactflow";

export default memo(({ data, isConnectable }) => {
  console.log('data: ', data)
  const [backgroundColor, setBackgroundColor] = React.useState('#fff');

  useEffect(() => {
    if(data.status === 'APPROVED'){
      setBackgroundColor('#ceeddb');
    }else if(data.status === 'REJECTED'){
      setBackgroundColor('#edcece');
    }else if(data.status === 'PENDING' && data.taskAvailable === true){
      setBackgroundColor('#e6edce');
    }
    else {
      setBackgroundColor('#fff');
    }
  }, []);

  return (
    <>
      <div style={{borderRadius:'10px',border:'1px solid #bababa',background:backgroundColor,padding:'15px 5px'}}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "#555", width: "15px", height: '15px', marginTop: '-10px', borderRadius: '0px' }}
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={false}
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
            <div style={{ border:"1px solid #bababa",padding: '0px 0px 0px 5px',borderRadius:'5px',backgroundColor:'white'}}>{data.taskId}</div>
          </div>
          <div style={{ width: "200px" }}>
            <label>Name:</label>
            <div style={{ border:"1px solid #bababa",padding: '0px 0px 0px 5px',borderRadius:'5px',backgroundColor:'white'}}>{data.name}</div>
          </div>
          <div style={{ width: "200px" }}>
            <label>Method:</label>
            <div style={{ border:"1px solid #bababa",padding: '0px 0px 0px 5px',borderRadius:'5px',backgroundColor:'white'}}>{data.method}</div>
          </div>
          <div style={{ width: "200px" }}>
            <label>Status:</label>
            <div style={{ border:"1px solid #bababa",padding: '0px 0px 0px 5px',borderRadius:'5px',backgroundColor:'white'}}>{data.status}</div>
          </div>
          <div style={{ width: "200px" }}>
              <button style={{ padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white',width:'100%',height:"30px"}} onClick={() => data.viewDetail(data)}>
                View
              </button>
          </div>
          <div style={{ width: "200px" }}>
            <label>Next Action:</label>
            {
              <div
                style={{
                  width: "200px",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ borderRadius:'5px',border: "1px solid #bababa", width: "90px",textAlign:"center",backgroundColor:'white' }}>
                  Approved
                </div>
                <div style={{ borderRadius:'5px',border: "1px solid #bababa", width: "90px",textAlign:"center",backgroundColor:'white' }}>
                  Rejected
                </div>
              </div>
            }
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          style={{ background: "#555", width: "15px", height: '15px', marginBottom: '-8px', Bottom: 10, left: 70, borderRadius: '0px' }}
          isConnectable = {false}
        />


        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{ background: "#555", width: "15px", height: '15px', marginBottom: '-8px', Bottom: 10, left: 180, borderRadius: '0px' }}
          isConnectable={false}
        />

      </div>
    </>
  );
});
