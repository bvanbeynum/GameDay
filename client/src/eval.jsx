import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/eval.css";

class Evaluation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			players: [],
			toast: { text: "", type: "info" }
		};
	}

	componentDidMount() {		
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
		}

		fetch("/api/evaluationload")
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(data => {
				this.setState(({
					user: data.user,
					isLoading: false,
					players: data.players
						.sort((playerA, playerB) => playerA.draftNumber - playerB.draftNumber)
						.map(player => ({
							...player,
							completed: player.height || player.evalCatch || player.route || player.speed || player.hands || player.draftBlock || player.draftWatch
						}))
				}));
			})
			.catch(error => {
				console.log(error);
				this.setState(({ toast: { message: "Error loading evaluation data", type: "error" } }));
			});

	};

	savePlayer = () => {
		this.setState(({ selectedPlayer, players }) => ({
			players: players.map(player => ({
				...player,
				height: (player.id === selectedPlayer.id ? selectedPlayer : player).height,
				evalCatch: (player.id === selectedPlayer.id ? selectedPlayer : player).evalCatch,
				route: (player.id === selectedPlayer.id ? selectedPlayer : player).route,
				speed: (player.id === selectedPlayer.id ? selectedPlayer : player).speed,
				hands: (player.id === selectedPlayer.id ? selectedPlayer : player).hands,
				draftBlock: (player.id === selectedPlayer.id ? selectedPlayer : player).draftBlock,
				draftWatch: (player.id === selectedPlayer.id ? selectedPlayer : player).draftWatch,
				completed: player.id === selectedPlayer.id ?
					selectedPlayer.height || selectedPlayer.evalCatch || selectedPlayer.route || selectedPlayer.speed || selectedPlayer.hands || selectedPlayer.draftBlock || selectedPlayer.draftWatch
					: player.completed,
				notes: (player.id === selectedPlayer.id ? selectedPlayer : player).notes
			}))
		}), () => {
			
			fetch("/api/evaluationsave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ player: this.state.selectedPlayer }) })
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(() => {
					this.setState(({
						selectedPlayer: null,
						toast: { text: "Player Saved", type: "info" }
					}));
				})
				.catch(error => {
					console.warn(error);
					this.setState({
						selectedPlayer: null,
						toast: { text: "Error saving player", type: "error" }
					});
				});
		});
		
	};

	resetPlayer = () => {
		this.setState(({ selectedPlayer }) => ({
			selectedPlayer: {
				...selectedPlayer,
				height: null,
				evalCatch: null,
				route: null,
				speed: null,
				hands: null,
				draftBlock: null,
				draftWatch: null
			}
		}), () => this.savePlayer());
	};

	cancel = () => {
		this.setState(({
			selectedPlayer: null
		}));
	};
	
	navBack = () => {
		window.location = "/schedule.html";
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
			<div className="evalPage">
				{ 
				this.state.players.map((player, playerIndex) => 
				<div key={ playerIndex } className={ `playerContainer ${ player.completed ? "completed" : "" } ${ player.coachProtect ? "protected" : "" } ${ !player.completed && !player.coachProtect ? "available" : "" }` } onClick={ () => { this.setState(({ selectedPlayer: player }))} }>
					<div className="draftNumber">{ player.draftNumber }</div>
					<div className="playerName">{ player.firstName } { player.lastName }</div>
					<div className="playerName">{ player.coachProtect }</div>
				</div>
				)}
			</div>
			}

			{
			this.state.selectedPlayer ?
			<div className={ `playerPopup ${ this.state.selectedPlayer ? "active" : "" }` }>
				<div className="popupheader">
					<h2 className="label">{ this.state.selectedPlayer.draftNumber }: { this.state.selectedPlayer.firstName } { this.state.selectedPlayer.lastName }</h2>
					
					<div onClick={ () => { this.savePlayer() } } className="button">
						<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
							<path d="M0 0h24v24H0z" fill="none"/>
							<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
						</svg>
					</div>
					
					<div onClick={ () => { this.resetPlayer() } } className="button">
						<svg height="24px" viewBox="0 0 24 24" width="24px" fill="white">
							<path d="M0 0h24v24H0V0z" fill="none"/>
							<path d="M14.12 10.47L12 12.59l-2.13-2.12-1.41 1.41L10.59 14l-2.12 2.12 1.41 1.41L12 15.41l2.12 2.12 1.41-1.41L13.41 14l2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z"/>
						</svg>
					</div>

					<div onClick={ () => { this.cancel() } } className="button">
						<svg viewBox="0 0 24 24" fill="white" width="24px" height="24px">
							<path d="M0 0h24v24H0z" fill="none"/>
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</div>
				</div>
				
				<div className="container">
					
					<h2 className="label">Draft</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem ${ this.state.selectedPlayer.draftBlock ? "selected" : "" }` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, draftBlock: !selectedPlayer.draftBlock } })) } }>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>
						</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.draftWatch ? "selected" : "" }` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, draftWatch: !selectedPlayer.draftWatch } })) } }>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M24 24H0V0h24v24z" fill="none"/><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>
						</div>
					</div>
					
					<h2 className="label">Height</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem small ${ this.state.selectedPlayer.height === 1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, height: 1 } })) } }>S</div>
						<div className={ `boxItem medium ${ this.state.selectedPlayer.height === 2 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, height: 2 } })) } }>M</div>
						<div className={ `boxItem tall ${ this.state.selectedPlayer.height === 3 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, height: 3 } })) } }>T</div>
					</div>
					
					<h2 className="label">Catch</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem ${ this.state.selectedPlayer.evalCatch === 1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, evalCatch: 1 } })) } }>1</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.evalCatch === 2 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, evalCatch: 2 } })) } }>2</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.evalCatch === 3 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, evalCatch: 3 } })) } }>3</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.evalCatch === 4 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, evalCatch: 4 } })) } }>4</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.evalCatch === 5 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, evalCatch: 5 } })) } }>5</div>
					</div>
					
					<h2 className="label">Route</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem ${ this.state.selectedPlayer.route === 1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, route: 1 } })) } }>Sloppy</div>
						<div className={ `boxItem sharp ${ this.state.selectedPlayer.route === 2 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, route: 2 } })) } }>Sharp</div>
					</div>
					
					<h2 className="label">Speed</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem ${ this.state.selectedPlayer.speed === 1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, speed: 1 } })) } }>&gt;&gt;</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.speed === 2 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, speed: 2 } })) } }>&gt;&gt;&gt;&gt;</div>
					</div>
					
					<h2 className="label">Hands</h2>
					
					<div className="dataContainer">
						<div className={ `boxItem ${ this.state.selectedPlayer.hands === -1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, hands: -1 } })) } }>
							<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M14.27,6C13.72,6.95,14.05,8.18,15,8.73c0.95,0.55,2.18,0.22,2.73-0.73c0.55-0.95,0.22-2.18-0.73-2.73 C16.05,4.72,14.82,5.05,14.27,6z"/><path d="M15.84,10.41c0,0-1.63-0.94-2.6-1.5c-2.38-1.38-3.2-4.44-1.82-6.82l-1.73-1C8.1,3.83,8.6,7.21,10.66,9.4l-5.15,8.92 l1.73,1l1.5-2.6l1.73,1l-3,5.2l1.73,1l6.29-10.89c1.14,1.55,1.33,3.69,0.31,5.46l1.73,1C19.13,16.74,18.81,12.91,15.84,10.41z"/><path d="M12.75,3.8c0.72,0.41,1.63,0.17,2.05-0.55c0.41-0.72,0.17-1.63-0.55-2.05c-0.72-0.41-1.63-0.17-2.05,0.55 C11.79,2.47,12.03,3.39,12.75,3.8z"/></g></g></svg>
						</div>
						<div className={ `boxItem ${ this.state.selectedPlayer.hands === 1 ? "selected" : ""}` } onClick={ () => { this.setState(({ selectedPlayer }) => ({ selectedPlayer: {...selectedPlayer, hands: 1 } })) } }>
							<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M23,5.5V20c0,2.2-1.8,4-4,4h-7.3c-1.08,0-2.1-0.43-2.85-1.19L1,14.83c0,0,1.26-1.23,1.3-1.25 c0.22-0.19,0.49-0.29,0.79-0.29c0.22,0,0.42,0.06,0.6,0.16C3.73,13.46,8,15.91,8,15.91V4c0-0.83,0.67-1.5,1.5-1.5S11,3.17,11,4v7 h1V1.5C12,0.67,12.67,0,13.5,0S15,0.67,15,1.5V11h1V2.5C16,1.67,16.67,1,17.5,1S19,1.67,19,2.5V11h1V5.5C20,4.67,20.67,4,21.5,4 S23,4.67,23,5.5z"/></g></g></g></svg>
						</div>
					</div>

					<h2 className="label">Notes</h2>

					<div className="dataContainer">
						<textarea className="dataComments" value={ this.state.selectedPlayer.notes } onChange={ event => this.setState(({ selectedPlayer }) => ({ selectedPlayer: { ...selectedPlayer, notes: event.target.value }})) }></textarea>
					</div>
					
				</div>
			</div>
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	); }

}

ReactDOM.render(<Evaluation />, document.getElementById("root"));
