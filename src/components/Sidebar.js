import React from 'react';
import ApprovalNode from "./approvalNode";

const Sidebar = () => {

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane.</div>
            <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'selectorNode')} draggable>
                Workflow Node
            </div>
        </aside>
    );
};

export default Sidebar;
