import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/depthchart.css";

class DepthChart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			toast: { message: "", type: "info" }
		}
	}

	componentDidMount() {
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
			return;
		}

		const queryString = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) });
		
		fetch(`/api/depthchartload?id=${ queryString.id }`)
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
					players: data.players.sort((playerA, playerB) => (playerA.firstName + playerA.lastName).toLowerCase() > (playerB.firstName + playerB.lastName).toLowerCase() ? 1 : -1),
					colors: data.colors,
					playBook: {
						...data.playBook,
						offense: data.playBook.offense || { positions: data.colors.map(color => ({ color: color })) },
						defense: data.playBook.defense || { positions: data.colors.map(color => ({ color: color })) }
					}
				});
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	};

	selectPosition = (strategy, positionIndex, group) => event => {
		this.setState(({ playBook }) => ({
			playBook: {
				...playBook,
				[strategy]: { positions: [
					...playBook[strategy].positions.slice(0, positionIndex),
					{
						...playBook[strategy].positions[positionIndex],
						[`group${ group }`]: event.target.value
					},
					...playBook[strategy].positions.slice(positionIndex + 1)
				] }
			}
		}));
	};

	save = () => {
		
		fetch("/api/depthchartsave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ playbook: this.state.playBook }) })
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(() => {
				window.location = `/playbook.html?playbookid=${ this.state.playBook.id }`;
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error loading data", type: "error" } });
			});

	}

	navBack = () => {
		window.location = `/playbook.html?playbookid=${ this.state.playBook.id }`;
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
			<div className="depthChartPage">
				<h2>Offense</h2>

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
				this.state.playBook.offense.positions
					.sort((positionA, positionB) => positionA.color > positionB.color ? 1 : -1)
					.map((position, positionIndex) =>
				<tr key={ positionIndex }>
					<td>{ position.color }</td>
					<td>
						<select value={ position.group1 } onChange={ this.selectPosition("offense", positionIndex, 1) }>
							<option value=""> &mdash; </option>
							{
							this.state.players.map(player =>
								<option key={ player.id } value={ player.id }>{ `${ player.firstName } ${ player.lastName }` }</option>
							)
							}
						</select>
					</td>
					<td>
						<select value={ position.group2 } onChange={ this.selectPosition("offense", positionIndex, 2) }>
							<option value=""> &mdash; </option>
							{
							this.state.players.map(player =>
								<option key={ player.id } value={ player.id }>{ `${ player.firstName } ${ player.lastName }` }</option>
							)
							}
						</select>
					</td>
				</tr>
				)
				}
				</tbody>
				</table>
				
				<h2>Defense</h2>
				
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
				this.state.playBook.defense.positions
					.sort((positionA, positionB) => positionA.color > positionB.color ? 1 : -1)
					.map((position, positionIndex) =>
				<tr key={ positionIndex }>
					<td>{ position.color }</td>
					<td>
						<select value={ position.group1 } onChange={ this.selectPosition("defense", positionIndex, 1) }>
							<option value=""> &mdash; </option>
							{
							this.state.players.map(player =>
								<option key={ player.id } value={ player.id }>{ `${ player.firstName } ${ player.lastName }` }</option>
							)
							}
						</select>
					</td>
					<td>
						<select value={ position.group2 } onChange={ this.selectPosition("defense", positionIndex, 2) }>
							<option value=""> &mdash; </option>
							{
							this.state.players.map(player =>
								<option key={ player.id } value={ player.id }>{ `${ player.firstName } ${ player.lastName }` }</option>
							)
							}
						</select>
					</td>
				</tr>
				)
				}
				</tbody>
				</table>
				
				<div className="depthChartActions">
					<div className="depthChartAction" onClick={ () => { this.save() }}>
						{/* Save */}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path>
						</svg>
					</div>
				</div>
			</div>
			}

			<Toast message={ this.state.toast } />
		</div>
	)};
};

ReactDOM.render(<DepthChart />, document.getElementById("root"));
