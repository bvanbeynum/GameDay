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
			progress: 0,
			toast: { text: "", type: "info" }
		};

		this.keyHandler = this.keyHandler.bind(this);
		this.videoPlayerRef = React.createRef();
	}

	componentDidMount() {
        const cookies = new Cookies();
        const divisionId = cookies.get("division");

		if (!divisionId) {
			window.location = "/";
		}

		document.addEventListener("keydown", this.keyHandler, false);
		this.progressUpdate = setInterval(this.updateProgress, 500);

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
		window.clearInterval(this.progressUpdate);
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
			progress: 0
		}));

		event.preventDefault();
	};

	videoLoaded = () => {
		console.log(`${ this.videoPlayerRef.current.currentTime } / ${ this.videoPlayerRef.current.duration }`);
		this.setState({ 
			progress: 0,
			isVideoLoaded: true,
			boxRatio: this.videoPlayerRef.current.videoWidth / this.videoPlayerRef.current.videoHeight
		});
	};

	closeVideo = () => {
		this.setState(({
			videoIndex: null,
			isVideoLoaded: false
		}));
	};

	updateProgress = () => {
		if (this.videoPlayerRef.current && this.state.isVideoLoaded) {
			this.setState({
				progress: this.videoPlayerRef.current.currentTime / this.videoPlayerRef.current.duration
			});
		}
	};

	placeBox = event => {
		if (this.state.boxRatio) {
			this.setState({ 
				boxMove: true, 
				videoBox: { 
					x: event.clientX, 
					y: event.clientY, 
					width: 0, 
					height: 0 
				} 
			});
		}
	};

	drawBox = event => {
		if (this.state.boxMove) { 
			const width = event.clientX - this.state.videoBox.x,
				height = (event.clientX - this.state.videoBox.x) / this.state.boxRatio,
				videoTop = this.videoPlayerRef.current.offsetTop + this.videoPlayerRef.current.parentElement.parentElement.offsetTop,
				boxTop = this.state.videoBox.y - videoTop;

			// 8 pixels of border
			if (boxTop + height + 7 < this.videoPlayerRef.current.offsetHeight) {
				this.setState(({ videoBox }) => ({ 
					videoBox: { 
						...videoBox, 
						width: width, 
						height: height
					} 
				}));
			}
		}
	};

	finishBox = event => {
		if (this.state.boxMove && this.state.videoBox.width > 20 && this.state.videoBox.height > 20) {
			this.setState({ boxMove: false });
		}
		else if (this.state.isVideoLoaded) {
			this.setState({ videoBox: null, boxMove: false });
			this.videoPlayerRef.current.paused ? this.videoPlayerRef.current.play() : this.videoPlayerRef.current.pause();
		}
	};

	exportFrame = () => {
		const currentFile = this.state.selectedDay.files[this.state.videoIndex],
			options = {
				folder: currentFile.folder,
				fileName: currentFile.name,
				start: this.state.captureStart,
				end: this.state.captureEnd,
				top: this.state.videoBox.y,
				left: this.state.videoBox.x,
				width: this.state.videoBox.width,
				height: this.state.videoBox.height
			};
		
		fetch("/api/videoplayerexport", 
			{ 
				method: "post", 
				headers: {"Content-Type": "application/json"}, 
				body: JSON.stringify({ export: options })
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
				console.log(data);
				this.setState({ toast: { text: "Frame exported", type: "info" } });
			})
			.catch(error => {
				console.warn(error);
				this.setState({ toast: { text: "Error exporting frame", type: "error" } });
			})
	};

	moveFrame = (direction, isDoubleStep) => {
		const span = isDoubleStep ? 1 : (1 / 59.94),
			newTime = this.videoPlayerRef.current.currentTime + (direction * span);

		if (newTime >= 0 && newTime <= this.videoPlayerRef.current.duration) {
			this.videoPlayerRef.current.currentTime = newTime;
		}
	};

	setCapture = () => {
		const start = !this.state.captureStart || this.state.captureEnd ? this.videoPlayerRef.current.currentTime : this.state.captureStart,
			startPosition = !this.state.captureStartPosition || this.state.captureEndPosition ? ((this.videoPlayerRef.current.offsetWidth - 144) * this.state.progress) + 72 : this.state.captureStartPosition,
			end = this.state.captureStart ? this.videoPlayerRef.current.currentTime : null,
			endPosition = this.state.captureStart ? ((this.videoPlayerRef.current.offsetWidth - 144) * this.state.progress) + 72 : this.state.captureEndPosition;

		this.setState({
			captureStart: start,
			captureStartPosition: startPosition,
			captureEnd: start != end ? end : null,
			captureEndPosition: start != end ? endPosition : null
		});
	};

	keyHandler = event => {
		if (this.videoPlayerRef.current) {
			const span = event.ctrlKey ? 1 : (1 / 59.94);

			if (event.keyCode === 32) {
				// Space
				event.stopPropagation();
				event.preventDefault();
				this.videoPlayerRef.current.paused ? this.videoPlayerRef.current.play() : this.videoPlayerRef.current.pause()
			}
			else if (event.keyCode === 39) {
				// Right
				event.stopPropagation();
				event.preventDefault();
				this.moveFrame(1, event.ctrlKey)
			}
			else if (event.keyCode === 37) {
				// Left
				event.stopPropagation();
				event.preventDefault();
				this.moveFrame(-1, event.ctrlKey)
			}
			else if (event.keyCode === 78) {
				// n
				event.stopPropagation();
				event.preventDefault();
				
				this.setState(({ videoIndex, selectedDay }) => ({ 
					videoIndex: videoIndex < selectedDay.files.length ? videoIndex + 1 : videoIndex,
				}),
				() => {
					this.videoPlayerRef.current.load();
				});
			}
			else if (event.keyCode === 80) {
				// p
				event.stopPropagation();
				event.preventDefault();
				
				this.setState(({ videoIndex }) => ({ 
					videoIndex: videoIndex > 0 ? videoIndex - 1 : videoIndex,
				}),
				() => {
					this.videoPlayerRef.current.load();
				});
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

				<div className={ `videoViewer ${ this.state.videoIndex ? "active" : "" }` }>
					<div className="videoNav" onClick={ this.closeVideo }>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
					</div>

				{
				this.state.videoIndex ?
					<div className="videoContainer">
						{
						this.state.isVideoLoaded ?
						<div className="videoActions">
							<div className="videoActionButton" onClick={ () => { this.exportFrame() }}>
								{/* Export */}
								<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
									<g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"/></g>
								</svg>
							</div>
						</div>
						: ""
						}

						<video 
							ref={ this.videoPlayerRef }
							onLoadedMetadata={ this.videoLoaded }
							onMouseDown={ this.placeBox }
							onMouseMove={ this.drawBox }
							onMouseUp={ this.finishBox }
							>

							<source src={ `${ this.state.selectedDay.files[this.state.videoIndex].path }/${ this.state.selectedDay.files[this.state.videoIndex].name }` } type="video/mp4" />
						</video>

						{
						this.state.isVideoLoaded ?
						<div className="videoActions">
							<div className="videoActionButton" onClick={ () => { this.moveFrame(-1, true) }}>
								{/* Step double left */}
								<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
									<g><g><polygon points="17.59,18 19,16.59 14.42,12 19,7.41 17.59,6 11.59,12"/><polygon points="11,18 12.41,16.59 7.83,12 12.41,7.41 11,6 5,12"/></g></g>
								</svg>
							</div>
							
							<div className="videoActionButton" onClick={ () => { this.moveFrame(-1, false) }}>
								{/* Step left */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
								</svg>
							</div>

							<progress className="videoProgress" min="0" max="1" value={ this.state.progress } onClick={ () => { this.setCapture() }}></progress>
							
							<div className="videoActionButton" onClick={ () => { this.moveFrame(1, false) }}>
								{/* Step right */}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
									<path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
								</svg>
							</div>
							
							<div className="videoActionButton" onClick={ () => { this.moveFrame(1, true) }}>
								{/* Step double right */}
								<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" >
									<g><g><polygon points="6.41,6 5,7.41 9.58,12 5,16.59 6.41,18 12.41,12"/><polygon points="13,6 11.59,7.41 16.17,12 11.59,16.59 13,18 19,12"/></g></g>
								</svg>
							</div>

							<div className={ `captureBar ${ this.state.captureStartPosition ? "active" : "" }` } style={{ left: this.state.captureStartPosition }}></div>
							<div className={ `captureBar ${ this.state.captureEndPosition ? "active" : "" }` } style={{ left: this.state.captureEndPosition }}></div>
						</div>
						: ""
						}

					</div>
				: ""
				}
				{
					this.state.videoBox ?
						<div 
							className="videoBox" 
							style={{ top: this.state.videoBox.y, left: this.state.videoBox.x, width: this.state.videoBox.width, height: this.state.videoBox.height }}
							onMouseMove={ this.drawBox }
							onMouseUp={ this.finishBox }
							>
						</div>
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