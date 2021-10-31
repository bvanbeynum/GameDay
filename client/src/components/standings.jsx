import React from "react";
import "../css/schedule.css";

const Standings = (props) => {

	return (

        <div className="scheduleContainer">
            <h2 className="scheduleHeader">Standings</h2>

            <div className="confrenceContainer">
            {
            props.confrences
                .map((confrence, confrenceIndex) => 
            
                <div key={ confrenceIndex } className="daySection confrence">
                    <table className="standings">
                    <thead>
                    <tr>
                        <th colSpan="2">{ confrence.name }</th>
                        <th>W</th>
                        <th>L</th>
                        <th>Pct</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                    confrence.teams.map((team, teamIndex) => 
                        <tr key={ teamIndex } onClick={ () => { props.selectTeam(team) } } >
                            <td><img src={ `/media/logos/${ team.name.toLowerCase() }.png` } /></td>
                            <td>{team.name}</td>
                            <td>{team.wins}</td>
                            <td>{team.losses}</td>
                            <td>{team.ratio}</td>
                        </tr>
                    )}
                    </tbody>
                    </table>
                </div>
            )}
            </div>
                
            <h2 className="scheduleHeader">Schedule</h2>
            
            <div>
            {
            props.schedule.map((gameDay, dayIndex) => 
            
                <div key={ dayIndex } className="daySection">
                    <div className={`standingDate ${ gameDay.isNext ? "gameHighlight" : "" }`}>
                        Game Day { dayIndex + 1 } - { gameDay.name.toLocaleDateString() }
                    </div>
                    
                    <div className="scheduleSection">
                    {
                    gameDay.games.map((game, gameIndex) => 
                    
                        <div key={ gameIndex } className="gameContainer" onClick={ () => { props.selectGame(game) }}>
                            
                            <div className="scheduleTeams"> 
                                <div className="scheduleTeam">
                                    <img src={`/media/logos/${ game.awayTeam.name.toLowerCase() }.png`} />
                                    <div className="scheduleTeamName">{ game.awayTeam.name }</div>
                                    <div className="scheduleWinner">{ game.awayTeam.isWinner ? <span>&#9668;</span> : "" }</div>
                                </div>
                                
                                <div className="scheduleTeam">
                                    <img src={`/media/logos/${ game.homeTeam.name.toLowerCase() }.png`} />
                                    <div className="scheduleTeamName">{ game.homeTeam.name }</div>
                                    <div className="scheduleWinner">{ game.homeTeam.isWinner ? <span>&#9668;</span> : "" }</div>
                                </div>
                            </div>
                            
                            <div className="scheduleDateContainer">
                                <div className="scheduleDate">{ game.dateTime.toDateString() }</div>
                                <div className="scheduleTime">{ game.dateTime.toLocaleTimeString().replace(/:00 /, " ") }</div>
                            </div>
                        </div>

                    ) }
                    </div>
                </div>
            )}
            </div>
        </div>

    );

}

export default Standings;
