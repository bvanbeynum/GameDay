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

		const queryString = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) });
		
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
					plays: data.plays,
					playBooks: data.playBooks.map(playBook => ({
						...playBook,
						plays: playBook.plays ? playBook.plays.map(playBookPlay => ({
							...data.plays.find(play => playBookPlay.playId === play.id),
							sort: playBookPlay.sort
						}))
						: []
					}))
				}, () => {
					if (queryString.playbookid === "all") {
						this.setState({ allPlays: true });
					}
					else if (queryString.playbookid) {
						this.setState({ selectedPlayBook: this.state.playBooks.find(playBook => playBook.id === queryString.playbookid) });
					}
				});
				
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});
	};

	createPlayBook = () => {
		const savePlayBook = { division: this.state.user.division, name: "New Playbook", offense: { positions: [] }, defense: { positions: [] }, plays: [] };

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
				this.setState(({ playBooks }) => ({ 
					playBooks: playBooks.concat([ { ...savePlayBook, id: data.id } ]),
					toast: { text: "Play book created", type: "info" } 
				}), () => {
					this.setState({
						selectedPlayBook: this.state.playBooks.find(playBook => playBook.id === data.id)
					});
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error creating playbook", type: "error" } });
			});

	};

	deletePlayBook = () => {
		
		fetch(`/api/playbooksave?deleteid=${ this.state.selectedPlayBook.id }`, { method: "post", headers: {"Content-Type": "application/json"} })
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(() => {
				this.setState(({ playBooks, selectedPlayBook }) => ({ 
					playBooks: playBooks.filter(playBook => playBook.id !== selectedPlayBook.id),
					selectedPlayBook: null,
					toast: { text: "Play book deleted", type: "info" } 
				}));
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error deleting playbook", type: "error" } });
			});

	}

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

	resortPlays = (strategy, changeIndex, direction) => {
		const offensePlays = this.state.selectedPlayBook.plays
				.filter(play => play.strategy === "offense")
				.map((play, playIndex) => ({
					...play,
					sort: play.strategy !== strategy ? play.sort // Don't update sorting if not the selected strategy (offense/defense)
						: playIndex === changeIndex ? play.sort + direction // Move the selected play in the direction indicated
						: playIndex === changeIndex + direction ? play.sort + (direction * -1) // move the play in the direction indicated in the opposite direction desired
						: play.sort
				}))
				.sort((playA, playB) => playA.sort - playB.sort),
			defensePlays = this.state.selectedPlayBook.plays
			.filter(play => play.strategy === "defense")
			.map((play, playIndex) => ({
				...play,
				sort: play.strategy !== strategy ? play.sort // Don't update sorting if not the selected strategy (offense/defense)
					: playIndex === changeIndex ? play.sort + direction // Move the selected play in the direction indicated
					: playIndex === changeIndex + direction ? play.sort + (direction * -1) // move the play in the direction indicated in the opposite direction desired
					: play.sort
			}))
			.sort((playA, playB) => playA.sort - playB.sort);

		this.setState(({ selectedPlayBook }) => ({
			selectedPlayBook: {
				...selectedPlayBook,
				plays: [ ...offensePlays, ...defensePlays ]
			}
		}), () => {
			const updatePlaybook = { ...this.state.selectedPlayBook, plays: this.state.selectedPlayBook.plays.map(play => ({ playId: play.id, sort: play.sort })) };

			fetch("/api/playbooksave", 
				{ 
					method: "post", 
					headers: {"Content-Type": "application/json"}, 
					body: JSON.stringify({ playbook: updatePlaybook })
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
		this.setState(({ editPlayBook, playBookName }) => ({
			selectedPlayBook: { ...editPlayBook, name: playBookName }
		}), () => {

			const savePlayBook = {
				...this.state.selectedPlayBook,
				name: this.state.playBookName,
				plays: this.state.editPlayBook.plays.map(play => ({ playId: play.id, sort: play.sort }))
			};
			
			fetch("/api/playbooksave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ playbook: savePlayBook }) })
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					else {
						throw Error(response.statusText);
					}
				})
				.then(() => {
					this.setState(({ playBooks }) => ({ 
						editPlayBook: null, 
						playBookName: null, 
						toast: { text: "Play book saved", type: "info" } 
					}));
				})
				.catch(error => {
					console.warn(error);
					this.setState({ toast: { text: "Error loading data", type: "error" } });
				});

		})
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
		if (this.state.selectedPlayBook) {
			this.setState({ selectedPlayBook: null });
		}
		else if (this.state.allPlays) {
			this.setState({ allPlays: false });
		}
		else {
			window.location = "/schedule.html";
		}
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
				this.state.allPlays ?
					<>
					<div className="playBookHeader">
						<h2>All Plays</h2>
						
						<select value={ this.state.filterPlayBookId } onChange={ event => { this.setState({ filterPlayBookId: event.target.value }) }}>
							<option value="">Filter Playbook</option>
							{
							this.state.playBooks.map(playBook =>
								<option key={ playBook.id } value={ playBook.id }>{ playBook.name }</option>
							)
							}
						</select>
					</div>
					
					<div className="playsContainer">
						{
						this.state.plays
						.filter(play => !this.state.filterPlayBookId || this.state.playBooks.find(playBook => playBook.id === this.state.filterPlayBookId).plays.some(playBookPlay => playBookPlay.id === play.id))
						.sort((playA, playB) => playA.formation > playB.formation ? 1
							: playA.formation < playB.formation ? -1
							: playA.name > playB.name ? 1
							: -1
						)
						.map((play) =>
						
						<div key={ play.id } className="playContainer">
							<div onClick={ () => { window.location = `/playeditor.html?id=${ play.id }&playbookid=all` }}>
								<Play play={ play } />
							</div>

							<div className="playInfoContainer">
								<div className="playInfo">{ `${ play.formation } ${ play.name }` }</div>
							</div>
						</div>
						)
						}
					</div>

					<div className="playBookActions">
						<div className="playBookAction" onClick={ () => { window.location = "/playeditor.html?playbookid=all" }}>
							{/* New */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
							</svg>
						</div>
					</div>
					</>

				: this.state.selectedPlayBook ?
					<div className="wristCenter">
					{
					this.state.printMode === "wrist" ?
	
					<div className="wristCoachContainer">
			
						<div className="wristCoach">
							{
							this.state.selectedPlayBook.plays
							.filter(play => play.strategy === "offense")
							.map(play => 
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
							this.state.selectedPlayBook.plays
							.filter(play => play.strategy === "offense")
							.map(play => 
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
					<>

					<div className="playSheetContainer">

						<div className="playsheetSection">
							<h4>Offense</h4>

							<div className="playsheetPlays">
								{
								this.state.selectedPlayBook.plays
								.filter(play => play.strategy === "offense")
								.map(play => 
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
						</div>
						
						<div className="playsheetSection">
							<h4>Defense</h4>

							<div className="playsheetPlays">
								{
								this.state.selectedPlayBook.plays
								.filter(play => play.strategy === "defense")
								.map(play => 
									<div key={ play.id } className="playsheetPlay">
										<Play play={ play } />
										<div className="playName">{ `${ play.formation } ${ play.name }` }</div>
									</div>
								)
								}
							</div>
						</div>

					</div>

					<div className="depthChartContainer">
						<div>
							<h4>Offense</h4>

							<table>
							<thead>
							<tr>
								<th>Color</th>
								<th>Group 1</th>
								<th>Group 2</th>
							</tr>
							</thead>
							<tbody>
							{
							this.state.selectedPlayBook.offense.positions
								.sort((positionA, positionB) => positionA.color > positionB.color ? 1 : -1)
								.map((position, positionIndex) =>
							<tr key={ positionIndex }>
								<td>
									<div className="colorBoxContainer">
										<div className="colorBox" style={{ backgroundColor: position.color }}></div>
										{ position.color.slice(0, 1).toUpperCase() + position.color.slice(1) }
									</div>
								</td>
								<td>{ position.group1 && position.group1.firstName ? `${ position.group1.firstName } ${ position.group1.lastName }` : "" }</td>
								<td>{ position.group2 && position.group2.firstName ? `${ position.group2.firstName } ${ position.group2.lastName }` : "" }</td>
							</tr>
							)
							}
							</tbody>
							</table>
						</div>
						
						<div>
							<h4>Defense</h4>
							<table>
							<thead>
							<tr>
								<th>Color</th>
								<th>Group 1</th>
								<th>Group 2</th>
							</tr>
							</thead>
							<tbody>
							{
							this.state.selectedPlayBook.defense.positions
								.sort((positionA, positionB) => positionA.color > positionB.color ? 1 : -1)
								.map((position, positionIndex) =>
							<tr key={ positionIndex }>
								<td>
									<div className="colorBoxContainer">
										<div className="colorBox" style={{ backgroundColor: position.color }}></div>
										{ position.color.slice(0, 1).toUpperCase() + position.color.slice(1) }
									</div>
								</td>
								<td>{ position.group1 && position.group1.firstName ? `${ position.group1.firstName } ${ position.group1.lastName }` : "" }</td>
								<td>{ position.group2 && position.group2.firstName ? `${ position.group2.firstName } ${ position.group2.lastName }` : "" }</td>
							</tr>
							)
							}
							</tbody>
							</table>
						</div>
					</div>
					
					<table className="scoreboard">
					<tbody>
					<tr>
						<td>{ this.state.user.team.name }</td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
					</tr>
					<tr>
						<td>Opponent</td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
						<td><svg viewBox="0 0 40 40"><line x1="0" y1="40" x2="40" y2="0"></line></svg></td>
					</tr>
					</tbody>
					</table>

					</>
					: !this.state.printMode ?
					
					<>
						<div className="playBookHeader">
							{
							this.state.editPlayBook ?
							<div className="playbookEdit">
								<input type="text" value={ this.state.playBookName } onChange={ event => { this.setState(({ playBookName }) => ({ playBookName: event.target.value })) }} />

								{/* Yes */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ this.savePlayBook }>
									<path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"></path>
								</svg>

								{/* No */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { this.setState({ playBookName: null, editPlayBook: null }) }}>
									<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"></path>
								</svg>
							</div>
							:
							<h2>
								{ this.state.selectedPlayBook.name }
								{/* Edit */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => { this.setState({ editPlayBook: this.state.selectedPlayBook, playBookName: this.state.selectedPlayBook.name }) }}>
									<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
								</svg>
							</h2>
							}
						</div>

						<h4>Offense</h4>
						
						<div className="playsContainer">
							{
							this.state.selectedPlayBook.plays
							.filter(play => play.strategy === "offense")
							.sort((playA, playB) => playA.sort - playB.sort)
							.map((play, playIndex) =>
							
							<div key={ play.id } className="playContainer">
								<div onClick={ () => { window.location = `/playeditor.html?id=${ play.id }&playbookid=${ this.state.selectedPlayBook.id }` }}>
									<Play play={ play } />
								</div>

								<div className="playInfoContainer">
									<div className="playInfo">{ `${ play.formation } ${ play.name }` }</div>
									
									<div className="playActions">
										<div className="playAction">
											{
											playIndex > 0 ?
											// Move up
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays("offense", playIndex, -1) }>
												<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/>
											</svg>
											: ""
											}
										</div>
										
										<div className="playAction">
											{
											playIndex < this.state.selectedPlayBook.plays.length - 1 ?
											// Move down
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays("offense", playIndex, 1) }>
												<path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
												<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
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
						
						<h4>Defense</h4>
						
						<div className="playsContainer">
							{
							this.state.selectedPlayBook.plays
							.filter(play => play.strategy === "defense")
							.sort((playA, playB) => playA.sort - playB.sort)
							.map((play, playIndex) =>
							
							<div key={ play.id } className="playContainer">
								<div onClick={ () => { window.location = `/playeditor.html?id=${ play.id }&playbookid=${ this.state.selectedPlayBook.id }` }}>
									<Play play={ play } />
								</div>

								<div className="playInfoContainer">
									<div className="playInfo">{ `${ play.formation } ${ play.name }` }</div>
									
									<div className="playActions">
										<div className="playAction">
											{
											playIndex > 0 ?
											// Move up
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays("defense", playIndex, -1) }>
												<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/>
											</svg>
											: ""
											}
										</div>
										
										<div className="playAction">
											{
											playIndex < this.state.selectedPlayBook.plays.length - 1 ?
											// Move down
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={ () => this.resortPlays("defense", playIndex, 1) }>
												<path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/>
												<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
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
					: ""
					}

					<div className="playBookActions">
						<div className="playBookAction" onClick={ () => { window.location = `/depthchart.html?id=${ this.state.selectedPlayBook.id }` }}>
							{/* Rotation */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
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
						
						<div className="playBookAction" onClick={ () => { this.deletePlayBook() }}>
							{/* Delete */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</div>
					</div>

				</div>
				:
				<div>
					<div className="playBooksContainer">
						<div className="playBook">
							<div className="playBookName" onClick={ () => { this.setState({ allPlays: true }) }}>All Plays</div>
						</div>
					</div>

					<h2>Playbooks</h2>

					<div className="playBooksContainer">

						{
						this.state.playBooks.map((playBook) => (
						<div key={ playBook.id } className="playBook">
							<div className="playBookName" onClick={ () => { this.setState({ selectedPlayBook: playBook }) }}>
								{ playBook.name } - { playBook.plays.length } plays
							</div>
						</div>
						))
						}
						
						<div className="playBook">
							<div className="playBookName" onClick={ () => { this.createPlayBook() }}>
								*New
							</div>
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
