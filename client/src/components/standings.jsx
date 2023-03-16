import React from "react";
import "../css/schedule.css";

const Standings = (props) => {

	return (

		<div className="scheduleContainer">
			<h2 className="scheduleHeader">Standings</h2>

			<div className="confrenceContainer">
			{
			props.confrences
				.map((confrence, confrenceIndex) => 
					<table key={ confrenceIndex } className="standings">
					<thead>
					<tr>
						<th colSpan="2">{ confrence.name }</th>
						<th>W</th>
						<th>L</th>
						<th>Pct</th>
					</tr>
					</thead>
					<tbody>
					{
					confrence.teams.sort((teamA, teamB) => teamA.ratio && teamB.ratio ? teamB.ratio - teamA.ratio
						 : (teamA.name || teamA.coach) > (teamB.name || teamB.coach) ? 1 : -1)
						.map((team, teamIndex) => 
						<tr key={ teamIndex } onClick={ () => { props.selectTeam(team) } } >
							<td>
							{ 
							team.name ?
								<img src={ `/media/logos/${ team.name.replace(/[ ]*/g, "").toLowerCase() }.png` } />
							: "" 
							}
							</td>
							<td>{team.name || team.coach}</td>
							<td>{team.wins}</td>
							<td>{team.losses}</td>
							<td>{team.ratio}</td>
						</tr>
					)}
					</tbody>
					</table>
			)}
			</div>
			
			<div className="dayContainer">
			{
			props.schedule.map((gameDay, dayIndex) => 
				<div key= { dayIndex }>
					<h3 className="gameHeader">{ gameDay.name.toDateString() }</h3>

					{
					gameDay.games
						.sort((gameA, gameB) => gameA.dateTime - gameB.dateTime)
						.map((game, gameIndex) => 
						<div className="gameContainer" key={ gameIndex } onClick={ () => props.selectGame(game) }>
							<div className="gameTime">
								{ game.dateTime.toLocaleTimeString().replace(/:\d\d /, " ") }<br/>
								{game.field}
							</div>

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
			)}
			</div>

			<div className="floatingButtonContainer">
				<div className="floatingButton active" onClick={ () => { props.addTeam() }}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
					</svg>
				</div>
			</div>

		</div>

	);

}

export default Standings;
