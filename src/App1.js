import React from "react";
import LayoutFlow from "./components/LayoutFlow.js";
import { workflowJson } from "./components/nodes-edges.js";
const App2 = () => {
    
    return (
        <div className="flowBody">
            <div>
                <h1>Testing Header</h1>
            </div>
            <div className="flowBody" style={{ display: 'flex' }}>
                <div style={{ width: '20%' }}>
                    <div>Side bar 1</div>
                    <div>Side bar 2</div>
                    <div>Side bar 3</div>
                    <div>Side bar 4</div>
                    <div>Side bar 5</div>
                    <div>Side bar 6</div>
                </div>
                <div style={{width: '100%',height: '90%',margin: '0',padding: '0',boxsizing: 'border-box',fontfamily: 'sans-serif'}}>
                    <LayoutFlow workflowJson={null}/>
                </div>
            </div>
        </div>
    );
};

export default App2;
