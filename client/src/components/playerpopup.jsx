import React from "react";

const PlayerPopup = (props) => {

	return (
		<div className={ `popupBackground ${ props.isActive ? "active" : "" }` }>
			<div className="popup">
				<div className="popupHeader">

					<h2 className="label">{ props.player.firstName + " " + props.player.lastName }</h2>
					
					<div onClick={ () => { props.closePlayer() }} className="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
							<path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</div>

				</div>
				
				<div className="popupContainer">
					<div><span className="label">Age:</span> { props.player.age }</div>

					<div className="spacer"></div>
					
					<div><span className="label">Rank:</span> { props.player.draftRank }</div>
					<div><span className="label">Brett:</span> { props.player.brettRank }</div>
					
					<div className="spacer"></div>
					
					<div><span className="label">Protected:</span> { props.player.coachProtect }</div>
					<div><span className="label">Requested:</span> { props.player.coachRequest }</div>
					<div><span className="label">Requests:</span> { props.player.requests }</div>
					<div><span className="label">Notes:</span> { props.player.comments }</div>
					
					<div className="spacer"></div>
					
					<table className="viewPlayerTable">
					<thead>
					<tr>
						<th>&nbsp;</th>
						<th>
							{ props.player.division ? props.player.division.year : "" }<br />
							{ props.player.division ? props.player.division.season.charAt(0).toUpperCase() + props.player.division.season.slice(1) : "" }
						</th>
						{ props.player.prev.map((season, seasonIndex) => 
						<th key={ seasonIndex }>
							{ season.division.year }<br />
							{ season.division.season.charAt(0).toUpperCase() + season.division.season.slice(1) }
						</th>
						) }
					</tr>
					</thead>
					<tbody>
					<tr>
						<td>Team</td>
						<td>{ props.player.team ? props.player.team.name : "" }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.team.name }</td>
						) }
					</tr>
					<tr>
						<td>Rank</td>
						<td>{ props.player.draftRank }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.draftRank }</td>
						) }
					</tr>
					<tr>
						<td>Round</td>
						<td>{ props.player.draftRound }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.draftRound }</td>
						) }
					</tr>
					<tr>
						<td>Catch</td>
						<td>{ props.player.catching }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.catching }</td>
						) }
					</tr>
					<tr>
						<td>Run</td>
						<td>{ props.player.running }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.running }</td>
						) }
					</tr>
					<tr>
						<td>Time</td>
						<td>{ props.player.runTime }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.runTime }</td>
						) }
					</tr>
					<tr>
						<td>Throw</td>
						<td>{ props.player.throwing }</td>
						{ props.player.prev.map((season, seasonIndex) => 
						<td key={ seasonIndex }>{ season.throwing }</td>
						) }
					</tr>
					</tbody>
					</table>
					
				</div>

			</div>
		</div>
	);
}
		
export default PlayerPopup;
