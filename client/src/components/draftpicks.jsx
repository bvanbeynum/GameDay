import React, { useState, useEffect } from "react";
import DraftPick from "./draftpick";

const DraftPicks = (props) => {

	return (
		<div className="draftContent">

			<table class="draftTable">
			<thead>
			<tr>
				<th>Rnd</th>
				<th>Pck</th>
				<th>Coach</th>
				<th>Pick</th>
			</tr>
			</thead>
			<tbody>
			{
			props.picks.map(pick => 
			<tr key={ pick.pick } className={ pick.round %2 === 0 ? "draftAlternate" : "" }>
				<td>{ pick.round }</td>
				<td>{ pick.pick }</td>
				<td>{  pick.team ? pick.team.coach : <span>&mdash;</span> }</td>
				<td>
					<DraftPick pick={ pick } allPicks={ props.picks } allPlayers={ props.players } allTeams={ props.teams } setPick={ props.setPick } />
				</td>
			</tr>
			)}
			</tbody>
			</table>

		</div>
	)
}
	
export default DraftPicks;
