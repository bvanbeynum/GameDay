import React, { useState, useEffect } from "react";

const GamePopup = (props) => {

	const [winner, setWinner] = useState(props.game.winnerId);
	const [awayScore, setAwayScore] = useState(props.game.awayTeam.score || "");
	const [homeScore, setHomeScore] = useState(props.game.homeTeam.score || "");

	useEffect(() => {

		setWinner(
			props.game.awayTeam.isWinner ? props.game.awayTeam.id
				: props.game.homeTeam.isWinner ? props.game.homeTeam.id 
				: ""
			);

		setAwayScore(props.game.awayTeam.score || "");
		setHomeScore(props.game.homeTeam.score || "");

	}, [ props.game.winnerId, props.game.awayTeam.score, props.game.homeTeam.score ])

	const changeWinner = () => event => {
		setWinner(event.target.value);
	}

	const changeAwayScore = () => event => {
		setAwayScore(event.target.value);
	}

	const changeHomeScore = () => event => {
		setHomeScore(event.target.value);
	}

	const saveGame = () => {
		props.saveGame(winner, awayScore, homeScore);
	}

	return (
		<div className={ `popupBackground ${ props.isActive ? "active" : "" }` }>
			<div className="popup">
				<div className="popupHeader">

					<h2 className="label">{ props.game.awayTeam.name + " at " + props.game.homeTeam.name }</h2>
					
					<div onClick={ () => { props.closeGame() }} className="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</div>

					<div onClick={ () => { saveGame() }} className="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
						</svg>
					</div>

				</div>
				
				<div className="popupContainer">
					<div className="popupFormRow">
						<div className="label">Winner</div>
						<div className="popupFormInput">
							<select value={ winner } onChange={ changeWinner() }>
								<option value="">No Winner</option>
								<option value={ props.game.awayTeam.id }>{ props.game.awayTeam.name }</option>
								<option value={ props.game.homeTeam.id }>{ props.game.homeTeam.name }</option>
							</select>
						</div>
					</div>
					
					<div className="spacer"></div>
					
					<div className="popupFormRow">
						<div className="label">{ props.game.awayTeam.name }</div>
						<div className="popupFormInput">
							<input type="number" value={ awayScore } onChange={ changeAwayScore() } />
						</div>
					</div>
					
					<div className="popupFormRow">
						<div className="label">{ props.game.homeTeam.name }</div>
						<div className="popupFormInput">
							<input type="number" value={ homeScore } onChange={ changeHomeScore() } />
						</div>
					</div>
					
				</div>

			</div>
		</div>
	);
}
		
export default GamePopup;
