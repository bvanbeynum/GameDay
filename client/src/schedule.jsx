import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Standings from "./components/standings";
import Team from "./components/team";
import Game from "./components/game";
import PlayerPopup from "./components/playerpopup";
import GamePopup from "./components/gamepopup";
import Cookies from "universal-cookie";
import "./css/common.css";

class Schedule extends Component {
	constructor(props) {
		super(props);

		this.state = {
			confrences: [],
			schedule: [],
			managedTeam: {},
			popupPlayer: { prev: [] },
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
					players: team.players.map(player => ({
						...player,
						prev: player.prev.sort((prevA, prevB) => prevB.division.year !== prevA.division.year ? prevB.division.year - prevA.division.year : prevA.division.season < prevB.division.season ? -1 : 1),
						age: new Date(Date.now() - (new Date(player.dateOfBirth)).getTime()).getFullYear() - 1970,
						comments: 
							!player.height && !player.route && !player.speed && !player.hands && !player.draftBlock && !player.draftWatch ? "Didn't show at draft"
							: "Player " +
								(player.height == 1 ? "is short, " : "") +
								(player.height == 2 ? "is average height, " : "") +
								(player.height == 3 ? "is tall, " : "") +
								(player.hands == 1 ? "has good hands, " : "") +
								(player.hands == -1 ? "can't catch, " : "") +
								(player.speed == 1 ? "is slow, " : "") +
								(player.fast == 2 ? "is fast, " : "") +
								(player.route == 1 ? "has a sloppy route, " : "") +
								(player.route == 2 ? "has a sharp route, " : "") +
								(player.draftBlock ? "don't pickup.  " : "") +
								(player.draftWatch ? "pickup player.  " : "")
							})),
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

	editGame = () => {
		this.setState(({ isViewGame: true }));
	}

	saveGame = (winnerId, awayScore, homeScore) => {

		const updatedGame = {
			...this.state.selectedGame,
			awayTeam: {
				...this.state.selectedGame.awayTeam,
				isWinner: this.state.selectedGame.awayTeam.id === winnerId ? true : false,
				score: awayScore
			},
			homeTeam: {
				...this.state.selectedGame.homeTeam,
				isWinner: this.state.selectedGame.homeTeam.id === winnerId ? true : false,
				score: homeScore
			}
		};

		this.setState({ pageState: "loading" }, () => {

			fetch("/api/gamesave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ game: updatedGame }) })
			.then(response => {
				if (response.ok) {
					response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(data => {
				this.setState(({ schedule }) => ({
					schedule: schedule.map(day => ({
						...day,
						games: day.games.map(game => { return game.id === updatedGame.id ? updatedGame : game })
					})),
					selectedGame: updatedGame,
					pageState: "game",
					isViewGame: false
				}));
		
				this.showToast("Game saved");
			})
			.catch(error => {
				this.setState({ pageState: "game", isViewGame: false });
				
				console.warn(error);
				this.showToast("Error saving game", true);
			});

		})

	}

	closeGame = () => {
		this.setState({ isViewGame: false });
	}

	viewPlayer = (player) => {
		this.setState({
			popupPlayer: player,
			isViewPlayer: true
		});
		window.scrollTo({top: 0, behavior: "smooth"})
	}

	closePlayer = () => {
		this.setState({
			isViewPlayer: false
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
				<Team team={ this.state.selectedTeam } games={ this.state.teamGames } selectGame={ this.selectGame } viewPlayer={ this.viewPlayer } />
			
			: this.state.pageState === "game" ?
				<Game game={ this.state.selectedGame } viewPlayer={ this.viewPlayer } editGame={ this.editGame } />

			: ""
            }

			{
			this.state.pageState === "game" ?
				<GamePopup game={ this.state.selectedGame } isActive={ this.state.isViewGame } closeGame={ this.closeGame } saveGame={ this.saveGame } />
			: ""
			}

			<PlayerPopup player={ this.state.popupPlayer } isActive={ this.state.isViewPlayer } closePlayer={ this.closePlayer } />
			<Toast message={ this.state.toast } />
		</div>
    ); }

}

ReactDOM.render(<Schedule />, document.getElementById("root"));