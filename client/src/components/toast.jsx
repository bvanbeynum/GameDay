import React, { useState } from "react";
import "./toast.css"

const Toast = (props) => {

    return (
        <div className={`toast ${ props.message.isActive ? "isActive" : "" } ${ props.message.type }`} >
			{ props.message.text }
		</div>
    );

};

export default Toast;