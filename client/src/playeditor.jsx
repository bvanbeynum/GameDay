import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Play from "./components/play";
import PlayPopup from "./components/playpopup";
import "./css/common.css";
import "./css/playeditor.css";

class PlayEditor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			selectedColor: "red",
			toast: { message: "", type: "info" }
		}
	};

	componentDidMount() {
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
			return;
		}

		const queryString = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) });
		
		fetch(`/api/playeditorload${ queryString.id ? `?id=${ queryString.id }` : "" }`)
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
					user: data.user,
					playBooks: data.playBooks,
					play: data.play || { division: data.user.division, players: [], formation: "", name: "New" }
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	};

	savePlay = () => {
		fetch("/api/playeditorsave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ play: this.state.play }) })
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(() => {
				window.location = "/playbook.html";
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error saving play", type: "error" } });
			});
	};

	deletePlay = () => {
		fetch(`/api/playeditorsave?deleteid=${ this.state.play.id }`, { method: "post", headers: {"Content-Type": "application/json"} })
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(() => {
				window.location = "/playbook.html";
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error deleting play", type: "error" } });
			});
	};

	addPlayer = () => {
		this.setState(({ play }) => ({ 
			play: { 
				...play, 
				players: [ 
					...play.players, 
					{ 
						color: "red", 
						location: { x: 20, y: 390 },
						routeAction: "run",
						routeType: "straight"
					}
				] 
			} 
		}))
	};

	selectPlayer = playerIndex => {
		this.setState(({ play }) => ({ 
			selectedPlayerIndex: playerIndex,
			selectedColor: playerIndex ? play.players[playerIndex].color : "red"
		}))
	};

	delete = () => {
		if (this.state.selectedPlayerIndex >= 0) {
			if (this.state.selectedMode === "player") {
				this.setState(({ play, selectedPlayerIndex }) => ({
					play: {
						...play,
						players: [
							...play.players.slice(0, selectedPlayerIndex),
							...play.players.slice(selectedPlayerIndex + 1)
						]
					},
					selectedPlayerIndex: null,
					selectedColor: "",
					selectedMode: null
				}));
			}
			else if (this.state.selectedMode === "route") {
				this.setState(({ play, selectedPlayerIndex }) => ({
					play: {
						...play,
						players: play.players.map((player, playerIndex) => ({ ...player, route: playerIndex !== selectedPlayerIndex ? player.route : [] }))
					}
				}));
			}
		}
	};

	routeType = type => {
		if (this.state.selectedPlayerIndex >= 0) {
			this.setState(({ play }) => ({
				play: {
					...play,
					players: play.players.map((player, playerIndex) => ({
						...player,
						routeType: playerIndex === this.state.selectedPlayerIndex ? type : player.routeType
					}))
				}
			}));
		}
	};

	updatePlay = (updatedPlayer, updatedIndex) => {
		this.setState(({ play }) => ({ 
			play: {
				...play,
				players: [
					...play.players.slice(0, updatedIndex),
					updatedPlayer,
					...play.players.slice(updatedIndex + 1)
				]
			}
		}));
	};

	saveDetails = (playBookId, formation, name) => {
		this.setState(({ play }) => ({
			playEdit: false,
			play: {
				...play,
				playBookId: playBookId,
				formation: formation,
				name: name
			}
		}));
	};

	changeColor = event => {
		this.setState(({ play }) => ({
			selectedColor: event.target.value,
			play: {
				...play,
				players: play.players.map((player, playerIndex) => ({ ...player, color: playerIndex === this.state.selectedPlayerIndex ? event.target.value : player.color }))
			}
		}));
	};

	navBack = () => {
		window.location = "/playbook.html";
	};

	render() { return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } teamName={ this.state.user.team.name } adminMenu={ this.state.user.modules } />
			
			{
			this.state.isLoading ?
			<div className="loading">
				<img alt="Loading" src="/media/images/loading.gif" />
			</div>
			: 
			<div className="editorPage">
				<h2 className="playName">{ `${ this.state.play.formation || "" } ${ this.state.play.name || "" }` }</h2>

				<div className="playContainer">
					<Play play={ this.state.play } mode="edit" updatePlay={ this.updatePlay } selectedPlayerIndex={ this.state.selectedPlayerIndex } selectPlayer={ this.selectPlayer } selectedMode={ this.state.selectedMode } selectMode={ mode => this.setState({ selectedMode: mode })} />

					<div className="controlContainer">
						
						<div className="controlButton" onClick={ this.addPlayer }>
							{/* Add Player */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
							</svg>
						</div>
						
						<div className="controlButton" onClick={ this.delete }>
							{/* Delete */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</div>
						
						<div onClick={ () => { this.routeType("straight") }} className={ `controlButton ${ this.state.selectedMode === "route" && this.state.selectedPlayerIndex >= 0 && this.state.play.players[this.state.selectedPlayerIndex].routeType === "straight" ? "controlSelected" : "" }` }>
							{/* Straight */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path>
							</svg>
						</div>
						
						<div onClick={ () => { this.routeType("curved") }} className={ `controlButton ${ this.state.selectedMode === "route" && this.state.selectedPlayerIndex >= 0 && this.state.play.players[this.state.selectedPlayerIndex].routeType === "curved" ? "controlSelected" : "" }` }>
							{/* Curved */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"></path>
							</svg>
						</div>
						
						<div onClick={ () => { this.routeType("run") }} className={ `controlButton ${ this.state.selectedMode === "route" && this.state.selectedPlayerIndex >= 0 && this.state.play.players[this.state.selectedPlayerIndex].routeType === "run" ? "controlSelected" : "" }` }>
							{/* Run Route */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"></path>
							</svg>
						</div>
						
						<div className="controlButton">
							<select value={ this.state.selectedColor } onChange={ this.changeColor }>
								<option value="red">Red</option>
								<option value="blue">Blue</option>
								<option value="orange">Orange</option>
								<option value="green">Green</option>
								<option value="black">Black</option>
								<option value="purple">Purple</option>
								<option value="lightblue">Light Blue</option>
							</select>
						</div>
						
					</div>
				</div>

				<div className="actionContainer">
					<div className="action" onClick={ this.savePlay }>
						{/* Save */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path>
						</svg>
					</div>

					<div className="action" onClick={ () => { this.setState({ playEdit: true }) }}>
						{/* Edit */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
						</svg>
					</div>

					{
					this.state.play.id ?
					<div className="action" onClick= { () => { this.setState(({ play }) => ({ play: { ...play, id: null, name: "" } })) }}>
						{/* Copy */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
						</svg>
					</div>
					: ""
					}

					{
					this.state.play.id ?
					<div className="action" onClick={ this.deletePlay }>
						{/* Delete */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path>
						</svg>
					</div>
					: ""
					}
				</div>
					
			</div>
			}

			{
			this.state.playEdit ?
				<PlayPopup play={ this.state.play } playBooks={ this.state.playBooks} save={ this.saveDetails } close={ () => { this.setState({ playEdit: false }) }} />
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	)};

}

ReactDOM.render(<PlayEditor />, document.getElementById("root"));
