import React, { Component } from "react";
import ReactDOM from "react-dom";
import Cookies from "universal-cookie";
import Toolbar from "./components/toolbar";
import Toast from "./components/toast";
import "./css/common.css";

class Draft extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: { team: {} },
			isLoading: true,
			players: [],
			teams: [],
			toast: { text: "", type: "info" }
		};
	};
		
	componentDidMount() {		
		const cookies = new Cookies();

		if (!cookies.get("division")) {
			window.location = "/";
		}
	};

	navBack = () => {
		window.location = "/schedule.html";
	};

	render() { 
		return (
		<div className="pageContainer">
			<Toolbar navBack={ this.navBack } teamName={ this.state.user.team.name } adminMenu={ this.state.user.modules } />

			{
			this.state.isLoading ?
			<div className="loading">
				<img alt="Loading" src="/media/images/loading.gif" />
			</div>
			:
			<div>
			</div> 
			}

			<Toast message={ this.state.toast } />
		</div>
		)
	};

}

ReactDOM.render(<Draft />, document.getElementById("root"));
