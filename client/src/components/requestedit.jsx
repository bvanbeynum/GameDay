import React, { useState } from "react";

const RequestEditPopup = (props) => {

	const [assigedUserId, setAssignedUserId] = useState("");

	return (
		<div className="popupBackground active">
			<div className="popup">
				<div className="popupHeader">
					<h2 className="label">Edit Request</h2>
				</div>
				
				<div className="popupContainer">
					<div className="popupFormRow">
						<div className="label">Requested</div>
						<div className="popupFormInput">{ `${ props.userRequest.device.lastAccess.toLocaleDateString() } ${ props.userRequest.device.lastAccess.toLocaleTimeString() }` }</div>
					</div>
					
					<div className="popupFormRow">
						<div className="label">Domain</div>
						<div className="popupFormInput">{ props.userRequest.device.domain }</div>
					</div>
					
					<div className="popupFormRow">
						<div className="label">Name</div>
						<div className="popupFormInput">{ props.userRequest.name || "<not entered>" }</div>
					</div>
					
					<div className="popupFormRow">
						<div className="label">Email</div>
						<div className="popupFormInput">{ props.userRequest.email || "<not entered>" }</div>
					</div>
					
					<div className="popupFormRow">
						<div className="label">IP</div>
						<div className="popupFormInput">{ props.userRequest.device.ip }</div>
					</div>
					
					<div className="popupFormRow">
						<div>
							<div className="label">Browser</div>
							<div>{ props.userRequest.device.agent }</div>
						</div>
					</div>
					
					<div className="popupFormRow">
						<div className="button">
							{/* Save */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
							</svg>
						</div>

						<div className="button" onClick={ () => { props.delete(props.userRequest.id) }}>
							{/* Trash */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
							</svg>
						</div>

						<div className="button" onClick={ props.close }>
							{/* Cancel */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
							</svg>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
		
export default RequestEditPopup;
