import React, { useState } from "react";

const PlayPopup = (props) => {

	const [ formation, setFormation ] = useState(props.play.formation || "");
	const [ name, setName ] = useState(props.play.name || "");
	const [ playBookId, setPlayBookId ] = useState(props.play.playBookId);
	const [ selectedPlayBooks, setSelectedPlayBooks ] = useState(
		props.playBooks
			.filter(playBook => playBook.plays.some(play => play.playId === props.play.id ))
			.map(playBook => playBook.id)
		);
	
	const selectPlayBook = playBookId => {
		if (selectedPlayBooks.some(playBook => playBook === playBookId)) {
			setSelectedPlayBooks(selectedPlayBooks.filter(playBook => playBook !== playBookId));
		}
		else {
			setSelectedPlayBooks(playBooks => [ ...playBooks, playBookId ]);
		}
	};

	return (
	<div className="popupBackground active">
		<div className="popup">
			<div className="popupHeader">

				<h2 className="label">Play Details</h2>

				{/* Save */}
				<div onClick={ () => { props.save(formation, name, selectedPlayBooks) }} className="button">
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
			
			<div className="popupContainer">

				<div className="popupFormRow">
					<div className="label">Formation</div>

					<div className="popupFormInput">
						<input type="text" value={ formation } onChange={ event => { setFormation(event.target.value) } } />
					</div>
				</div>

				<div className="popupFormRow">
					<div className="label">Name</div>

					<div className="popupFormInput">
						<input type="text" value={ name } onChange={ event => { setName(event.target.value) } } />
					</div>
				</div>

				<div className="spacer"></div>

				<div><span className="label">Playbooks</span></div>
				
				{
				props.playBooks.map(playBook => 

					<div key={ playBook.id } className="popupFormRow">
						<label>
							<input type="checkbox" checked={ selectedPlayBooks.some(selectedPlayBook => selectedPlayBook === playBook.id) } onChange={ () => { selectPlayBook(playBook.id) }} />

							{ playBook.name }
						</label>
					</div>
				)
				}

			</div>
		</div>
	</div>
	)
}

export default PlayPopup;
