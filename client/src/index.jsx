import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import Cookies from "universal-cookie";
import "./css/index.css";
import "./css/common.css";

class Index extends Component {
	constructor(props) {
		super(props);

		const cookies = new Cookies();
		cookies.remove("division");

		this.state = {
			divisions: [],
			isLoading: true,
			toast: { text: "", isActive: false, type: "info" }
		};
	}

	componentDidMount() {
		fetch("/api/divisionload")
			.then(response => response.json())
			.then(data => {
				this.loadDivisions(data);
			})
			.catch(error => {
				console.log(`error: ${ error.message }`);
				this.setState(({ toast: { text: "There was an error loading", type: "error" } }));
			});
	};

	loadDivisions = (serverData) => {
		const divisions = [... new Set(serverData.teams.map(team => team.division.name))] // get the unique names of the divisions
			.map(division => ({
				name: division,
				age: +(division.replace(/u/i, "")), // convert the name to an int for sorting
				teams: serverData.teams
					.filter(team => team.division.name === division)
					.sort((teamA, teamB) => 
						teamA.division.year !== teamB.division.year ?
							teamB.division.year - teamA.division.year // Primarily sort by year
						:
							teamA.division.season > teamB.division.season ? 1 : -1 // If year is same, sort by season
					)
			}))
			.sort((divisionA, divisionB) => divisionB.age - divisionA.age); // sort the divisions by age group
		
		this.setState({
			divisions: divisions,
			isLoading: false
		});
	}

	selectTeam = (divisionIndex, teamIndex) => {
		const team = this.state.divisions[divisionIndex].teams[teamIndex];

		const cookies = new Cookies();
		cookies.set("division", team.division.id, { path: "/" });
		
		window.location = "/schedule.html";
	};

	addDivision = () => {
		this.setState(({ newDivision: { year: (new Date()).getFullYear(), season: "spring", name: "13U", teamName: "", teamCoach: "" } }));
	};

	cancelPopup = () => {
		this.setState(({ newDivision: null }));
	};

	savePopup = () => {
		fetch("/api/divisionsave", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ teamdivision: this.state.newDivision })})
			.then(response => response.json())
			.then(data => {
				this.loadDivisions(data);
				
				this.setState(({ 
					newDivision: null,
					toast: { text: "Division added", type: "info" } 
				}));
			})
			.catch(error => {
				console.log(`error: ${ error.message }`);
				this.setState(({ toast: { text: "Error saving division", type: "error" } }));
			});
	};

	changeYear = () => event => {
		this.setState(({ newDivision }) => ({
			newDivision: { ...newDivision, year: event.target.value }
		}));
	};

	changeSeason = () => event => {
		this.setState(({ newDivision }) => ({
			newDivision: { ...newDivision, season: event.target.value }
		}));
	};

	changeName = () => event => {
		this.setState(({ newDivision }) => ({
			newDivision: { ...newDivision, name: event.target.value }
		}));
	};

	changeTeamName = () => event => {
		this.setState(({ newDivision }) => ({
			newDivision: { ...newDivision, teamName: event.target.value }
		}));
	};

	changeTeamCoach = () => event => {
		this.setState(({ newDivision }) => ({
			newDivision: { ...newDivision, teamCoach: event.target.value }
		}));
	};

	render() { return (
		<div className="pageContainer">
			<Toolbar navBack={ {} } />

			{
			this.state.isLoading ?
				<div className="loading">
					<img alt="Loading" src="/media/images/loading.gif" />
				</div>
			:
			<div className="divisionContainer">
				{
				this.state.divisions.map((division, divisionIndex) => (
				<div key={ divisionIndex } className="teams">
					
					<div className="titleContainer">
						<div className="titleLine"></div>
						<div className="titleText">
							<div>{ division.name }</div>
						</div>
					</div>
					
					<div className="teamsContainer">
					{
					division.teams.map((team, teamIndex) => (
						<div key={ teamIndex } onClick={ () => { this.selectTeam(divisionIndex, teamIndex) } } className="team">
							<div><img src={ `/media/logos/${ team.name.replace(/[ ]*/g, "").toLowerCase() }.png` } /></div>
							<div>{ team.name }</div>
							<div className="teamSeason">{ team.division.season } - { team.division.year }</div>
						</div>
					))}
					</div>
				</div>
				))}
				
				<div className="floatingButton" onClick={ () => { this.addDivision() }}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
					</svg>
				</div>

			</div>
			}

			{
			this.state.newDivision ?
			<div className={ `popupBackground active` }>
				<div className="popup">
					<div className="popupHeader">

						<h2 className="label">Add New Division</h2>
						
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
						
						<div className="popupFormRow">
							<div className="label">Year</div>

							<div className="popupFormInput">
								<input type="number" value={ this.state.newDivision.year } onChange={ this.changeYear() } />
							</div>
						</div>

						<div className="popupFormRow">
							<div className="label">Season</div>

							<div className="popupFormInput">
								<select value={ this.state.newDivision.season } onChange={ this.changeSeason() }>
									<option value="spring">Spring</option>
									<option value="summer">Summer</option>
									<option value="fall">Fall</option>
								</select>
							</div>
						</div>

						<div className="popupFormRow">
							<div className="label">Division</div>

							<div className="popupFormInput">
								<select value={ this.state.newDivision.name } onChange={ this.changeName() }>
									<option value="13U">13U</option>
									<option value="10U">10U</option>
									<option value="8U">8U</option>
									<option value="6U">6U</option>
								</select>
							</div>
						</div>

						<div className="popupFormRow">
							<div className="label">Team Name</div>

							<div className="popupFormInput">
								<input type="text" value={ this.state.newDivision.teamName } onChange={ this.changeTeamName() } />
							</div>
						</div>

						<div className="popupFormRow">
							<div className="label">Team Coach</div>

							<div className="popupFormInput">
								<input type="text" value={ this.state.newDivision.teamCoach } onChange={ this.changeTeamCoach() } />
							</div>
						</div>

					</div>
				</div>
			</div>
			: "" }

			<Toast message={ this.state.toast } />
		</div>
	); }
}

ReactDOM.render(<Index />, document.getElementById("root"));