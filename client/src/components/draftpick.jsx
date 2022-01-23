import React, { useState, useEffect } from "react";

const DraftPick = (props) => {

	const [selectedNumber, setSelectedNumber] = useState("");
	const [selectedPlayer, setSelectedPlayer] = useState();
	const [errorPick, setErrorPick] = useState();

	useEffect(() => {
	}, [props.pick])

	const updateSelectedNumber = event => {
		setSelectedNumber(event.target.value);

		const foundPlayer = props.allPlayers.find(player => player.draftNumber == event.target.value);

		if (foundPlayer) {
			setSelectedPlayer(foundPlayer);

			const existingPick = props.allPicks.find(pick => pick.player && pick.player.draftNumber == foundPlayer.draftNumber);
			if (existingPick) {
				const pickTeam = props.allTeams.find(team => team.picks.some(teamPick => teamPick.pick == existingPick.pick));
				setErrorPick({ pick: existingPick.round, coach: pickTeam.coach });
			}
		}
		else {
			setSelectedPlayer(null);
			setErrorPick(null);
		}
	};

	const selectPick = () => {
		props.setPick(props.pick.pick, selectedPlayer ? selectedPlayer.draftNumber : null);
		setSelectedNumber("");
		setSelectedPlayer(null);
		setErrorPick(null);
	}

	const unselectPick = () => {
		setSelectedNumber("");
		setSelectedPlayer(null);
		setErrorPick(null);
	}

	return (
		<div className="draftPick">
			<div className="pickNumber">
				<input type="number" value={ selectedNumber } onChange={ event => { updateSelectedNumber(event) } } />
			</div>
			
			<div className="pickName">
				{ 
				selectedPlayer ? `${ selectedPlayer.firstName } ${ selectedPlayer.lastName }` 
					: props.pick.player ? `${ props.pick.player.firstName } ${ props.pick.player.lastName }`
					: <span>&mdash; unselected &mdash;</span>
				}
				{ 
				errorPick ? 
					<div className="error">{ `Round ${ errorPick.pick } from ${ errorPick.coach }` }</div>
					: ""
				}
			</div>
			
			<div className="pickAction">
				{
				selectedPlayer ?
				<span>
					{/* Thumbs up */}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { selectPick() }}>
						<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
					</svg>
					{/* Thumbs down */}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { unselectPick() }}>
						<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
					</svg>
				</span>
				: ""
				}
				
				{
				!selectedPlayer && props.pick.player ?
				<span>
					{/* Check mark */}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
					</svg>
					{/* Trash */}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { selectPick() }}>
						<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
					</svg>
				</span>
				: ""
				}
			</div>
		</div>	
	)
}
	
export default DraftPick;
