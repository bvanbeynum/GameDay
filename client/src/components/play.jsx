import React, { useState } from "react";

const Play = (props) => {

	const colors = ["red", "blue", "green", "orange", "black", "purple", "lightblue"],
		scrimmageY = 310;

	const selectPlayer = (playerIndex, event) => {
		event.stopPropagation();

		if (props.selectedPlayerIndex === playerIndex) {
			if (props.selectedMode === "player") {
				props.selectMode("route");
			}
			else if (props.selectedMode === "route") {
				props.selectPlayer(null);
				props.selectMode(null);
			}
			else {
				props.selectMode("player");
			}
		}
		else {
			props.selectPlayer(playerIndex);
			props.selectMode("player");
		}
	};

	const fieldAction = event => {
		const updatedPlayer = { ...props.play.players[props.selectedPlayerIndex] };
		
		let translatePoint = event.target.createSVGPoint();
		translatePoint.x = event.clientX;
		translatePoint.y = event.clientY;
		translatePoint = translatePoint.matrixTransform(event.target.getScreenCTM().inverse());
		
		const fieldBox = event.target.viewBox.baseVal;
		
		if (updatedPlayer && props.selectedMode === "player") {
			// Snap to right of player
			let newX = props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					translatePoint.y > player.location.y - 10 &&
					translatePoint.y < player.location.y + 10 &&
					translatePoint.x > player.location.x + 8 && 
					translatePoint.x < player.location.x + 35
				)
				.map(player => player.location.x + 30)[0];
			
			// Snap to left of player
			newX = newX || 
				props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					translatePoint.y > player.location.y - 10 &&
					translatePoint.y < player.location.y + 10 &&
					translatePoint.x < player.location.x - 8 && 
					translatePoint.x > player.location.x - 35
				)
				.map(player => player.location.x - 30)[0];
			
			/// Snap to center of player
			newX = newX || 
				props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					(translatePoint.y > player.location.y + 10 || translatePoint.y < player.location.y - 10) &&
					translatePoint.x > player.location.x - 12 && 
					translatePoint.x < player.location.x + 12
				)
				.map(player => player.location.x)[0];
			
			// Snap to center of field
			newX = newX ||
				(translatePoint.x > (fieldBox.width / 2) - 15 && translatePoint.x < (fieldBox.width / 2) + 15 ? newX = fieldBox.width / 2 : null);
			
			updatedPlayer.location.x = newX || translatePoint.x;
			
			// Snap to top of player
			let newY = props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					translatePoint.x > player.location.x - 10 && 
					translatePoint.x < player.location.x + 10 &&
					translatePoint.y < player.location.y - 8 &&
					translatePoint.y > player.location.y - 35
				)
				.map(player => player.location.y - 30)[0];
			
			// Snap to bottom of player
			newY = newY || 
				props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					translatePoint.x > player.location.x - 10 && 
					translatePoint.x < player.location.x + 10 &&
					translatePoint.y > player.location.y + 8 &&
					translatePoint.y < player.location.y + 35
				)
				.map(player => player.location.y + 30)[0];
			
			/// Snap to center of player
			newY = newY || 
				props.play.players
				.filter((player, playerIndex) =>
					playerIndex !== props.selectedPlayerIndex &&
					(translatePoint.x > player.location.x + 10 || translatePoint.x < player.location.x - 10) &&
					translatePoint.y > player.location.y - 12 && 
					translatePoint.y < player.location.y + 12
				)
				.map(player => player.location.y)[0];
			
			// Snap to scrimmage line
			newY = newY ||
				(translatePoint.y > scrimmageY && translatePoint.y < scrimmageY + 20 ? newY = translatePoint.y = scrimmageY + 13 : null);
			
			updatedPlayer.location.y = newY || translatePoint.y;
			
			updatedPlayer.route = [];
			
			props.updatePlay(updatedPlayer, props.selectedPlayerIndex);
		}
		else if (updatedPlayer && props.selectedMode === "route") {
			const lastPoint = updatedPlayer.route[updatedPlayer.route.length - 1];
			
			// Snap to player center X
			let newX = !lastPoint &&
				(translatePoint.y < updatedPlayer.location.y - 8 || translatePoint.y > updatedPlayer.location.y + 8) &&
				translatePoint.x > updatedPlayer.location.x - 12 &&
				translatePoint.x < updatedPlayer.location.x + 12 ? updatedPlayer.location.x : null;
			
			// Snap to the last X point
			newX = newX || (
				lastPoint &&
				(translatePoint.y < lastPoint.y - 8 || translatePoint.y > lastPoint.y + 8) &&
				translatePoint.x > lastPoint.x - 12 && 
				translatePoint.x < lastPoint.x + 12 ? lastPoint.x : null);
			
			// Snap to player center Y
			let newY = !lastPoint &&
				(translatePoint.x < updatedPlayer.location.x - 8 || translatePoint.x > updatedPlayer.location.x + 8) &&
				translatePoint.y > updatedPlayer.location.y - 12 &&
				translatePoint.y < updatedPlayer.location.y + 12 ? updatedPlayer.location.y : null;
			
			// Snap to the last Y point
			newY = newY || (
				lastPoint &&
				(translatePoint.x < lastPoint.x - 8 || translatePoint.x > lastPoint.x + 8) &&
				translatePoint.y > lastPoint.y - 12 && 
				translatePoint.y < lastPoint.y + 12 ? lastPoint.y : null);
			
			updatedPlayer.route.push({ 
				x: newX || translatePoint.x, 
				y: newY || translatePoint.y
			});

			props.updatePlay(updatedPlayer, props.selectedPlayerIndex);
		}
	};

	return (
	<svg className="play" viewBox="0 0 400 410" preserveAspectRatio="none" onClick={ event => { if (props.mode === "edit") { fieldAction(event) } }}>
		<defs>
		{
		colors.map((color, colorIndex) =>
			<marker key={ colorIndex } id={ `arrow-${ color }` } viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" fill={ color }>
				<polygon points="0 1.5, 10 5, 0 8.5"></polygon>
			</marker>
		)
		}
		</defs>

		<line x1="0" y1={ scrimmageY } x2="400" y2={ scrimmageY }></line>

		{
		props.play.players.map((player, playerIndex) => 
		<circle 
			key={ playerIndex } 
			r="8" 
			cx={ player.location.x } 
			cy={ player.location.y } 
			fill={ player.color } 
			stroke={ player.color }
			className={ 
				props.selectedPlayerIndex === playerIndex && props.selectedMode === "player" ? "playerSelected" 
				: props.selectedPlayerIndex === playerIndex && props.selectedMode === "route" ? "routeSelected" 
				: "" 
			} 
			onClick={ event => { if (props.mode === "edit") { selectPlayer(playerIndex, event) } }} />
		)
		}

		{
		props.play.players.filter(player => player.route && player.route.length > 0).map((player, playerIndex) => {
			let route =""
			if (player.routeType === "straight" || player.routeType === "run") {
				route = player.route.map(point => `L${ point.x },${ point.y }`).join(" ")
			}
			else if (player.routeType === "curved") {
				route = player.route.map((point, index, routes) => {
					let path = "";

					if (index === 0) {
						// First curve should be bezier
						
						if (Math.abs(point.x - player.location.x) > Math.abs(point.y - player.location.y)) {
							path = "C" + player.location.x + "," + point.y + " " + 
								point.x + "," + point.y + " " +
								point.x + "," + point.y + " ";
						}
						else {
							path = "C" + point.x + "," + player.location.y + " " + 
								point.x + "," + point.y + " " +
								point.x + "," + point.y + " ";
						}
					}
					else {
						// Following paths should be S paths
						if (Math.abs(point.x - routes[index - 1].x) > Math.abs(point.y - routes[index - 1].y)) {
							path = "S" +routes[index - 1].x + "," + point.y + " " + point.x + "," + point.y;
						}
						else {
							path = "S" +point.x + "," + routes[index - 1].y + " " + point.x + "," + point.y;
						}
					}
					
					return path;
				});
			}

			return <path key={ playerIndex } stroke={ player.color } d={ `M${ player.location.x },${ player.location.y } ${ route }` } markerEnd={ `url(#arrow-${ player.color })` } className={ player.routeType === "run" ? "run" : "" }></path>
		}
		)
		}
	</svg>
	)
}

export default Play;
