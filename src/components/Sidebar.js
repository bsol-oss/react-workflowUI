import React from 'react';
import ApprovalNode from "./approvalNode";

const Sidebar = () => {

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div style={{marginBottom:'10px'}}>You can drag these nodes to the pane.</div>
            <div style={{
                height: '20px',
                padding: '4px',
                border:' 1px solid #0041d0',
                borderRadius: '2px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'grab',
                borderColor: '#0041d0'
                }} 
                onDragStart={(event) => onDragStart(event, 'selectorNode')} 
                draggable>
                    Workflow Node
            </div>
        </aside>
    );
};

export default Sidebar;
