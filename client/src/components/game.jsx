import React from "react";
import "../css/game.css";

const Game = (props) => {

	return (

		<div className="gamePage">
			<div className="schedule">
				<div className="gameTitle">
					<div>{ props.game.field } Field &bull; { props.game.dateTime.toDateString() } { props.game.dateTime.toLocaleTimeString() }</div>
					
					<div className="gameEditButton"  ng-click="editGame()">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
					</div>
				</div>
				
				<div className="teamContainer">
					<div className="team">
						<div><img src={ `/media/logos/${ props.game.awayTeam.name.toLowerCase() }.png` } className="teamImage" /></div>
						<div className="teamName">{ props.game.awayTeam.name }</div>
						<div className="teamRecord">({ props.game.awayTeam.wins } - { props.game.awayTeam.losses })</div>
					</div>
					
					<div className="teamScore">{ props.game.awayTeam.score }</div>
					
					<div className="teamSeparator">{ props.game.awayTeam.score ? "<span>&mdash;</span>" : "At" }</div>
					
					<div className="teamScore">{ props.game.homeTeam.score }</div>
					
					<div className="gamePageTeam">
						<div><img src={ `/media/logos/${ props.game.homeTeam.name.toLowerCase() }.png` } className="teamImage" /></div>
						<div className="teamName">{ props.game.homeTeam.name }</div>
						<div className="teamRecord">({ props.game.homeTeam.wins } - { props.game.homeTeam.losses })</div>
					</div>
				</div>
			</div>

			<div className="statsTeams">
				<div className="statsContainer">
					<div className="statsTeam">{ props.game.awayTeam.name } / { props.game.awayTeam.coach }</div>
					
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
					props.game.awayTeam.players.map((player, playerIndex) =>
					<tr key={ playerIndex } ng-click="viewPlayer(player)">
						<td>{ player.draftPick ? player.draftPick : "-" } / { player.draftRank ? player.draftRank : "-" }</td>
						<td>{ player.firstName + " " + player.lastName }</td>
						<td>{ player.throwing ? player.throwing : "-" }</td>
						<td>{ player.catching ? player.catching : "-" }</td>
						<td>{ player.runTime ? player.runTime : "-" }</td>
						<td>{ player.age ? player.age : "-" }</td>
					</tr>
					)}
					</tbody>
					</table>
				</div>
				
				<div className="statsContainer" layout="column" flex-gt-xs="50" layout-align="start center">
					<div className="statsTeam">{ props.game.homeTeam.name } / { props.game.homeTeam.coach }</div>
					
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
					props.game.homeTeam.players.map((player, playerIndex) =>
					<tr key={ playerIndex } ng-click="viewPlayer(player)">
						<td>{ player.draftPick ? player.draftPick : "-" } / { player.draftRank ? player.draftRank : "-" }</td>
						<td>{ player.firstName + " " + player.lastName }</td>
						<td>{ player.throwing ? player.throwing : "-" }</td>
						<td>{ player.catching ? player.catching : "-" }</td>
						<td>{ player.runTime ? player.runTime : "-" }</td>
						<td>{ player.age ? player.age : "-" }</td>
					</tr>
					)}
					</tbody>
					</table>
				</div>
			</div>

		</div>

	);
}
		
export default Game;
	