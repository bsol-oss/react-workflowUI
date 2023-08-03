import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls
} from "reactflow";
import dagre from "dagre";
import viewNode from "./viewNode";

import "reactflow/dist/style.css";
import "../styles.css";
const nodeTypes = {
  selectorNode: viewNode
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeColor = (node) => {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#00BFFF';
  }
};
const nodeWidth = 225;
const nodeHeight = 325;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2
    };

    return node;
  });

  return { nodes, edges };
};


const workflowToNodesEdges = (workflowJson,setDataForDetail) => {
  let tempNodes = [];
  let tempEdges = [];
  workflowJson.forEach((data, index) => {
    data.viewDetail = setDataForDetail;
    let tempNode = {
      id: data.taskId.toString(),
      type: "selectorNode",
      data: data,
      position: { x: 0, y: 0 },
      draggable: true,
    };
    tempNodes.push(tempNode);
    let edgeAP = {
      id: data.taskId.toString() + '-' + data.NextAction.APPROVED.toString(),
      source: data.taskId.toString(),
      target: data.NextAction.APPROVED.toString(),
      type: ConnectionLineType.SmoothStep,
      sourceHandle: "a",
      animated: false
    };
    tempEdges.push(edgeAP);
    let edgere = {
      id: data.taskId.toString() + '-' + data.NextAction.REJECTED.toString(),
      source: data.taskId.toString(),
      target: data.NextAction.REJECTED.toString(),
      type: ConnectionLineType.SmoothStep,
      sourceHandle: "b",
      animated: false
    };
    tempEdges.push(edgere);
  });
  tempEdges = tempEdges.filter((x) => {
    return x.target !== "";
  });
  return { nodes: tempNodes, edges: tempEdges };
}

const ViewLayoutFlow = (workflowJson) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [dataForDetail,setdataForDetail] = useState(null);

  useEffect(()=>{
    console.log('workflowJson: ', workflowJson);
    if(workflowJson.workflowJson === null){
      return;
    }
    const { nodes: tempNodes1, edges: tempEdges1 } = workflowToNodesEdges(workflowJson.workflowJson,setdataForDetail);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      tempNodes1,
      tempEdges1
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  },[])

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: false },
          eds
        )
      ),
    []
  );

  const onLayout = useCallback(
    (direction) => {
      const {
        nodes: layoutedNodes,
        edges: layoutedEdges
      } = getLayoutedElements(nodes, edges, direction);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  const setColor = (status) => {
    if(status === 'APPROVED'){
      return "#ceeddb";
    }
    if(status === 'REJECTED'){
      return "#edcece";
    }
    return "#e6edce";
  }

  return (
    <>
    <div style={{width:'100%',height:'100%'}} id='rootprovider' >
        {
            dataForDetail !== null &&
            <div 
                style={{
                    position:'fixed',
                    border:'1px solid #bababa',
                    borderRadius:'10px', 
                    backgroundColor:'#fff',
                    top:'20%',
                    left:'20%',
                    width:'60%',
                    height:'60%',
                    zIndex:'999',
                    display:'sticky',
                    flexDirection:'column',
                    overflowY:'scroll',
                    padding:'15px',
                    justifyItems:'center',
                    }}>
                <button style={{position:'absolute',right:'5px',top:'5px',width:'50px',height:'25px',color:'white',backgroundColor:'#4c4cef',border:'0px',borderRadius:'5px'}} onClick={()=>{setdataForDetail(null)}}>close</button>
                <div style={{padding:'0px 3%'}}>
                  <div>Task ID: {dataForDetail?.taskId}</div>
                  <div>Name: {dataForDetail?.name}</div>
                  <div>Method: {dataForDetail?.method}</div>
                  <div>Approver:</div>
                  {
                    typeof(dataForDetail?.approver) === 'string' &&
                    <div>
                        <div>{dataForDetail?.approver}</div>
                    </div>
                  }
                </div>
                <div style={{padding:'0px 3%',display:'flex',borderRadius:'10px',flexDirection:'row',gap:'10px',flexWrap:'wrap',justifyContent:'center' }}>
                {
                  (typeof(dataForDetail?.approver) !== 'string') &&
                    dataForDetail?.approver.map((item)=>{
                        return(<>
                        {
                            typeof(item) !== 'string' &&
                            <div style={{
                                backgroundColor: setColor(item.status),
                                border:'1px solid #bababa',
                                padding:'10px',
                                width:'300px',
                                minHeight:'200px',
                                display:'flex',
                                borderRadius:'10px',
                                flexDirection:'column',
                                gap:'5px' 
                              }}>
                                <div>Name: {item.name}</div>
                                <div>Email: {item.email}</div>
                                <div>Status: {item.status}</div>
                                <div>Comment:</div>
                                <div style={{padding:'5px',display:'flex',borderRadius:'10px',flexDirection:'row',gap:'10px',flexWrap:'wrap',justifyContent:'center' }}>
                                  {
                                    item.comment.map((comment)=>{
                                        return(
                                          <div key={comment.name} style={{border:'1px solid #bababa',padding:'5px',display:'flex',borderRadius:'10px',flexDirection:'column',minWidth:'120px',maxWidth:'120px' ,backgroundColor:'white'}}>
                                              <label>Doc:</label>
                                              <div style={{whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:'120px',overflowX:'hidden'}}>{comment.name}</div>
                                              <label>Comment:</label>
                                              <div style={{whiteSpace:'normal'}}>{comment.comment}</div>
                                          </div>
                                        )
                                    })
                                  }
                                </div>
                            </div>
                        }
                        </>)
                    })
                }
                </div>
            </div>
        }
        <ReactFlowProvider style={{width: '100%',height: '100%',fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif'}}>
            <div className="reactflow-wrapper" style={{width:'100%',height:'100%'}} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                onInit={setReactFlowInstance}
                fitView
                onLoad={(instance) => setTimeout(() => instance.fitView(), 0)}
            >
                <Panel style={{display:'flex',gap:'5px'}} position="top-left">
                    <div style={{display:'flex',flexDirection:'column',gap:"3px",padding:'5px',border:'1px solid #8f8f8f',backgroundColor:'white'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <div style={{width:'20px',height:'20px',backgroundColor:'#ceeddb',border:'1px solid #8f8f8f'}}>
                        </div>
                        <div>
                          Approved
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <div style={{width:'20px',height:'20px',backgroundColor:'#edcece',border:'1px solid #8f8f8f'}}>
                        </div>
                        <div>
                          Rejected
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <div style={{width:'20px',height:'20px',backgroundColor:'#e6edce',border:'1px solid #8f8f8f'}}>
                        </div>
                        <div>
                          Pending approval
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <div style={{width:'20px',height:'20px',backgroundColor:'#fff',border:'1px solid #8f8f8f'}}>
                        </div>
                        <div>
                          Not started
                        </div>
                      </div>
                    </div>
                </Panel>
                <Panel style={{display:'flex',gap:'5px'}} position="top-right">
                    <button style={{fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif',padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white'}} onClick={() => onLayout("TB")}>
                    Typesetting
                    </button>
                </Panel>
                <Controls />
            </ReactFlow>
            </div>
        </ReactFlowProvider>
    </div>
    </>
  );
};

export default ViewLayoutFlow;
