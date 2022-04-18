import React from "react";
import "../css/team.css";

const Team = (props) => {

	return (
		<div className="scheduleContainer">
			<div className="teamHeader">
				<img src={ `/media/logos/${ props.team.name.replace(/[ ]*/g, "").toLowerCase() }.png` } />
				<h2 className="header">{ props.team.name } - { props.team.coach }</h2>
			</div>
			
			<div className="scheduleSection">
			{
			props.games.sort((gameA, gameB) => gameA.dateTime - gameB.dateTime).map((game, gameIndex) =>
				<div className="gameContainer" key={ gameIndex } onClick={ () => props.selectGame(game) }>
					<div className="gameTime">{ game.dateTime.toLocaleTimeString().replace(/:\d\d /, " ") }</div>

					<div className="gameTeamContainer">
						<div className="gameTeam">
							<div>{ game.homeTeam.name }</div>
							<div>{ `(${ (game.homeTeam.wins || 0) }-${ (game.homeTeam.losses || 0) })`}</div>
						</div>

						<img src={ `/media/logos/${ game.homeTeam.name.replace(/[ ]*/g, "").toLowerCase() }.png` } />

						<div className="gameWinner">
						{ 
						game.homeTeam.isWinner ? 
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94c0.63,1.5,1.98,2.63,3.61,2.96V19H7v2h10v-2h-4v-3.1 c1.63-0.33,2.98-1.46,3.61-2.96C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M12,14 c-1.65,0-3-1.35-3-3V5h6v6C15,12.65,13.65,14,12,14z M19,8c0,1.3-0.84,2.4-2,2.82V7h2V8z"/>
							</svg>
						: ""
						}
						</div>

						<div className="gameSplit">@</div>
						
						<div className="gameWinner">
						{ 
						game.awayTeam.isWinner ? 
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94c0.63,1.5,1.98,2.63,3.61,2.96V19H7v2h10v-2h-4v-3.1 c1.63-0.33,2.98-1.46,3.61-2.96C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M12,14 c-1.65,0-3-1.35-3-3V5h6v6C15,12.65,13.65,14,12,14z M19,8c0,1.3-0.84,2.4-2,2.82V7h2V8z"/>
							</svg>
						: ""
						}
						</div>

						<img src={ `/media/logos/${ game.awayTeam.name.replace(/[ ]*/g, "").toLowerCase() }.png` } />

						<div className="gameTeam">
							<div>{ game.awayTeam.name }</div>
							<div>{ `(${ (game.awayTeam.wins || 0) }-${ (game.awayTeam.losses || 0) })`}</div>
						</div>
					</div>
				</div>
			)}
			</div>
			
			<div className="statsContainer">
				<table className="teamStats">
				<thead>
				<tr>
					<th>Pk/Rk</th>
					<th>Player</th>
					<th>Th</th>
					<th>C</th>
					<th>Run</th>
					<th>Age</th>
				</tr>
				</thead>
				<tbody>
				{
				props.team.players
					.sort((playerA, playerB) => playerA.draftPick - playerB.draftPick)
					.map((player, playerIndex) =>
				<tr key={ playerIndex } onClick={ () => { props.viewPlayer(player) }}>
					<td>{ player.draftPick ? player.draftPick : "-" } / { player.draftRank ? player.draftRank : "-" }</td>
					<td>{ player.firstName + " " + player.lastName }</td>
					<td>{ player.throwing ? player.throwing : "-" }</td>
					<td>{ player.catching ? player.catching : "-" }</td>
					<td>{ player.runTime ? player.runTime : "-" }</td>
					<td>{ player.age ? player.age : "-" }</td>
				</tr>
				) }
				</tbody>
				</table>
			</div>

		</div>
    );

}
    
export default Team;
