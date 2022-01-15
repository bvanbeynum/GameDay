import React, { useState } from "react";
import DraftPick from "./draftpick";

const DraftTeam = (props) => {

	const [selectedTeamId, setSelectedTeamId] = useState("");

	return (
		<div className="draftContent">
		{
		props.teams
			.map(team =>
			<div key={ team.id } className="draftTeam">
				
				<div className="teamHeader">
					<div className="teamAction">
					{
					selectedTeamId === team.id ?
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setSelectedTeamId("") }}>
							<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
						</svg>
					: ""
					}
					
					{
					selectedTeamId !== team.id ?
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { setSelectedTeamId(team.id) }}>
							<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
						</svg>
					: ""
					}
					</div>
					
					<div className="teamName">{ team.coach }</div>
					
					<div className="teamRounds">
					{
					team.picks.map((pick, pickIndex) => 
						<div key={ pickIndex } className={ `teamPickTick ${ pick.player ? "filled" : "" }` }></div>
					)
					}
					</div>
					
					<div className="teamRound">
						<input type="number" value={ team.draftRound } onChange={ props.changeDraftRound(team.id) } className={ team.roundError ? "error" : "" } />
					</div>
				</div>
				
				{
				selectedTeamId === team.id ?
				<div className="teamPicks">
					
					{
					team.picks.map(pick =>
						<div key={ pick.pick } className="teamPick">
							<div className="roundNumber">
								{ `${ pick.round } / ${ pick.pick }` }
							</div>
						
							<DraftPick pick={ pick } allPicks={ props.picks } allPlayers={ props.players } allTeams={ props.teams } setPick={ props.setPick } />
						</div>
					)
					}
					
				</div>
				: ""
				}
				
			</div>
		)
		}			
		</div>
	)
}

export default DraftTeam;
