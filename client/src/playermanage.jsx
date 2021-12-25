import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/playermanage.css";

class PlayerManager extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			players: [],
			playerSort: "draftNumber",
			playerSortDirection: 1,
			view: { draft: true, stats: true, family: true, requests: true },
			floatingMenuOpen: false,
			toast: { text: "", type: "info" }
		};
	}
	
	componentDidMount() {		
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
		}

		fetch("/api/playermanageload")
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
					players: data.players.sort((playerA, playerB) => playerA.draftNumber - playerB.draftNumber)
						.map(player => ({
							...player,
							dateOfBirth: new Date(player.dateOfBirth)
						})),
					playerAttributes: data.attributes
				}));
			})
			.catch(error => {
				console.log(error);
				this.setState(({ toast: { message: "Error loading player data", type: "error" } }));
			});
	};

	selectFile = event => {
		if (event.target.files && event.target.files.length === 1) {
			var reader = new FileReader(),
				file = event.target.files[0];

			reader.onload = event => {
				const file = {
					pointer: new Uint8Array(event.target.result),
					pointerIndex: 0,
					fileFormat: ""
				}
				
				if (file.pointer[0] == 0xef && file.pointer[1] == 0xbb && file.pointer[2] == 0xbf) {
					file.fileFormat = "utf8";
					file.pointerIndex = 3;
				}
				else if ((file.pointer[0] == 0xff && file.pointer[1] == 0xfe) || (file.pointer[0] == 0xfe && file.pointer[1] == 0xff)) {
					file.pointer = new Uint16Array(event.target.result);
					file.pointerIndex = 1;
				}

				// Get Header
				let headers = this.getLine(file);
				
				// Get rows
				const data = [];
				let line = this.getLine(file);
				
				while (line.length > 0 && line.join("").trim().length > 0) {
					data.push(line);
					line = this.getLine(file);
				}

				this.setState(({
					fileData: {
						mappings: headers.map((header, headerIndex) => ({ index: headerIndex, name: header, playerMap: "" })),
						players: data
					}
				}));
			};

			reader.readAsArrayBuffer(file);
		}
	};

	getLine = (file) => {
		const win1252 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255];
		let codeValue,
			line = [""],
			char,
			isEnclosed = false;
		
		while (file.pointerIndex < file.pointer.length && (isEnclosed || (!isEnclosed && file.pointer[file.pointerIndex] != 10 && file.pointer[file.pointerIndex] != 13))) {
			if (file.fileFormat == "utf8") {
				switch (file.pointer[file.pointerIndex] >> 4) { // shift the bits to check what type of code point (unicode)
				case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
					// 0xxx xxxx - standard code point regular text
					codeValue = file.pointer[file.pointerIndex];
					break;
				
				case 12: case 13:
					// 110x xxxx  10xx xxxx
					// get active bits, shift them 6 and append the active bits for pos 2
					codeValue = ((file.pointer[file.pointerIndex] & 0x1f) << 6) | (file.pointer[file.pointerIndex + 1] & 0x3f);
					file.pointerIndex += 1;
					break;
				
				case 14:
					// 1110 xxxx  10xx xxxx  10xx xxxx
					// get pos 1 active bits, shift them 12, append active pos2 bits shifted 6 and append the active bits for pos 3
					codeValue = ((file.pointer[file.pointerIndex] & 0x0f) << 12) | ((file.pointer[file.pointerIndex + 1] & 0x3f) << 6) | (file.pointer[file.pointerIndex + 2] & 0x3f);
				}
				
				char = codeValue;
			}
			else {
				char = win1252[file.pointer[file.pointerIndex]];
			}
			
			if (line[line.length - 1].length == 0 && char != 9 && !isEnclosed) {
				// New line, not additional delimiter
				if (line.length == 0 && char == 34) {
					// New line and char is enclosing char
					isEnclosed = true;
				}
				else {
					// Add char to the line
					line[line.length - 1] += String.fromCharCode(char);
				}
			}
			else if (char == 9 && !isEnclosed) {
				// Delimiter and not enclosed
				if (file.pointer[file.pointerIndex + 1] == 34 && !isEnclosed) {
					// Next value is an enclosing char
					isEnclosed = true;
					file.pointerIndex += 1;
				}
				
				// Add a new empty string to the array that will be populated next
				line.push("");
			}
			else if (char == 34 && isEnclosed) {
				// Is this the ending of the enclosing section
				if (file.pinter[file.pointerIndex + 1] == 34) {
					// If the double quote is escaped with another double quote
					line[line.length - 1] += String.fromCharCode(char); // Add the double quote
					file.pointerIndex += 1; // bypass the next double quote and leave as enclosed
				}
				else {
					// Encountered ending enclosing char
					isEnclosed = false;
				}
			}
			else {
				line[line.length - 1] += String.fromCharCode(char);
			}
			
			file.pointerIndex++;
		}
		
		// Increment past the line ending
		file.pointerIndex += 1;
		
		if (file.pointerIndex < file.pointer.length && (file.pointer[file.pointerIndex] == 10 || file.pointer[file.pointerIndex] == 13)) {
			// There is a line break or carridge return after the previous char
			file.pointerIndex += 1;
		}
		
		return line;
	};

	changeMapping = headerIndex => event => {
		this.setState(({ fileData }) => ({
			fileData: {
				...fileData,
				mappings: [
					...fileData.mappings.slice(0, headerIndex),
					{
						...fileData.mappings[headerIndex],
						playerMap: event.target.value
					},
					...fileData.mappings.slice(headerIndex + 1)
				]
			}
		}))
	};

	savePopup = () => {
		const filePlayers = this.state.fileData.players.map(player => 
				this.state.fileData.mappings
					.filter(mapping => mapping.playerMap)
					.reduce((array, value) => {
						if (player[value.index]) {
							return { ...array, [value.playerMap]: player[value.index] };
						}
						else {
							return array;
						}
					}, { division: this.state.user.division })
			),
			savePlayers = this.state.players
				.map(player => ({ ...player, ...filePlayers.find(filePlayer => filePlayer.draftNumber == player.draftNumber) }))
				.concat(
					filePlayers.filter(filePlayer => !this.state.players.some(player => player.draftNumber == filePlayer.draftNumber))
				);

		fetch(`/api/playermanagesave`, {method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ saveplayers: savePlayers })})
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
					fileData: null,
					isLoading: false,
					players: data.players.sort((playerA, playerB) => playerA.draftNumber - playerB.draftNumber)
						.map(player => ({
							...player,
							dateOfBirth: new Date(player.dateOfBirth)
						}))
				}));
			})
			.catch(error => {
				console.log(error);
				this.setState(({
					fileData: null,
					isLoading: false,
					toast: { message: "Error loading player data", type: "error" }
				}));
			});
	};

	sortPlayers = attribute => {
		const newDirection = this.state.playerSort === attribute ? -1 * this.state.playerSortDirection : 1;

		this.setState(({ players }) => ({
			playerSort: attribute,
			playerSortDirection: newDirection,
			players: players.sort((playerA, playerB) => {
				if (typeof (playerA[attribute] || playerB[attribute]) === "string") {
					return (playerA[attribute] || "zzzzzz").toLowerCase() > (playerB[attribute] || "zzzzzz").toLowerCase() ? newDirection : -1 * newDirection;
				}
				else {
					return (playerA[attribute] || 999) > (playerB[attribute] || 999) ? newDirection : -1 * newDirection;
				}
			})
		}));
	};

	calculateRanking = () => {
		const catchMin = Math.min(...this.state.players.filter(player => player.catching).map(player => player.catching)) - .1,
			catchMax = Math.max(...this.state.players.filter(player => player.catching).map(player => player.catching)) + .1,
			runMin = Math.min(...this.state.players.filter(player => player.runTime).map(player => player.runTime)) - .1,
			runMax = Math.max(...this.state.players.filter(player => player.runTime).map(player => player.runTime)) + .1,
			throwMin = Math.min(...this.state.players.filter(player => player.throwing).map(player => player.throwing)) - .1,
			throwMax = Math.max(...this.state.players.filter(player => player.throwing).map(player => player.throwing)) + .1,
			seasonsMin = Math.min(...this.state.players.map(player => player.prev.length)) - .1,
			seasonsMax = Math.max(...this.state.players.map(player => player.prev.length)) + .1,
			ageMin = Math.min(...this.state.players.map(player => Date.now() - player.dateOfBirth)) - .1,
			ageMax = Math.max(...this.state.players.map(player => Date.now() - player.dateOfBirth)) + .1,
			savePlayers = this.state.players
				.map(player => ({
					...player,
					brettRank: 
						(this.state.customRanking.runTime && player.runTime ? (((player.runTime - runMax) / (runMin - runMax)) * 100) * this.state.customRanking.runTime : 1) *
						(this.state.customRanking.catching && player.catching ? (((player.catching - catchMin) / (catchMax - catchMin)) * 100) * this.state.customRanking.catching : 1) *
						(this.state.customRanking.throwing && player.throwing ? (((player.throwing - throwMin) / (throwMax - throwMin)) * 100) * this.state.customRanking.throwing : 1) *
						(this.state.customRanking.seasons ? (((player.prev.length - seasonsMin) / (seasonsMax - seasonsMin)) * 100) * this.state.customRanking.seasons : 1) *
						(this.state.customRanking.age ? ((((Date.now() - player.dateOfBirth) - ageMin) / (ageMax - ageMin)) * 100) * this.state.customRanking.age : 1)
				}))
				.sort((playerA, playerB) => playerB.brettRank - playerA.brettRank)
				.map((player, playerIndex) => ({ ...player, brettRank: playerIndex + 1 }));
		
		this.setState(({ customRanking: null, isLoading: true }));

		fetch(`/api/playermanagesave`, {method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ saveplayers: savePlayers })})
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
					isLoading: false,
					playerSort: "brettRank",
					playerSortDirection: 1,
					toast: { message: "Rankings saved", type: "info" },
					players: data.players.sort((playerA, playerB) => playerA.brettRank - playerB.brettRank)
						.map(player => ({
							...player,
							dateOfBirth: new Date(player.dateOfBirth)
						}))
				}));
			})
			.catch(error => {
				console.log(error);
				this.setState(({
					isLoading: false,
					playerSort: "brettRank",
					playerSortDirection: 1,
					toast: { message: "Error saving rankings", type: "error" }
				}));
			});
			
	};

	selectPlayers = playerIndex => {
		if (playerIndex) {
			this.setState(({ players }) => ({
				players: [
					...players.slice(0, playerIndex),
					{
						...players[playerIndex],
						selected: !players[playerIndex].selected
					},
					...players.slice(playerIndex + 1)
				]
			}))
		}
		else {
			const selected = this.state.players.filter(player => player.selected).length !== this.state.players.length;

			this.setState(({ players }) => ({
				players: players.map(player => ({ ...player, selected: selected })),
				floatingMenuOpen: false
			}))
		}
	};

	deletePlayers = () => {
		const deleteIds = this.state.players
			.filter(player => player.selected)
			.map(player => player.id);
		
		this.setState(({ isLoading: true, floatingMenuOpen: false }));

		if (deleteIds.length > 0 ) {
			fetch(`/api/playermanagedelete`, {method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ playerids: deleteIds })})
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
						isLoading: false,
						playerSort: "draftNumber",
						playerSortDirection: 1,
						toast: { message: "Players deleted", type: "info" },
						players: data.players.sort((playerA, playerB) => playerA.draftNumber - playerB.draftNumber)
							.map(player => ({
								...player,
								dateOfBirth: new Date(player.dateOfBirth)
							}))
					}));
				})
				.catch(error => {
					console.log(error);
					this.setState(({
						isLoading: false,
						toast: { message: "Error saving rankings", type: "error" }
					}));
				});
		}
		else {
			this.setState(({ isLoading: false }));
		}
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
			<div className="managePage">
				
				<div className="viewPanel">
					{/* Draft */}
					<div className={ `viewButton ${ this.state.view.draft ? "active" : "" }` } onClick={ () => { this.setState(({ view }) => ({ view: { ...view, draft: !view.draft } })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M17 4h3v16h-3V4zM5 14h3v6H5v-6zm6-5h3v11h-3V9z"/>
						</svg>
					</div>
					
					{/* Stats */}
					<div className={ `viewButton ${ this.state.view.stats ? "active" : "" }` } onClick={ () => { this.setState(({ view }) => ({ view: { ...view, stats: !view.stats } })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
						</svg>
					</div>
					
					{/* Requested / Protected */}
					<div className={ `viewButton ${ this.state.view.requests ? "active" : "" }` } onClick={ () => { this.setState(({ view }) => ({ view: { ...view, requests: !view.requests } })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
							<path d="M10.5,13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13z M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2 z M18,11.09c0,4-2.55,7.7-6,8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6,2.25V11.09z"/>
						</svg>
					</div>
					
					{/* Family Info */}
					<div className={ `viewButton ${ this.state.view.family ? "active" : "" }` } onClick={ () => { this.setState(({ view }) => ({ view: { ...view, family: !view.family } })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
							<g>
								<path d="M16,4c0-1.11,0.89-2,2-2s2,0.89,2,2s-0.89,2-2,2S16,5.11,16,4z M20,22v-6h2.5l-2.54-7.63C19.68,7.55,18.92,7,18.06,7h-0.12 c-0.86,0-1.63,0.55-1.9,1.37l-0.86,2.58C16.26,11.55,17,12.68,17,14v8H20z M12.5,11.5c0.83,0,1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5 S11,9.17,11,10S11.67,11.5,12.5,11.5z M5.5,6c1.11,0,2-0.89,2-2s-0.89-2-2-2s-2,0.89-2,2S4.39,6,5.5,6z M7.5,22v-7H9V9 c0-1.1-0.9-2-2-2H4C2.9,7,2,7.9,2,9v6h1.5v7H7.5z M14,22v-4h1v-4c0-0.82-0.68-1.5-1.5-1.5h-2c-0.82,0-1.5,0.68-1.5,1.5v4h1v4H14z"/>
							</g>
						</svg>
					</div>
				</div>

				<table className="playerTable">
				<thead>
				<tr>
					<th onClick={ () => { this.sortPlayers("draftNumber") } } className={ this.state.playerSort === "draftNumber" ? "sorted" : "" }>#</th>
					<th onClick={ () => { this.sortPlayers("firstName") } } className={ this.state.playerSort === "firstName" ? "sorted" : "" }>First</th>
					<th onClick={ () => { this.sortPlayers("lastName") } } className={ this.state.playerSort === "lastName" ? "sorted" : "" }>Last</th>
					{ this.state.view.draft ? <th onClick={ () => { this.sortPlayers("draftRound") } } className={ this.state.playerSort === "draftRound" ? "sorted" : "" }>Round</th> : null }
					{ this.state.view.draft ? <th onClick={ () => { this.sortPlayers("draftRank") } } className={ this.state.playerSort === "draftRank" ? "sorted" : "" }>Rank</th> : null }
					{ this.state.view.draft ? <th onClick={ () => { this.sortPlayers("brettRank") } } className={ this.state.playerSort === "brettRank" ? "sorted" : "" }>B Rank</th> : null }
					{ this.state.view.stats ? <th onClick={ () => { this.sortPlayers("catching") } } className={ this.state.playerSort === "catching" ? "sorted" : "" }>Catch</th> : null }
					{ this.state.view.stats ? <th onClick={ () => { this.sortPlayers("throwing") } } className={ this.state.playerSort === "throwing" ? "sorted" : "" }>Throw</th> : null }
					{ this.state.view.stats ? <th onClick={ () => { this.sortPlayers("runTime") } } className={ this.state.playerSort === "runTime" ? "sorted" : "" }>Run Time</th> : null }
					{ this.state.view.stats ? <th onClick={ () => { this.sortPlayers("running") } } className={ this.state.playerSort === "running" ? "sorted" : "" }>Run</th> : null }
					{ this.state.view.requests ? <th onClick={ () => { this.sortPlayers("requests") } } className={ this.state.playerSort === "requests" ? "sorted" : "" }>Requests</th> : null }
					{ this.state.view.requests ? <th onClick={ () => { this.sortPlayers("coachProtect") } } className={ this.state.playerSort === "coachProtect" ? "sorted" : "" }>Coach Protect</th> : null }
					{ this.state.view.requests ? <th onClick={ () => { this.sortPlayers("coachRequest") } } className={ this.state.playerSort === "coachRequest" ? "sorted" : "" }>Coach Request</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("dateOfBirth") } } className={ this.state.playerSort === "dateOfBirth" ? "sorted" : "" }>DOB</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("parentName") } } className={ this.state.playerSort === "parentName" ? "sorted" : "" }>Parent</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("Phone") } } className={ this.state.playerSort === "Phone" ? "sorted" : "" }>Phone</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("parentEmail") } } className={ this.state.playerSort === "parentEmail" ? "sorted" : "" }>Email</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("shirtSize") } } className={ this.state.playerSort === "shirtSize" ? "sorted" : "" }>Size</th> : null }
					{ this.state.view.family ? <th onClick={ () => { this.sortPlayers("allergies") } } className={ this.state.playerSort === "allergies" ? "sorted" : "" }>Allergies</th> : null }
				</tr>
				</thead>
				<tbody>
				{
				this.state.players.map((player, playerIndex) => 
					<tr key={ playerIndex } onClick={ () => { this.selectPlayers(playerIndex) }} className={ player.selected ? "selected" : "" }>
					<td>{ player.draftNumber }</td>
					<td>{ player.firstName }</td>
					<td>{ player.lastName }</td>
					{ this.state.view.draft ? <td>{ player.draftRound }</td> : null }
					{ this.state.view.draft ? <td>{ player.draftRank }</td> : null }
					{ this.state.view.draft ? <td>{ player.brettRank }</td> : null }
					{ this.state.view.stats ? <td>{ player.catching }</td> : null }
					{ this.state.view.stats ? <td>{ player.throwing }</td> : null }
					{ this.state.view.stats ? <td>{ player.runTime }</td> : null }
					{ this.state.view.stats ? <td>{ player.running }</td> : null }
					{ this.state.view.requests ? <td>{ player.requests }</td> : null }
					{ this.state.view.requests ? <td>{ player.coachProtect }</td> : null }
					{ this.state.view.requests ? <td>{ player.coachRequest }</td> : null }
					{ this.state.view.family ? <td>{ player.dateOfBirth.toLocaleDateString() }</td> : null }
					{ this.state.view.family ? <td>{ player.parentName }</td> : null }
					{ this.state.view.family ? <td>{ player.Phone }</td> : null }
					{ this.state.view.family ? <td>{ player.parentEmail }</td> : null }
					{ this.state.view.family ? <td>{ player.shirtSize }</td> : null }
					{ this.state.view.family ? <td>{ player.allergies }</td> : null }
					</tr>
				)
				}
				</tbody>
				</table>
				
				<div className="floatingButtonContainer">
					{/* Delete */}
					<div className={ `floatingButton ${ this.state.floatingMenuOpen ? "active" : "" }` } onClick={ () => { this.deletePlayers() }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
						</svg>
					</div>

					{/* Select All */}
					<div className={ `floatingButton ${ this.state.floatingMenuOpen ? "active" : "" }` } onClick={ () => { this.selectPlayers() }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/>
						</svg>
					</div>

					{/* Rank Function */}
					<div className={ `floatingButton ${ this.state.floatingMenuOpen ? "active" : "" }` } onClick={ () => { this.setState(({ customRanking: {}, floatingMenuOpen: false })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
							<g><rect fill="none" height="24" width="24"/></g><g><g><path d="M15.82,7.22l-1,0.4c-0.21-0.16-0.43-0.29-0.67-0.39L14,6.17C13.98,6.07,13.9,6,13.8,6h-1.6c-0.1,0-0.18,0.07-0.19,0.17 l-0.15,1.06c-0.24,0.1-0.47,0.23-0.67,0.39l-1-0.4c-0.09-0.03-0.2,0-0.24,0.09l-0.8,1.38c-0.05,0.09-0.03,0.2,0.05,0.26l0.85,0.66 C10.02,9.73,10,9.87,10,10c0,0.13,0.01,0.26,0.03,0.39l-0.84,0.66c-0.08,0.06-0.1,0.17-0.05,0.25l0.8,1.39 c0.05,0.09,0.15,0.12,0.25,0.09l0.99-0.4c0.21,0.16,0.43,0.29,0.68,0.39L12,13.83c0.02,0.1,0.1,0.17,0.2,0.17h1.6 c0.1,0,0.18-0.07,0.2-0.17l0.15-1.06c0.24-0.1,0.47-0.23,0.67-0.39l0.99,0.4c0.09,0.04,0.2,0,0.24-0.09l0.8-1.39 c0.05-0.09,0.03-0.19-0.05-0.25l-0.83-0.66C15.99,10.26,16,10.13,16,10c0-0.14-0.01-0.27-0.03-0.39l0.85-0.66 c0.08-0.06,0.1-0.17,0.05-0.26l-0.8-1.38C16.02,7.22,15.91,7.19,15.82,7.22z M13,11.43c-0.79,0-1.43-0.64-1.43-1.43 S12.21,8.57,13,8.57s1.43,0.64,1.43,1.43S13.79,11.43,13,11.43z"/><path d="M19.94,9.06c-0.43-3.27-3.23-5.86-6.53-6.05C13.27,3,13.14,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48 C3.74,13.14,4.22,14,5,14h1v2c0,1.1,0.9,2,2,2h1v3h7v-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8 v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/></g></g>
						</svg>
					</div>

					{/* Upload File */}
					<div className={ `floatingButton ${ this.state.floatingMenuOpen ? "active" : "" }` }>
						<label htmlFor="fileSelector">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"/>
							</svg>
						</label>
					</div>
					
					{/* Close Menu */}
					<div className={ `floatingButton ${ this.state.floatingMenuOpen ? "active" : "" }` } onClick={ () => { this.setState(({ floatingMenuOpen: false })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
					</div>

					{/* Open Menu */}
					<div className={ `floatingButton ${ !this.state.floatingMenuOpen ? "active" : "" }` } onClick={ () => { this.setState(({ floatingMenuOpen: true })) }}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
						</svg>
					</div>
				</div>

				<input id="fileSelector" type="file" accept=".txt, .tab, .tsv, text/tab-separated-values" onChange={ this.selectFile } />

			</div>
			}

			{
			this.state.fileData ?
			<div className={ `popupBackground ${ this.state.fileData && this.state.fileData.mappings.length > 0 ? "active" : "" }` }>
				<div className="popup">
					<div className="popupHeader">

						<h2 className="label">Map File Fields</h2>
						
						<div onClick={ () => { this.setState(({ fileData: null })) }} className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
							</svg>
						</div>

						<div onClick={ () => { this.savePopup() }} className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
							</svg>
						</div>

					</div>
					
					<div className="popupContainer">
						{
						this.state.fileData.mappings.map((mapping, mappingIndex) => 
						<div key={ mappingIndex } className="popupFormRow">
							<div className="label">{ mapping.name }</div>
							<div className="popupFormInput">
								<select value={ mapping.playerMap } onChange={ this.changeMapping(mappingIndex) }>
									<option value="">Not Mapped</option>
									{
									this.state.playerAttributes.map((attribute, attributeIndex) =>
										<option key={ attributeIndex } value={ attribute }>{ attribute }</option>
									)
									}
								</select>
							</div>
						</div>
						)}

					</div>
				</div>
			</div>
			: ""
			}
			
			{
			this.state.customRanking ?
			<div className={ `popupBackground ${ this.state.customRanking ? "active" : "" }` }>
				<div className="popup">
					<div className="popupHeader">

						<h2 className="label">Custom Ranking</h2>
						
						<div onClick={ () => { this.setState(({ customRanking: null })) }} className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
							</svg>
						</div>

						<div onClick={ () => { this.calculateRanking() }} className="button">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
							</svg>
						</div>

					</div>
					
					<div className="popupContainer">
						<div className="popupFormRow">
							<div className="label">Catching</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.catching } onChange={ event => { this.state.customRanking.catching = event.target.value }} />
							</div>
						</div>
						
						<div className="popupFormRow">
							<div className="label">Running</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.runTime } onChange={ event => { this.state.customRanking.runTime = event.target.value }} />
							</div>
						</div>
						
						<div className="popupFormRow">
							<div className="label">Throwing</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.throwing } onChange={ event => { this.state.customRanking.throwing = event.target.value }} />
							</div>
						</div>
						
						<div className="popupFormRow">
							<div className="label">Height</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.height } onChange={ event => { this.state.customRanking.height = event.target.value }} />
							</div>
						</div>
						
						<div className="popupFormRow">
							<div className="label">Seasons</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.seasons } onChange={ event => { this.state.customRanking.seasons = event.target.value }} />
							</div>
						</div>
						
						<div className="popupFormRow">
							<div className="label">Age</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.customRanking.age } onChange={ event => { this.state.customRanking.age = event.target.value }} />
							</div>
						</div>
					</div>
				</div>
			</div>
			: ""
			}

			<Toast message={ this.state.toast } />
		</div>
	); }

}

ReactDOM.render(<PlayerManager />, document.getElementById("root"));
