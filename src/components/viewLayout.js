import React, { useCallback, useState, useRef,useLayoutEffect, useEffect } from "react";

import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls,
  MarkerType
} from "reactflow";
import viewNode from "./viewNode";
import ELK from 'elkjs/lib/elk.bundled.js';
import "reactflow/dist/style.css";
import "../styles.css";
import { RxCross1 } from "react-icons/rx";

const nodeTypes = {
  selectorNode: viewNode
};

const nodeWidth = 225;
const nodeHeight = 450;

const elk = new ELK();
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.layered.crossingMinimization.forceNodeModelOrder':true
};
let finalSortedArray = [];
const recurseWorkflow = async (nodes, taskId) => {
  let task = nodes.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  finalSortedArray.push(task);
  let nextApprovedTaskIds = task.data.NextAction.APPROVED.length > 0 ? task.data.NextAction.APPROVED : [];
  let nextREJECTEDTaskIds = task.data.NextAction.REJECTED.length > 0 ? task.data.NextAction.REJECTED : [];
  if (nextApprovedTaskIds.length > 0) {
    nextApprovedTaskIds.forEach(async nextTaskId => {
      await recurseWorkflow(nodes, nextTaskId);
    });
  }
  if (nextREJECTEDTaskIds.length > 0) {
    nextREJECTEDTaskIds.forEach(async nextTaskId => {
      await recurseWorkflow(nodes, nextTaskId);
    });
  }
};

const nodeSortValueSetting = async(nodes) =>{
  await recurseWorkflow(nodes, "0");
  return finalSortedArray
}

const getLayoutedElements = async(nodes, edges, options = {}) => {
  let newNode = await nodeSortValueSetting(nodes);
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: newNode.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: nodeWidth,
      height: nodeHeight,
    })),
    edges: edges,
  };
  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
      
    }))
    .catch(console.error);
};


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

const workflowToNodesEdges = (workflowJson,setDataForDetail,grouplist) => {
  let tempNodes = [];
  let tempEdges = [];
  workflowJson.forEach((data, index) => {
    data.grouplist = grouplist;
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
      animated: false,
      style: {
        strokeWidth: 2,
        stroke: '#8abf8c',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#8abf8c',
      },
    };
    tempEdges.push(edgeAP);
    let edgere = {
      id: data.taskId.toString() + '-' + data.NextAction.REJECTED.toString(),
      source: data.taskId.toString(),
      target: data.NextAction.REJECTED.toString(),
      type: ConnectionLineType.SmoothStep,
      sourceHandle: "b",
      animated: false,
      style: {
        strokeWidth: 2,
        stroke: '#cf5151',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#cf5151',
      },
    };
    tempEdges.push(edgere);
  });
  tempEdges = tempEdges.filter((x) => {
    return x.target !== "";
  });
  return { nodes: tempNodes, edges: tempEdges };
}


const LayoutFlow = (workflowJson) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [dataForDetail,setdataForDetail] = useState(null);
  //const { fitView } = useReactFlow();
  const [grouplist,setgrouplist] = useState([]);
  //console.log(workflowJson.grouplist)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onLayout = useCallback(
    ({ direction }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const { nodes: tempNodes1, edges: tempEdges1 } = workflowToNodesEdges(workflowJson.workflowJson,setdataForDetail,grouplist);
      const ns = tempNodes1
      const es = tempEdges1

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      });
    },
    [nodes, edges,grouplist]
  );
  
   useLayoutEffect(() => {
    finalSortedArray=[];
    onLayout({ direction: 'DOWN' });
  }, [grouplist]);
  useEffect(() => {
    setgrouplist(workflowJson.grouplist)
    //onLayout({ direction: 'DOWN' });
  },[])

  useEffect(() => {
    function handleClickOutside(event) {
      const yourDiv = document.getElementById("viewdetailDiv");
      if (yourDiv && !yourDiv.contains(event.target)) {
        setdataForDetail(null);
      }
    }
  
    function handleScroll(event) {
      setdataForDetail(null);
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);
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
                id = 'viewdetailDiv'
                style={{
                    position:'fixed',
                    border:'1px solid #bababa',
                    borderRadius:'10px', 
                    backgroundColor:'#fff',
                    top:'20%',
                    left:'20%',
                    width:'fit-content',
                    height:'fit-content',
                    minWidth:'200px',
                    minHeight:'200px',
                    zIndex:'999',
                    display:'sticky',
                    flexDirection:'column',
                    overflowY:'scroll',
                    padding:'15px',
                    justifyItems:'center',
                    }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      paddingBottom: "2px",
                    }}
                    onClick={() => {
                      setdataForDetail(null);
                    }}
                  >
                  <RxCross1 size="17" />
                </div>
                <div style={{padding:'0px 3%'}}>
                  <div style={{whiteSpace:'nowrap'}}>Task ID: {dataForDetail?.taskId}</div>
                  <div style={{whiteSpace:'nowrap'}}>Name: {dataForDetail?.name}</div>
                  <div style={{whiteSpace:'nowrap'}}>Method: {dataForDetail?.method}</div>
                  <div style={{whiteSpace:'nowrap'}}>
                    Approver:
                  {
                    typeof(dataForDetail?.approver) =='string'&&
                    //dataForDetail?.approver
                    (grouplist.filter((item)=>{return item.value.toString() === dataForDetail?.approver.toString()})[0]?.label || 'group id not found')
                  }
                  </div>
                </div>
                <div style={{padding:'0px 3%',display:'flex',borderRadius:'10px',flexDirection:'row',gap:'10px',flexWrap:'wrap',justifyContent:'center' }}>
                {
                typeof(dataForDetail?.approver) !='string'&&
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
                        <div style={{width:'20px',height:'20px',backgroundColor:'#fffb80',border:'1px solid #8f8f8f'}}>
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
                <Controls />
            </ReactFlow>
            </div>
        </ReactFlowProvider>
    </div>
    </>
  );
};

export default LayoutFlow;
