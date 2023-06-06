import ApprovalNode from "./approvalNode";
const position = { x: 0, y: 0 };
const edgeType = "smoothstep";

let workflowTamplateSample = [
  {
    taskId: 0, //this is the task id default value, it should start from 0, [0,1,2,3...]
    method: "ALL", //this is the workflow method, there are 4 method: ALL(all approver need to approve = approved),ONE,MAJORITY,VETTING
    approver: ["ITteam"], //this is the approver group name, can be assigned to specific people or requester group team lead
    name: "ITteam approval",
    NextAction: {
      //this is the next action, when this action end the workflow will go to next action, this should be array of the task id
      APPROVED: ["1"], //example: when the workflow result is approved, the workflow will go to task id 1
      REJECTED: ["2"] //example: when the workflow result is rejected, the workflow will go to task id 1           //for vetting method, the workflow next step will always go approved
    },
  },
  {
    taskId: 1,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeamHead"],
    NextAction: {
      APPROVED: ["3"],
      REJECTED: ["4"]
    },
  },
  {
    taskId: 2,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeam"],
    NextAction: {
      APPROVED: ["5"],
      REJECTED: ["6"]
    },
  },
  {
    taskId: 3,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeam"],
    NextAction: {
      APPROVED: [],
      REJECTED: []
    },
  },
  {
    taskId: 4,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeam"],
    NextAction: {
      APPROVED: [],
      REJECTED: []
    },
  },
  {
    taskId: 5,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeam"],
    NextAction: {
      APPROVED: [],
      REJECTED: []
    },
  },
  {
    taskId: 6,
    method: "VETTING",
    name: "ITteam approval",
    approver: ["requesterTeam"],
    NextAction: {
      APPROVED: [],
      REJECTED: []
    },
  }
];


//const nodeTypes = {
//  selectorNode: ApprovalNode
//};
//
//let tempNodes = [];
//let tempEdges = [];
//workflowTamplateSample.forEach((data, index) => {
//  let tempNode = {
//    id: data.taskId.toString(),
//    type: "selectorNode",
//    data: data,
//    style: { border: "1px solid #777", padding: "10px", background: "#fff" },
//    position
//  };
//  tempNodes.push(tempNode);
//  let edgeAP = {
//    id: data.taskId.toString() + '-' + data.NextAction.APPROVED.toString(),
//    source: data.taskId.toString(),
//    target: data.NextAction.APPROVED.toString(),
//    type: edgeType,
//    sourceHandle: "a",
//    animated: false
//  };
//  tempEdges.push(edgeAP);
//  let edgere = {
//    id: data.taskId.toString() + '-' + data.NextAction.REJECTED.toString(),
//    source: data.taskId.toString(),
//    target: data.NextAction.REJECTED.toString(),
//    type: edgeType,
//    sourceHandle: "b",
//    animated: false
//  };
//  tempEdges.push(edgere);
//});
//
//tempEdges = tempEdges.filter((x) => {
//  return x.target !== "";
//});
//
//
//export const initialNodes = tempNodes;
//
//export const initialEdges = tempEdges;

export const workflowJson = workflowTamplateSample;