import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Standings from "./components/standings";
import Team from "./components/team";
import Game from "./components/game";
import Cookies from "universal-cookie";
import "./css/common.css";

class Schedule extends Component {
	constructor(props) {
		super(props);

		this.state = {
			confrences: [],
			schedule: [],
			managedTeam: {},
			pageState: "loading",
			toast: { text: "", isActive: false, type: "info" }
		};
	}

	componentDidMount() {
        const cookies = new Cookies();
        const divisionId = cookies.get("division");

        if (!divisionId) {
            window.location = "/";
        }

		fetch(`/api/scheduleload?divisionid=${ divisionId }`)
			.then(response => response.json())
			.then(data => {

				data.teams = data.teams.map(team => ({
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

				let confrences = [... new Set(data.teams.map(team => team.confrence || ""))]
					.map(confrence => ({
						name: confrence,
						teams: data.teams.filter(team => (team.confrence || "") === confrence)
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
					return { 
						...game, 
						dateTime: dateTime, 
						date: dateOnly,
						awayTeam: {
							...data.teams.find(team => team.id === game.awayTeam.id),
							isWinner: game.awayTeam.isWinner,
							score: game.awayTeam.score
						},
						homeTeam: {
							...data.teams.find(team => team.id === game.homeTeam.id),
							isWinner: game.homeTeam.isWinner,
							score: game.homeTeam.score
						}
					};
				});

				const schedule = [... new Set(games.map(game => Date.parse(game.date)))]
					.sort((dateA, dateB) => dateA - dateB)
					.map((date) => ({
						name: new Date(date),
						isNext: date > Date.now(),
						games: games.filter(game => Date.parse(game.date) === date)
					}));

				const managedTeam = data.teams.find(team => team.isManaged);

				this.setState({
					confrences: confrences,
					schedule: schedule,
					managedTeam: managedTeam,
					games: games,
					pageState: "standings"
				});

			})
			.catch(error => {
				console.log(error);
				this.showToast("Error loading schedule data", true);
			})
    }
	
	navBack = () => {
		switch (this.state.pageState) {
		case "standings":
			window.location = "/";
			break;
		
		case "team":
			this.setState({ 
				selectTeam: null,
				teamGames: null,
				pageState: "standings"
			});
			break;
		
		case "game":
			this.setState({ 
				selectedGame: null,
				pageState: this.state.selectedTeam ? "team" : "standings"
			});

			break;
		}
	}

	selectTeam = (team) => {
		const teamGames = this.state.games.filter(game => game.awayTeam.id === team.id || game.homeTeam.id === team.id);

		this.setState({
			selectedTeam: team,
			teamGames: teamGames,
			pageState: "team"
		});
	}

	selectGame = (game) => {
		this.setState({
			selectedGame: game,
			pageState: "game"
		});
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
			<Toolbar navBack={ this.navBack } teamName={ this.state.managedTeam.name } adminMenu={ [] } />

			{
			this.state.pageState === "loading" ?
				<div className="loading">
					<img alt="Loading" src="/media/images/loading.gif" />
				</div>
			: this.state.pageState === "standings" ?
				<Standings confrences={ this.state.confrences } schedule={ this.state.schedule } selectTeam={ this.selectTeam } selectGame={ this.selectGame } />
			
			: this.state.pageState === "team" ?
				<Team team={ this.state.selectedTeam } games={ this.state.teamGames } selectGame={ this.selectGame } />
			
			: this.state.pageState === "game" ?
				<Game game={ this.state.selectedGame } />

			: ""
            }

			<Toast message={ this.state.toast } />
		</div>
    ); }

}

ReactDOM.render(<Schedule />, document.getElementById("root"));