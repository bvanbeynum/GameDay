import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Play from "./components/play";
import "./css/common.css";
import "./css/playbook.css";

class PlayBook extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			documentStyle: null,
			documentHead: null,
			toast: { message: "", type: "info" }
		}
	};

	componentDidMount() {
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
			return;
		}

		const head = document.head || document.getElementsByTagName("head")[0],
			style = document.createElement("style");
	
		style.type = "text/css";
		style.media = "print";
		
		style.textContent = "@page { size: portrait }";
		head.appendChild(style);

		this.setState({
			documentHead: head,
			documentStyle: style
		});

		fetch("/api/playbookload")
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
					playBooks: data.playBooks
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});
	};

	changePlaybookName = playBookIndex => event => {
		this.setState(({ playBooks }) => ({
			playBooks: [
				...playBooks.slice(0, playBookIndex),
				{
					...playBooks[playBookIndex],
					name: event.target.value
				},
				...playBooks.slice(playBookIndex + 1)
			]
		}))
	};

	resortPlays = (changeIndex, direction) => {
		this.setState(({ selectedPlayBook }) => ({
			selectedPlayBook: {
				...selectedPlayBook,
				plays: selectedPlayBook.plays
					.map((play, playIndex) => ({
						...play,
						sort: playIndex === changeIndex ? play.sort + direction // Move the selected play in the direction indicated
							: playIndex === changeIndex + direction ? play.sort + (direction * -1) // move the play in the direction indicated in the opposite direction desired
							: play.sort
					}))
					.sort((playA, playB) => playA.sort - playB.sort)
			}
		}), () => {
			const updates = this.state.selectedPlayBook.plays
				.filter((play, playIndex) => playIndex === changeIndex || playIndex === changeIndex + direction)
				.map(play => ({ id: play.id, sort: play.sort }));

			fetch("/api/playbooksave", 
				{ 
					method: "post", 
					headers: {"Content-Type": "application/json"}, 
					body: JSON.stringify({ plays: updates })
				}
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
					if (data.errors && data.errors.length > 0) {
						console.warn(data.errors);
						this.setState({ toast: { text: "Error updating play sorting", type: "error" } });
					}
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error updating play sorting", type: "error" } });
				})
		});
	};

	savePlayBook = () => {
		const savePlayBook = this.state.editPlayBook ? this.state.playBooks.find(playBook => this.state.editPlayBook === playBook.id)
			: this.state.newPlaybook;

		fetch("/api/playbooksave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ playbook: savePlayBook }) })
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
					editPlayBook: null, 
					newPlaybook: null, 
					playBooks: data.playBooks,
					toast: { text: "Play book saved", type: "info" } 
				}));
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});
	};

	setPrintMode = mode => {
		const style = this.state.documentStyle;

		if (mode === "wrist") {
			this.state.documentHead.removeChild(style);
			style.textContent = "@page { size: landscape }";
			this.state.documentHead.appendChild(style);
		}
		else {
			this.state.documentHead.removeChild(style);
			style.textContent = "@page { size: portrait }";
			this.state.documentHead.appendChild(style);
		}

		this.setState({
			printMode: this.state.printMode === mode ? null : mode,
			documentStyle: style
		});
	}
	
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
			<div className="playBookPage">
				{
				!this.state.selectedPlayBook ?
				<div className="playBooksContainer">

					<div className="playBook">
						<div className={ `playBookName ${ this.state.newPlaybook ? "edit" : "" }` } onClick={ () => { if (!this.state.newPlaybook) { this.setState({ newPlaybook: { division: this.state.user.division, name: "" }}) } }}>
							{
							this.state.newPlaybook ?
								<input type="text" value={ this.state.newPlaybook.name } onChange={ event => this.setState(({ newPlaybook }) => ({ newPlaybook: { ...newPlaybook, name: event.target.value }})) } />
							: "New PlayBook"
							}
						</div>

						<div className="playBookEdit">
						{
						this.state.newPlaybook ?
							<div>
								{/* Thumbs up */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ this.savePlayBook }>
									<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
								</svg>
							</div>
						:
							<div></div>
						}
						</div>
					</div>

					{
					this.state.playBooks.map((playBook, playBookIndex) => (
					<div key={ playBook.id } className="playBook">
						<div className={ `playBookName ${ this.state.editPlayBook === playBook.id ? "edit" : "" }` } onClick={ () => { if (this.state.editPlayBook !== playBook.id) { this.setState({ selectedPlayBook: playBook }) } }}>
							<div>
							{
							this.state.editPlayBook === playBook.id ?
								<input type="text" value={ playBook.name } onChange={ this.changePlaybookName(playBookIndex) } />
							:
								`${ playBook.name } - ${ playBook.plays.length } plays` 
							}
							</div>
						</div>
						
						<div className="playBookEdit">
							{
							this.state.editPlayBook === playBook.id ?
							<div>
								{/* Thumbs up */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ this.savePlayBook }>
									<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
								</svg>
							</div>
							:
							// Edit
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.setState({ editPlayBook: playBook.id })}>
								<path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
							</svg>
							}
						</div>
					</div>
					))
					}
				</div>
				:
				<div className="playBookContainer">
					{
					!this.state.printMode ?
					<>
						<h2>{ this.state.selectedPlayBook.name }</h2>

						<div className="playsContainer">
							{
							this.state.selectedPlayBook.plays
							.sort((playA, playB) => playA.sort - playB.sort)
							.map((play, playIndex) =>
							
							<div key={ play.id } className="playContainer">
								<div onClick={ () => { window.location = `/playeditor.html?id=${ play.id }` }}>
									<Play play={ play } />
								</div>

								<div className="playInfoContainer">
									<div className="playInfo">{ `${ play.formation } ${ play.name }` }</div>
									
									<div className="playActions">
										<div className="playAction">
											{
											playIndex < this.state.selectedPlayBook.plays.length ?
											// Move down
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays(playIndex, 1) }>
												<path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
												<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
											</svg>
											: ""
											}
										</div>

										<div className="playAction">
											{
											playIndex > 0 ?
											// Move up
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays(playIndex, -1) }>
												<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/>
											</svg>
											: ""
											}
										</div>
									</div>
								</div>
							</div>
							)
							}
						</div>
					</>
					: this.state.printMode === "wrist" ?
	
					<div className="wristCoachContainer">
			
						<div className="wristCoach">
							{
							this.state.selectedPlayBook.plays.map(play => 
							<React.Fragment key={ play.id }>
								<div className="playCell flipped">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Left` }</div>
								</div>
								
								<div className="playCell">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Right` }</div>
								</div>
							</React.Fragment>
							)
							}
						</div>
						
						<div className="wristCoach">
							{
							this.state.selectedPlayBook.plays.map(play => 
							<React.Fragment key={ play.id }>
								<div className="playCell flipped">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Left` }</div>
								</div>
								
								<div className="playCell">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Right` }</div>
								</div>
							</React.Fragment>
							)
							}
						</div>
						
					</div>

					: this.state.printMode === "playsheet" ?

					<div className="playSheetContainer">

						<div className="playsheetPlays">
							{
							this.state.selectedPlayBook.plays.map(play => 
							<React.Fragment key={ play.id }>
								<div className="playsheetPlay flipped">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Left` }</div>
								</div>
								
								<div className="playsheetPlay">
									<Play play={ play } />
									<div className="playName">{ `${ play.formation } ${ play.name } Right` }</div>
								</div>
							</React.Fragment>
							)
							}
						</div>
						
						{/* <table className="playerColor">
						<tr>
							<th>Group</th>
							<th ng-repeat="routeColor in routeColors" ng-style="{'background-color': routeColor.color}">{{routeColor.color}}</th>
						</tr>
						<tr>
							<td>1</td>
							<td ng-repeat="routeColor in routeColors" ng-style="{'color': routeColor.color}">{{routeColor.group1}}</td>
						</tr>
						<tr>
							<td>2</td>
							<td ng-repeat="routeColor in routeColors" ng-style="{'color': routeColor.color}">{{routeColor.group2}}</td>
						</tr>
						</table> */}
						
					</div>

					: ""
					}

					<div className="playBookActions">
						<div className="playBookAction" onClick={ () => { this.setState({ selectedPlayBook: null }) }}>
							{/* Back */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="black"/>
							</svg>
						</div>

						<div className="playBookAction" onClick={ () => { window.location = "/playeditor.html" }}>
							{/* New */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
							</svg>
						</div>

						<div className={ `playBookAction ${ this.state.printMode === "playsheet" ? "selected" : "" }` } onClick={ () => { this.setPrintMode("playsheet") }}>
							{/* Clipboard */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>
							</svg>
						</div>

						<div className={ `playBookAction ${ this.state.printMode === "wrist" ? "selected" : "" }` } onClick={ () => { this.setPrintMode("wrist") }}>
							{/* Wrist */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M14.31 2l.41 2.48C13.87 4.17 12.96 4 12 4c-.95 0-1.87.17-2.71.47L9.7 2h4.61m.41 17.52L14.31 22H9.7l-.41-2.47c.84.3 1.76.47 2.71.47.96 0 1.87-.17 2.72-.48M16 0H8l-.95 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.05 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12s-1.19-4.81-3.04-6.27L16 0zm-4 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
							</svg>
						</div>
					</div>
					
				</div>
				}
			</div>
			}

			<Toast message={ this.state.toast } />
		</div>
	)};

}

ReactDOM.render(<PlayBook />, document.getElementById("root"));
