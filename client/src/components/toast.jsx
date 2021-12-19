import React, { useState, useEffect } from "react";
import "../css/toast.css"

const Toast = (props) => {

	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		if (props.message && props.message.text && props.message.text.length > 0) {
			setIsActive(true);

			setTimeout(() => {
				setIsActive(false);
			}, 4000);
		}

	}, [ props.message.text ]);

	return (
		<div className={`toast ${ isActive ? "isActive" : "" } ${ props.message.type }`} >
			{ props.message.text }
		</div>
	);

};

export default Toast;