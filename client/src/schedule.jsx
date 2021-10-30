import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Cookies from "universal-cookie";
import "./css/schedule.css";
import "./css/common.css";

class Schedule extends Component {
	constructor(props) {
		super(props);

		this.state = {
			confrences: [],
			schedule: [],
			isLoading: true,
			toast: { text: "", isActive: false, type: "info" }
		};
	}

	componentDidMount() {
        const cookies = new Cookies();
        const divisionId = cookies.get("division");

        if (!divisionId) {
            window.location = "/index.html";
        }

		fetch(`/api/scheduleload?divisionid=${ divisionId }`)
			.then(response => response.json())
			.then(data => {

				let confrences = [... new Set(data.teams.map(team => team.confrence || ""))]
					.map(confrence => ({
						name: confrence,
						teams: data.teams.filter(team => (team.confrence || "") === confrence)
							.map(team => ({ 
								...team,
								wins: data.games.filter(game =>
										(game.awayTeam.id === team.id && game.awayTeam.isWinner) ||
										(game.homeTeam.id === team.id && game.homeTeam.isWinner)
									).length,
								losses: data.games.filter(game =>
										(game.awayTeam.isWinner || game.homeTeam.isWinner) &&
										(
											(game.awayTeam.id === team.id && !game.awayTeam.isWinner) ||
											(game.homeTeam.id === team.id && !game.homeTeam.isWinner)
										)
									).length
							}))
					}));
				
				// Calculate ratio after wins & losses calculated
				confrences = confrences
					.sort((confrenceA, confrenceB) => confrenceA.name > confrenceB.name ? 1 : -1)
					.map(confrence => ({
						...confrence,
						teams: confrence.teams.map(team => ({
								...team,
								ratio: team.wins + team.losses > 0 ? (team.wins / (team.wins + team.losses)).toFixed(3) : 0
							}))
							.sort((teamA, teamB) => teamA.ratio !== teamB.ratio ? teamB.ratio - teamA.ratio : teamA.name > teamB.name ? 1 : -1)
					}));
				
				const games = data.games.map(game => {
					const dateTime = new Date(game.dateTime),
						dateOnly = new Date(dateTime);
					
					dateOnly.setHours(0,0,0,0);
					return { ...game, dateTime: dateTime, date: dateOnly };
				});

				const schedule = [... new Set(games.map(game => Date.parse(game.date)))]
					.sort((dateA, dateB) => dateA - dateB)
					.map((date) => ({
						name: new Date(date),
						isNext: date > Date.now(),
						games: games.filter(game => Date.parse(game.date) === date)
					}));

				this.setState({
					confrences: confrences,
					schedule: schedule,
					isLoading: false,
					data: data
				});

			})
			.catch(error => {
				console.log(error);
				this.showToast("Error loading schedule data", true);
			})
    }

	showToast = (message, isError) => {
		this.setState(({
			toast: {
				text: message,
				isActive: true,
				type: isError ? "error" : "info"
			}
		}), // After updating the state set a timer to clear toast
		() => {
			setTimeout(() => {
				this.setState({
					toast: {
						text: "",
						isActive: false,
						type: "info"
					}
				})
			}, 4000) // 4 seconds to clear
		})
	}
	
    render() { return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } />

			{
			this.state.isLoading ?
				<div className="loading">
					<img alt="Loading" src="/media/images/loading.gif" />
				</div>
			:
			<div className="scheduleContainer">
				<h2 className="scheduleHeader">Standings</h2>
		
				<div className="confrenceContainer">
				{
				this.state.confrences
					.map((confrence, confrenceIndex) => 
				
					<div key={ confrenceIndex } className="daySection confrence">
						<table>
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
						confrence.teams.map((team, teamIndex) => 
							<tr key={ teamIndex } ng-click="selectTeam(team)">
								<td><img src={ `/media/logos/${ team.name.toLowerCase() }.png` } /></td>
								<td>{team.name}</td>
								<td>{team.wins}</td>
								<td>{team.losses}</td>
								<td>{team.ratio}</td>
							</tr>
						)}
						</tbody>
						</table>
					</div>
				)}
				</div>
					
				<h2 className="scheduleHeader">Schedule</h2>
				
				<div>
				{
				this.state.schedule.map((gameDay, dayIndex) => 
				
					<div key={ dayIndex } className="daySection">
						<div className={`standingDate ${ gameDay.isNext ? "gameHighlight" : "" }`}>
							{ dayIndex + 1 } - { gameDay.name.toLocaleDateString() }
						</div>
						
						<div className="scheduleSection">
						{
						gameDay.games.map((game, gameIndex) => 
						
							<div key={ gameIndex } className="gameContainer">
								
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

						) }
						</div>
					</div>
				)}
				</div>
			</div>
            }

			<Toast message={ this.state.toast } />
		</div>
    ); }

}

ReactDOM.render(<Schedule />, document.getElementById("root"));