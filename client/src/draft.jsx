import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import DraftTeam from "./components/draftteam";
import "./css/common.css";
import "./css/draft.css";

class Draft extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			draftVersion: 0,
			players: [],
			teams: [],
			picks: [],
			toast: { text: "", type: "info" }
		};
	};
		
	componentDidMount() {		
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
		}

		fetch("/api/draftload")
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(data => {
				this.setState({
					isLoading: false,
					page: "team",
					user: data.user,
					players: data.players,
					teams: data.teams.map(team => ({ ...team, picks: [], draftRound: team.draftRound || "" }))
				}, () => {
					this.refreshDraft(this.state.teams, this.state.players, this.state.draftVersion);
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});
	};

	refreshDraft = (teams, players, version) => {

		if (+version == this.state.draftVersion) {
			const updatedPlayers = this.state.players.map(player => {
					const updated = players.find(update => player.id === update.id);
					return { ...player, draftPick: updated.draftPick || "" }
				}),
				picks = players.map((player, pickIndex) => {
					const pick = pickIndex + 1,
						round = Math.ceil((pick) / teams.length),
						pickPlayer = updatedPlayers.find(pickPlayer => pickPlayer.draftPick == pick) || null,
						draftNumber = round % 2 === 1 ? 
							(pick % teams.length) || teams.length
							: (teams.length + 1) - ((pick % teams.length) || teams.length);

					return {
						pick: pick,
						round: round,
						draftNumber: draftNumber,
						player: pickPlayer
					}
				}),
				updatedTeams = this.state.teams
					.map(team => {	
						const updated = teams.find(update => team.id === update.id);

						return { 
							...team, 
							picks: updated.draftRound ? picks.filter(pick => pick.draftNumber == updated.draftRound) : [], 
							draftRound: updated.draftRound || "" 
						}
					})
					.sort((teamA, teamB) => 
						teamA.draftRound && teamB.draftRound ? teamA.draftRound - teamB.draftRound
							: teamA.draftRound && !teamB.draftRound ? -1
							: !teamA.draftRound && teamB.draftRound ? 1
							: teamA.coach > teamB.coach ? 1 : -1
					);
			
			// console.log(`update version: ${ version }`);

			this.setState({
				draftVersion: +version + 1,
				isRefreshing: false,
				picks: picks,
				players: updatedPlayers,
				teams: updatedTeams
			}, () => {
				setTimeout(() => {
					if (!this.state.isRefreshing) {
						this.setState({ isRefreshing: true }, () => {
							fetch(`/api/draftrefresh?version=${ this.state.draftVersion }`,
								{ method: "post", headers: { "Content-Type": "application/json" } }
								)
								.then(response => {
									if (response.ok) {
										return response.json();
									}
									else {
										throw Error(response.statusText);
									}
								})
								.then(data => {
									this.refreshDraft(data.teams, data.players, data.version);
								});
						});
					}
					
				}, 5000);
			});
		}
	};

	changeDraftRound = teamId => event => {
		this.setState(({ teams, draftVersion }) => ({
			draftVersion: draftVersion + 1,
			isRefreshing: true,
			teams: teams
				.map(team => ({
					...team,
					draftRound: teamId === team.id ? event.target.value : team.draftRound
				}))
		}), () => {
			fetch(`/api/draftrefresh?version=${ this.state.draftVersion }`,
				{ method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ team: { id: teamId, draftRound: event.target.value } }) }
				)
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.refreshDraft(data.teams, data.players, data.version);
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});
	};

	setPick = (pickNumber, playerNumber) => {
		
		const selectedPlayer = this.state.players.find(player => player.draftNumber == playerNumber),
			selectedPick = this.state.picks.find(pick => pick.pick == pickNumber),
			updatedPicks = this.state.picks.map(pick => ({
				...pick,
				player: pickNumber == pick.pick ? selectedPlayer 
					: selectedPlayer && pick.player && pick.player.draftNumber == selectedPlayer.draftNumber ? null
					: pick.player
			})),
			updatedPlayers = this.state.players
				.filter(player => player.draftNumber == playerNumber || player.draftPick == pickNumber)
				.map(player => ({
					...player,
					draftPick: playerNumber == player.draftNumber ? pickNumber // Set pick number
						: player.draftPick == pickNumber ? null // Remove pick if already picked
						: player.draftPick,
					team: pickNumber ? 
						this.state.teams
							.filter(team => team.draftRound == selectedPick.draftNumber) 
							.map(team => ({ id: team.id, name: team.name, coach: team.coach }))[0]
						: null
				})),
			updatedTeams = this.state.teams.map(team => ({ ...team, picks: updatedPicks.filter(pick => pick.draftNumber == team.draftRound) }));

		this.setState(({ players, draftVersion }) => ({
			draftVersion: draftVersion + 1,
			isRefreshing: true,
			picks: updatedPicks,
			teams: updatedTeams,
			players: players.map(player => updatedPlayers.find(updated => updated.id === player.id) || player)
		}), () => {
			fetch(`/api/draftrefresh?version=${ this.state.draftVersion }`,
				{ method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ players: updatedPlayers }) }
				)
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(data => {
					this.refreshDraft(data.teams, data.players, data.version);
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});
		});

	};

	navBack = () => {
		window.location = "/schedule.html";
	};

	render() { 
		return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } teamName={ this.state.user.team.name } adminMenu={ this.state.user.modules } />

			{
			this.state.isLoading ?
			<div className="loading">
				<img alt="Loading" src="/media/images/loading.gif" />
			</div>
			:
			<div className="draftContainer">
				{
				this.state.page === "team" ?
					<DraftTeam teams={ this.state.teams } picks={ this.state.picks } players={ this.state.players } changeDraftRound={ this.changeDraftRound } setPick={ this.setPick } />
				: ""
				}

				<div className="draftNav">
					<div>
					{
					this.state.isRefreshing ?
						<svg viewBox="0 0 10 10" width="10" height="10">
							<circle cx="5" cy="5" r="5" fill="red" />
						</svg>
					: ""
					}
					</div>
					
					<div className="draftNavItem">
						<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
							<g>
								<path d="M12,12.75c1.63,0,3.07,0.39,4.24,0.9c1.08,0.48,1.76,1.56,1.76,2.73L18,18H6l0-1.61c0-1.18,0.68-2.26,1.76-2.73 C8.93,13.14,10.37,12.75,12,12.75z M4,13c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2s-2,0.9-2,2C2,12.1,2.9,13,4,13z M5.13,14.1 C4.76,14.04,4.39,14,4,14c-0.99,0-1.93,0.21-2.78,0.58C0.48,14.9,0,15.62,0,16.43V18l4.5,0v-1.61C4.5,15.56,4.73,14.78,5.13,14.1z M20,13c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2s-2,0.9-2,2C18,12.1,18.9,13,20,13z M24,16.43c0-0.81-0.48-1.53-1.22-1.85 C21.93,14.21,20.99,14,20,14c-0.39,0-0.76,0.04-1.13,0.1c0.4,0.68,0.63,1.46,0.63,2.29V18l4.5,0V16.43z M12,6c1.66,0,3,1.34,3,3 c0,1.66-1.34,3-3,3s-3-1.34-3-3C9,7.34,10.34,6,12,6z"/>
							</g>
						</svg>
					</div>
					
					<div className="draftNavItem">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
						</svg>
					</div>
					
					<div className="draftNavItem">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
						</svg>
					</div>
				</div>
			</div> 
			}

			<Toast message={ this.state.toast } />
		</div>
		)
	};

}

ReactDOM.render(<Draft />, document.getElementById("root"));
