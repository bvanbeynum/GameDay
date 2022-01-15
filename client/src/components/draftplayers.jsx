import React, { useState, useEffect } from "react";

const DraftPlayers = (props) => {

	const [ playerSort, setPlayerSort ] = useState("draftRank");
	const [ sortDirection, setSortDirection ] = useState(1);
	const [ selectedPlayerId, setSelectedPlayerId ] = useState();

	return (
		<div className="draftContent">
			
			<table className="playerTable">
			<thead>
			<tr>
				<th className={ playerSort === "draftRank" ? "draftSorted" : "" } onClick={ () => { setPlayerSort("draftRank"); setSortDirection(sortDirection * -1); }}>Rnk</th>
				<th className={ playerSort === "brettRank" ? "draftSorted" : "" } onClick={ () => { setPlayerSort("brettRank"); setSortDirection(sortDirection * -1); }}>BvB</th>
				<th className={ playerSort === "catching" ? "draftSorted" : "" } onClick={ () => { setPlayerSort("catching"); setSortDirection(sortDirection * -1); }}>C</th>
				<th className={ playerSort === "draftNumber" ? "draftSorted" : "" } onClick={ () => { setPlayerSort("draftNumber"); setSortDirection(sortDirection * -1); }}>#</th>
				<th className={ playerSort === "firstName" ? "draftSorted" : "" } onClick={ () => { setPlayerSort("firstName"); setSortDirection(sortDirection * -1); }}>Name</th>
				<th>Notes</th>
			</tr>
			</thead>
			<tbody>
			{
			props.players
				.sort((playerA, playerB) => 
					typeof playerA[playerSort] !== typeof playerB[playerSort] ?
						typeof playerA[playerSort] > typeof playerB[playerSort] ? 1 : -1
						: typeof playerA[playerSort] === "undefined" ? playerA["firstName"].toLowerCase() + playerA["lastName"].toLowerCase() > playerB["firstName"].toLowerCase() + playerB["lastName"].toLowerCase() ? 1 : -1
						: playerA[playerSort] === playerB[playerSort] ? playerA["firstName"].toLowerCase() + playerA["lastName"].toLowerCase() > playerB["firstName"].toLowerCase() + playerB["lastName"].toLowerCase() ? 1 : -1
						: playerA[playerSort] > playerB[playerSort] ? sortDirection : sortDirection * -1
				)
				.map((player, playerIndex) => [
				<tr key={ player.id } onClick={ () => { player.id === selectedPlayerId ? setSelectedPlayerId(null) : setSelectedPlayerId(player.id) }} className={ `playerHeader ${ player.id === selectedPlayerId ? "selected" : "" }`}>
					<td>
					{
					player.draftRank ?
						<div ng-show="player.draftRank">
							{ `${ player.draftRound }/${ player.draftRank }` }
						</div>
					: ""
					}
					</td>
					<td>
						<div>{ player.brettRank }</div>
						
						<div>
						{
						player.draftRank > player.brettRank ?
							<span className="positive">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>+{ (player.draftRank - player.brettRank) }
							</span>
						: ""
						}{
						player.draftRank < player.brettRank ?	
							<span className="negative">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>{ (player.draftRank - player.brettRank) }
							</span>
						: ""
						}
						</div>
					</td>
					<td>
						<div>{ player.catching }</div>
						
						{
						player.evalCatch ?
						<div ng-show="player.evalCatch">
							{
							player.catching < player.evalCatch ?
							<span className="positive">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>+{ (player.evalCatch - player.catching) }
							</span>
							: ""
							}{
							player.catching > player.evalCatch ?
							<span ng-show="player.catching > player.evalCatch" className="negative">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>{ (player.evalCatch - player.catching) }
							</span>
							: "" 
							}
						</div>
						: ""
						}
					</td>
					<td>{ player.draftNumber }</td>
					<td>
						<div className={`${ player.coachProtect ? "draftProtected" : "" } ${ player.draftPick ? "draftPicked" : "" } ${ !player.draftPick && !player.coachProtect ? "draftAvailable" : "" }`}>
							{ `${ player.firstName } ${ player.lastName }` }
						</div>
						{
						player.team ?
						<div ng-show="player.draftTeam">
							{ player.team.coach }
						</div>
						: ""
						}
					</td>
					<td>
						{ player.requests }
						{
						player.coachRequest ?
						<div>
							Request: { player.coachRequest }
						</div>
						: ""
						}
					</td>
				</tr>,
				<tr key={ playerIndex } className={ `playerStats ${ player.id === selectedPlayerId ? "selected" : "" }`}>
					<td colSpan="6">
						{
						player.id === selectedPlayerId ?
						<div>
							<table>
							<thead>
							<tr>
								<th>Height</th>
								<th>Catch</th>
								<th>Speed</th>
								<th>Route</th>
								<th>Hands</th>
								<th>Draft</th>
								<th>Age</th>
								<th>Seasons</th>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td>
								{
								player.height == 1 ?
									<span className="negative">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>
									</span>
								: player.height == 2 ?
									<span className="warn">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
									</span>
								: player.height == 3 ?
									<span className="positive">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
									</span>
								:
									<span> - </span>
								}
								</td>
								<td>{ player.evalCatch }</td>
								<td>
								{
								player.speed == 1 ?
									<span className="negative">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>
									</span>
								: player.speed == 2 ?
									<span className="positive">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
									</span>
								:
									<span> - </span>
								}
								</td>
								<td>
								{
								player.route == 1 ?
									<span className="negative">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>
									</span>
								: player.route == 2 ?
									<span className="positive">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
									</span>
								:
									<span> - </span>
								}
								</td>
								<td>
								{
								player.hands == -1 ?
									<span ng-show="player.hands == -1" className="negative">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>
									</span>
								: player.hands == 1 ?
									<span className="positive">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
									</span>
								:
									<span> - </span>
								}
								</td>
								<td>
								{
								player.draftBlock === true ?
									<span className="negative">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>
									</span>
								: player.draftWatch ?
									<span className="positive">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
									</span>
								:
									<span> - </span>
								}
								</td>
								<td>{ player.age }</td>
								<td>{ player.prev.length }</td>
							</tr>
							</tbody>
							</table>
							
							<table className="playerStats">
							<thead>
							<tr>
								<th></th>
								<th>Rnk</th>
								<th>Rnd</th>
								<th>C</th>
								<th>T</th>
								<th>R</th>
								<th>Team</th>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td>{ `${ player.division.name } ${ player.division.year } ${ player.division.season } `}</td>
								<td>{ player.draftRank }</td>
								<td>{ player.draftRound }</td>
								<td>{ player.catching }</td>
								<td>{ player.throwing }</td>
								<td>{ player.runTime }</td>
								<td></td>
							</tr>
							{
							player.prev.map((season, seasonIndex) => 
							<tr key={ seasonIndex }>
								<td>{ season.division.name } { season.division.year } { season.division.season }</td>
								<td>{ season.draftRank }</td>
								<td>{ season.draftRound }</td>
								<td>{ season.catching }</td>
								<td>{ season.throwin }</td>
								<td>{ season.runTime }</td>
								<td>{ `${ season.team.coach } - ${ season.team.name }` }</td>
							</tr>
							)}
							</tbody>
							</table>
						</div>
						: ""
						}
					</td>
				</tr>
			])}
			</tbody>
			</table>
			
		</div>
	)
}

export default DraftPlayers;
