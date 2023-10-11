import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls,
  MiniMap
} from "reactflow";
import ELK from 'elkjs/lib/elk.bundled.js';
import ApprovalNode from "./approvalNode";
import "reactflow/dist/style.css";
import "../styles.css";
import Sidebar from "./Sidebar";

const nodeTypes = {
  selectorNode: ApprovalNode
};
const elk = new ELK()
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.layered.crossingMinimization.strategy':'LAYER_SWEEP',
  'elk.layered.crossingMinimization.forceNodeModelOrder':true
};
let finalSortedArray = [];

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
  finalSortedArray=[];
  await recurseWorkflow(nodes, "0");
  return finalSortedArray
}
const nodeWidth = 225;
const nodeHeight = 280;

const getLayoutedElements = async (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  let newNode = await nodeSortValueSetting(nodes);
  
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

const workflowToNodesEdges = (workflowJson,grouparray) => {
  let tempNodes = [];
  let tempEdges = [];
  workflowJson.forEach((data, index) => {
    data.approverOpt = grouparray;
    let tempNode = {
      id: data.taskId.toString(),
      type: "selectorNode",
      data: data,
      position: { x: 0, y: 0 }
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

const LayoutFlow = (workflowJson) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [oldnodes, setOldNodes] = useState([]);
  const [oldedges, setOldEdges] = useState([]);
  const [firstRun, setFirstRun] = useState(true);

  useEffect(()=>{
    if(nodes.length > 0 && firstRun){
      setFirstRun(false);
      onLayout({ direction: 'DOWN' });
    }
  },[nodes])
  useEffect(()=>{
    console.log('workflowJson: ', workflowJson);
    if(workflowJson.workflowJson === null){
      return;
    }
    const { nodes: tempNodes1, edges: tempEdges1 } = workflowToNodesEdges(workflowJson.workflowJson,workflowJson.grouparray);
    setOldNodes(tempNodes1);
    setOldEdges(tempEdges1);
  },[])

  useEffect(() => {
    setEdges(oldedges);
    setNodes(oldnodes);
  },[oldnodes,oldedges])

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      let nodeArr = [];
      flow.nodes.forEach(node => {
        let obj = {
          taskId: node.data.taskId,
          method: node.data.method,
          approver: [node.data.approver],
          name: node.data.name,
          NextAction: {
            APPROVED: [],
            REJECTED: []
          }
        }
        nodeArr.push(obj);
      });

      flow.edges.forEach(edge => {
        let index = nodeArr.findIndex(x => x.taskId.toString() === edge.source);
        if (edge.sourceHandle == "a") {
          nodeArr[index].NextAction.APPROVED.push(edge.target);
        } else if (edge.sourceHandle == "b") {
          nodeArr[index].NextAction.REJECTED.push(edge.target);
        }
      });
      // Sort by taskId
      nodeArr.sort((a, b) => a.taskId - b.taskId);

      //reassign taskId
      let tempId = 0;
      for(let node of nodeArr){
        for(let nodea of nodeArr){
          let nextindex = nodea.NextAction.APPROVED.findIndex((x)=>{
            return x === node.taskId.toString();
          })
          if(nextindex !== -1){
            nodea.NextAction.APPROVED[nextindex] = tempId.toString();
          }
          

          let nextindex2 = nodea.NextAction.REJECTED.findIndex((x)=>{
            return x === node.taskId.toString();
          })
          if(nextindex2 !== -1){
            nodea.NextAction.REJECTED[nextindex2] = tempId.toString();
          }
        }
        node.taskId = tempId;
        tempId++;
      }

      console.log('nodeArr: ', nodeArr);
      workflowJson.setworkflowJson(nodeArr);
    }
  }, [reactFlowInstance]);

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
    ({ direction }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };

      getLayoutedElements(nodes, edges, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        console.log('nodesafter: ', layoutedNodes);
        console.log('edgesafter: ', layoutedEdges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
      });
      
    },
    [nodes, edges]
  );


  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    // check if the dropped element is valid
    if (typeof type === 'undefined' || !type) {
      return;
    }
    //console.log('haha', reactFlowInstance);
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    //check existing node
    let tempid = 0;
    let existingIndex = 0
    while(existingIndex != -1){
      console.log('tempid: ', tempid);
      existingIndex = nodes.findIndex((x) => {
        return x.id.toString() === tempid.toString();
      });
      console.log('existingIndex: ', existingIndex);
      if(existingIndex !== -1){
        tempid++;
      }
      console.log('existingIndex: ', existingIndex);
    }
    console.log('tempid: ', tempid);
    let newNode = {
      id: tempid.toString(),
      type,
      position,
      data: { taskId: tempid, method: "", approver: "", NextAction: { APPROVED: [], REJECTED: [] }, approverOpt:workflowJson.grouparray},
    };
    setNodes((nds) => nds.concat(newNode));
  }





  return (
    <div style={{width: '100%',height: '100%'}}>
      <ReactFlowProvider style={{width: '100%',height: '100%'}}>
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            onLoad={(instance) => setTimeout(() => instance.fitView(), 0)}
          >
            <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            <Panel style={{display:'flex',gap:'5px'}} position="top-right">
                {
                  //<button style={{fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif',padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white'}} onClick={() => onLayout("TB")}>
                  //  Typesetting
                  //</button>
                }
                <button style={{fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif',padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white'}} colorScheme='teal' size='lg' onClick={onSave}>
                  Save
                </button>
            </Panel>
            <Panel position="bottom-center" style={{backgroundColor:'white',border:'1px solid #4c4cef',padding:'15px',borderRadius:'5px'}}>
              <Sidebar />
            </Panel>
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default LayoutFlow;
