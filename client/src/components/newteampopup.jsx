import React, { useState } from "react";

const NewTeamPopup = (props) => {

	const [confrence, setConfrence] = useState("");
	const [coach, setCoach] = useState("");
	const [name, setName] = useState("");

	return (
		<div className="popupBackground active">
			<div className="popup">
				<div className="popupHeader">

					<h2 className="label">Add New Team</h2>
					
					<div onClick={ () => { props.cancelTeam() }} className="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</div>

					<div onClick={ () => { props.saveTeam(confrence, coach, name) }} className="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
						</svg>
					</div>

				</div>
				
				<div className="popupContainer">

					<div className="popupFormRow">
						<div className="label">Confrence</div>

						<div className="popupFormInput">
							<input type="text" value={ confrence } onChange={ event => { setConfrence(event.target.value) } } />
						</div>
					</div>

					<div className="popupFormRow">
						<div className="label">Coach</div>

						<div className="popupFormInput">
							<input type="text" value={ coach } onChange={ event => { setCoach(event.target.value) } } />
						</div>
					</div>

					<div className="popupFormRow">
						<div className="label">Name</div>

						<div className="popupFormInput">
							<input type="text" value={ name } onChange={ event => { setName(event.target.value) } } />
						</div>
					</div>

				</div>

			</div>
		</div>
	);
}
		
export default NewTeamPopup;
