import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toolbar from "./components/toolbar";
import "./index.css";
import "./media/common.css";
import loadingImage from "./media/loading.gif";

class Content extends Component {
	constructor(props) {
		super(props);

		this.state = {
			divisions: [],
			isLoading: true
		};
	}

	navBack = () => {
	}

	selectTeam = (teamIndex) => {
	}
	
	render() { return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } />

			{
			this.state.isLoading ?
				<div className="loading">
					<img alt="Loading" src={ loadingImage } />
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
							<div key={ teamIndex } onClick={ this.selectTeam(teamIndex) } className="team">
								<div><img src={ team.img } /></div>
								<div>{ team.name }</div>
								<div className="teamSeason">{ team.division.season } - { team.division.year }</div>
							</div>
						))}
						</div>
					</div>
				))}
				</div>
			}
		</div>
	); }
}

ReactDOM.render(<Content />, document.getElementById("root"));