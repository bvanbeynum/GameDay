import React, { useState } from "react";

const LocationPopup = (props) => {

	const [ editLocationIndex, setEditLocationIndex ] = useState(null);
	const [ selectedLocation, setSelectedLocation ] = useState(null);

	return (
	<div className="popupBackground active">
		<div className="popup">
			<div className="popupHeader">

				<h2 className="label">Field Locations</h2>

				{/* Save */}
				<div onClick={ () => { props.save() }} className="button">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
					</svg>
				</div>
				
				{/* Close */}
				<div onClick={ () => { props.close() } } className="button">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</div>

			</div>
			
			<div className="popupContainerThin">
				{
				props.locations
				.sort((locationA, locationB) => locationA.name > locationB.name ? 1 : -1)
				.map((location, locationIndex) => 
					<div key={ location.id || locationIndex } className="listContainer">
						<div className="listHeader">
							<div>{ location.name }</div>
						
							<div>
							{
							editLocationIndex === locationIndex ? 
								<div>
									{/* Thumbs up */}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { props.saveLocation(selectedLocation); setEditLocationIndex(null); }}>
										<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
									</svg>
									{/* Thumbs down */}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setEditLocationIndex(null) }}>
										<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
									</svg>
								</div>
							:
								<div>
									{/* Edit */}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setEditLocationIndex(locationIndex); setSelectedLocation(location) }}>
										<path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
									</svg>
									{/* Trash */}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { props.deleteLocation(location) }}>
										<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
									</svg>
								</div>
							}
							</div>
						</div>

						{
						editLocationIndex === locationIndex ?
							<div className="listMember column">
								
								<div className="popupFormRow">
									<div className="label">Name</div>

									<div className="popupFormInput">
										<input type="text" value={ selectedLocation.name } onChange={ event => { setSelectedLocation(({ ...selectedLocation, name: event.target.value })) }} />
									</div>
								</div>

								<div className="popupFormRow">
									<div className="label">Address</div>

									<div className="popupFormInput">
										<input type="text" value={ selectedLocation.address } onChange={ event => { setSelectedLocation(({ ...selectedLocation, address: event.target.value })) }} />
									</div>
								</div>

								<div className="popupFormRow">
									<div className="label">Map</div>

									<div className="popupFormInput">
										<input type="text" value={ selectedLocation.map } onChange={ event => { setSelectedLocation(({ ...selectedLocation, map: event.target.value })) }} />
									</div>
								</div>

							</div>
						: ""
						}
					</div>
				)}
				<div className="listContainer">
					<div className="listHeader">
						<div>New Location</div>
					
						<div>
						{
						editLocationIndex === -1 ? 
							<div>
								{/* Thumbs up */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { props.saveLocation(selectedLocation); setEditLocationIndex(null); }}>
									<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
								</svg>
								{/* Thumbs down */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setEditLocationIndex(null) }}>
									<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
								</svg>
							</div>
						:
							<div>
								{/* Edit */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setEditLocationIndex(-1); setSelectedLocation({ name: "", address: "", map: "" }) }}>
									<path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
								</svg>
							</div>
						}
						</div>
					</div>

					{
					editLocationIndex === -1 ?
						<div className="listMember column">
							
							<div className="popupFormRow">
								<div className="label">Name</div>

								<div className="popupFormInput">
									<input type="text" value={ selectedLocation.name } onChange={ event => { setSelectedLocation(({ ...selectedLocation, name: event.target.value })) }} />
								</div>
							</div>

							<div className="popupFormRow">
								<div className="label">Address</div>

								<div className="popupFormInput">
									<input type="text" value={ selectedLocation.address } onChange={ event => { setSelectedLocation(({ ...selectedLocation, address: event.target.value })) }} />
								</div>
							</div>

							<div className="popupFormRow">
								<div className="label">Map</div>

								<div className="popupFormInput">
									<input type="text" value={ selectedLocation.map } onChange={ event => { setSelectedLocation(({ ...selectedLocation, map: event.target.value })) }} />
								</div>
							</div>

						</div>
					: ""
					}
				</div>
			</div>
		</div>
	</div>
	)
}

export default LocationPopup;
