import React from "react";
import "../css/team.css";

const Team = (props) => {

	return (
		<div className="scheduleContainer">
			<div className="teamHeader">
				<img src={ `/media/logos/${ props.team.name.toLowerCase() }.png` } />
				<h2 className="header">{ props.team.name } - { props.team.coach }</h2>
			</div>
			
			<div className="scheduleSection">
			{
			props.games.map((game, gameIndex) =>
				<div key={ gameIndex } className="gameContainer" onClick={ () => { props.selectGame(game) }}>
					<div className="scheduleTeams">
						<div className="scheduleTeam">
							<img src={`/media/logos/${ game.awayTeam.name.toLowerCase() }.png`} />
							<div className="scheduleTeamName">{ game.awayTeam.name }</div>
							<div className="scheduleWinner">{ game.awayTeam.isWinner ? <span>&#9668;</span> : "" }</div>
						</div>
						
						<div className="scheduleTeam">
							<img src={`/media/logos/${ game.homeTeam.name.toLowerCase() }.png`} />
							<div className="scheduleTeamName">{ game.homeTeam.name }</div>
							<div className="scheduleWinner">{ game.homeTeam.isWinner ? <span>&#9668;</span> : "" }</div>
						</div>
					</div>
					
					<div className="scheduleDateContainer">
						<div className="scheduleDate">{ game.dateTime.toDateString() }</div>
						<div className="scheduleTime">{ game.dateTime.toLocaleTimeString().replace(/:00 /, " ") }</div>
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
