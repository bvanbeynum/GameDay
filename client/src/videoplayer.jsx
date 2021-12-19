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
			isLoading: true,
			toast: { text: "", type: "info" }
		};

		this.keyHandler = this.keyHandler.bind(this);
		this.videoPlayer = React.createRef();
	}

	componentDidMount() {
        const cookies = new Cookies();
        const divisionId = cookies.get("division");

		if (!divisionId) {
			window.location = "/";
		}

		document.addEventListener("keydown", this.keyHandler, false);

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
				const videoDates = data.videos
					.map(videoDate => ({
						date: new Date((new Date(videoDate.date)).setMinutes((new Date(videoDate.date)).getTimezoneOffset())),
						ref: React.createRef(),
						files: videoDate.files
							.map(file => ({ ...file, fileNumber: +file.name.match(/^[^/.]+/)[0]}))
							.sort((fileA, fileB) => fileA.fileNumber - fileB.fileNumber)
					}))
					.sort((dayA, dayB) => dayB.date - dayA.date);

				this.setState({
					user: data.user,
					videoDates: videoDates,
					isLoading: false
				});
			})
			.catch(error => {
				console.log(error);
				this.setState(({ toast: { text: "Error loading video player data", type: "error" } }));
			});
	};

	componentWillUnmount() {
		document.removeEventListener("keydown", this.keyHandler, false);
	};
	
	navBack = () => {
		window.location = "/schedule.html";
	};

	selectDay = (dayIndex) => {
		const dayDOM = this.state.videoDates[dayIndex].ref.current;

		// Set the initial clip position
		this.setState(({
			selectedDay: this.state.videoDates[dayIndex],
			selectedDayStyle: {
				display: "flex",
				clipPath: `circle(0% at ${ dayDOM.offsetLeft + (dayDOM.clientWidth / 2) }px ${ dayDOM.offsetTop + (dayDOM.clientHeight / 2) }px)`
			}
		}), () => {
			this.setState(({
				// Animate the clip
				selectedDayStyle: {
					display: "flex",
					clipPath: `circle(100% at ${ dayDOM.offsetLeft + (dayDOM.clientWidth / 2) }px ${ dayDOM.offsetTop + (dayDOM.clientHeight / 2) }px)`
				}
			}), () => {
				// Remove the clip path
				setTimeout(() => {
					this.setState(({
						selectedDayStyle: { display: "flex", clipPath: "none" }
					}));
				}, 1000)
			});
		});
	};

	closeDay = () => {
		this.setState(({ selectedDay }) => ({
			selectedDayStyle: {
				display: "flex",
				clipPath: `circle(0% at ${ selectedDay.ref.current.offsetLeft + (selectedDay.ref.current.clientWidth / 2) }px ${ selectedDay.ref.current.offsetTop + (selectedDay.ref.current.clientHeight / 2) }px)`
			}
		}), () => {
			setTimeout(() => {
				this.setState(({
					selectedDay: null,
					selectedDayStyle: null
				}));
			}, 1500);
		});
	};

	openVideo = (event, fileIndex) => {
		this.setState(({
			videoIndex: fileIndex,
			videoState: "grow"
		}), () => {
			
			setTimeout(() => {
				this.setState(({ videoState: "active" }));
			}, 300);
		});

		event.preventDefault();
	};

	closeVideo = () => {
		this.setState(({
			videoIndex: null,
			videoState: "grow"
		}), () => {
			setTimeout(() => {
				this.setState(({ videoState: null }));
			}, 500);
		});
	};

	keyHandler = (event) => {
		if (this.videoPlayer.current) {
			const span = event.ctrlKey ? 1 : (1 / 59.94);

			if (event.keyCode === 32) {
				// Space
				this.videoPlayer.current.paused ? this.videoPlayer.current.play() : this.videoPlayer.current.pause()
			}
			else if (event.keyCode === 39 && this.videoPlayer.current.currentTime + span <= this.videoPlayer.current.duration) {
				// Right
				this.videoPlayer.current.currentTime += span;
			}
			else if (event.keyCode === 37 && this.videoPlayer.current.currentTime - span >= 0) {
				// Left
				this.videoPlayer.current.currentTime -= span;
			}
			else if (event.keyCode === 78) {
				// n
				this.setState(({ 
					videoIndex: this.state.videoIndex < this.state.selectedDay.files.length ? this.state.videoIndex + 1 : this.state.videoIndex
				}));
			}
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
			<div>
				<div className="boxContainer">
				{
				this.state.videoDates.map((day, dayIndex) =>
					<div key={ dayIndex } ref={ day.ref } className="box" onClick={ () => { this.selectDay(dayIndex) }}>
						<div>{ day.date.toLocaleDateString() }</div>
						<div>{ day.files.length } files</div>
					</div>
				)
				}
				</div>
				
				<div className="selectedDay" style={ this.state.selectedDayStyle } onClick={ () => { /*this.closeDay()*/ }}>
				{
				this.state.selectedDay ? this.state.selectedDay.files.map((file, fileIndex) => 
					<div key={ fileIndex } className={ file.thumb ? "boxImage" : "box" } onClick={ (event) => { this.openVideo(event, fileIndex) }}>
					{
					file.thumb ?
						<img src={ `${ file.path }/${ file.thumb }` } />
					: file.name
					}
					</div>
				)
				: ""
				}
				</div>

				<div className={ `videoViewer ${ this.state.videoState }` }>
					<div className="videoAction" onClick={ this.closeVideo }>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
					</div>

				{
				this.state.videoIndex ?
					<video ref={ this.videoPlayer } className={ this.state.videoState }>
						<source src={ `${ this.state.selectedDay.files[this.state.videoIndex].path }/${ this.state.selectedDay.files[this.state.videoIndex].name }` } type="video/mp4" />
					</video>
				: ""
				}
				</div>
			</div>
		}

		<Toast message={ this.state.toast } />

	</div>
	); }

}

ReactDOM.render(<VideoPlayer />, document.getElementById("root"));
