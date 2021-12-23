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

	cancelPopup = () => {
		this.setState(({
			fileData: null
		}));
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
				<table className="playerTable">
				<thead>
				<tr>
					<th>#</th>
					<th>First</th>
					<th>Last</th>
					<th>Catch</th>
					<th>Throw</th>
					<th>Run Time</th>
					<th>Run</th>
					<th>DOB</th>
					<th>Parent</th>
					<th>Phone</th>
					<th>Email</th>
					<th>Size</th>
					<th>Requests</th>
					<th>Coach Protect</th>
					<th>Coach Request</th>
					<th>Medical</th>
				</tr>
				</thead>
				<tbody>
				{
				this.state.players.map((player, playerIndex) => 
					<tr key={ playerIndex }>
					<td>{ player.draftNumber }</td>
					<td>{ player.firstName }</td>
					<td>{ player.lastName }</td>
					<td>{ player.catching }</td>
					<td>{ player.throwing }</td>
					<td>{ player.runTime }</td>
					<td>{ player.running }</td>
					<td>{ player.dateOfBirth.toLocaleDateString() }</td>
					<td>{ player.parentName }</td>
					<td>{ player.Phone }</td>
					<td>{ player.parentEmail }</td>
					<td>{ player.shirtSize }</td>
					<td>{ player.requests }</td>
					<td>{ player.coachProtect }</td>
					<td>{ player.coachRequest }</td>
					<td>{ player.allergies }</td>
					</tr>
				)
				}
				</tbody>
				</table>

				<div className="uploadButton">
					<label htmlFor="fileSelector">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z"/>
						</svg>
					</label>
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
						
						<div onClick={ () => { this.cancelPopup() }} className="button">
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

			<Toast message={ this.state.toast } />
		</div>
	); }

}

ReactDOM.render(<PlayerManager />, document.getElementById("root"));
