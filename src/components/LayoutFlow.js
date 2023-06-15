import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant
} from "reactflow";
import dagre from "dagre";
import ApprovalNode from "./approvalNode";
import "reactflow/dist/style.css";
import "../styles.css";
import Sidebar from "./Sidebar";

const nodeTypes = {
  selectorNode: ApprovalNode
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
const nodeHeight = 280;

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

  useEffect(()=>{
    console.log('workflowJson: ', workflowJson);
    if(workflowJson.workflowJson === null){
      return;
    }
    const { nodes: tempNodes1, edges: tempEdges1 } = workflowToNodesEdges(workflowJson.workflowJson,workflowJson.grouparray);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      tempNodes1,
      tempEdges1
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  },[])

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log(flow);
      let nodeArr = [];
      flow.nodes.forEach(node => {
        let obj = {
          taskId: node.data.taskId,
          method: node.data.method,
          approver: node.data.approver,
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
    let newNode = {
      id: nodes.length.toString(),
      type,
      position,
      data: { taskId: nodes.length, method: "", approver: "", NextAction: { APPROVED: [], REJECTED: [] }, approverOpt:workflowJson.grouparray},
    };
    setNodes((nds) => nds.concat(newNode));
  }





  return (
    <div className="dndflow">
      <ReactFlowProvider style={{width: '100%',height: '90%'}}>
        <div className="reactflow-wrapper flowBody" ref={reactFlowWrapper}>
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
                <button style={{fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif',padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white'}} onClick={() => onLayout("TB")}>
                  Typesetting
                  </button>
                <button style={{fontFamily:'roboto, Noto Sans TC, Noto Sans SC, sans-serif',padding:'3px 6px',border:'1px solid #4c4cef',borderRadius:'3px',backgroundColor:'#4c4cef',color:'white'}} colorScheme='teal' size='lg' onClick={onSave}>
                  Save
                </button>
            </Panel>
            <Panel position="bottom-center">
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
