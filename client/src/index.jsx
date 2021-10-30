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
				const divisions = [... new Set(data.teams.map(team => team.division.name))] // get the unique names of the divisions
					.map(division => ({
						name: division,
						age: +(division.replace(/u/i, "")), // convert the name to an int for sorting
						teams: data.teams
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
			})
			.catch(error => {
				console.log(`error: ${ error.message }`);
				this.showToast("There was an error loading", true);
			});
	}

	navBack = () => {
	}

	selectTeam = (divisionIndex, teamIndex) => {
		const team = this.state.divisions[divisionIndex].teams[teamIndex];

		const cookies = new Cookies();
		cookies.set("division", team.division.id, { path: "/" });
		
		window.location = "/schedule.html";
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
			<Toolbar navBack={ this.navBack } />

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
								<div><img src={ `/media/logos/${ team.name.toLowerCase() }.png` } /></div>
								<div>{ team.name }</div>
								<div className="teamSeason">{ team.division.season } - { team.division.year }</div>
							</div>
						))}
						</div>
					</div>
				))}
				</div>
			}

			<Toast message={ this.state.toast } />
		</div>
	); }
}

ReactDOM.render(<Index />, document.getElementById("root"));