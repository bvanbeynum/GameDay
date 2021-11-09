import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";
import "./css/videoplayer.css";

class VideoPlayer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			pageState: "loading",
			toast: { text: "", isActive: false, type: "info" }
		};
	}

	componentDidMount() {
        const cookies = new Cookies();
        const divisionId = cookies.get("division");

		fetch(`/api/videoplayerload?divisionid=${ divisionId }`)
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				else {
					throw Error(response.statusText);
				}
			})
			.then(data => {
				const files = data.files.map(file => {
					let fileDate = new Date(file.modified);
					fileDate.setHours(0,0,0,0);
					
					return {
						...file,
						modifiedDate: fileDate,
						displayDate: fileDate.toLocaleDateString()
					};
				});

				const videoDates = [... new Set(files.map(file => file.displayDate))]
					.map(date => ({
						display: date,
						date: Date.parse(date),
						files: files.filter(file => file.displayDate === date)
					}))
					.sort((dayA, dayB) => dayB.date - dayA.date);

				this.setState({
					user: data.user,
					videoDates: videoDates,
					pageState: "day"
				});
			})
			.catch(error => {
				console.log(error);
				this.showToast("Error loading video player data", true);
			});
	}
	
	navBack = () => {
		window.location = "/schedule.html";
	}

	selectDay = (dayIndex) => {
		this.setState({
			selectedDay: this.state.videoDates[dayIndex],
			pageState: "files"
		});
	}

    render() { return (
	<div className="pageContainer">
		<Toolbar navBack={ this.navBack } teamName={ this.state.user.team.name } adminMenu={ this.state.user.modules } />

		{
		this.state.pageState === "loading" ?
			<div className="loading">
				<img alt="Loading" src="/media/images/loading.gif" />
			</div>
		: this.state.pageState === "day" ?
			<div className="boxContainer">
			{
			this.state.videoDates.map((day, dayIndex) =>
				<div key={ dayIndex } className="box" onClick={ () => { this.selectDay(dayIndex) }}>
					<div>{ day.display }</div>
					<div>{ day.files.length } files</div>
				</div>
			)
			}
			</div>
		: this.state.pageState === "files" ?
			<div className="boxContainer">
			{
			this.state.selectedDay.files.map((file, fileIndex) => 
				<div key={ fileIndex } className="box">
					{ file.name }
				</div>
			)
			}
			</div>
		: ""
		}

		<Toast message={ this.state.toast } />

	</div>
	); }

}

ReactDOM.render(<VideoPlayer />, document.getElementById("root"));
