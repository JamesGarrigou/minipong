import React from 'react';
import { io, Socket } from 'socket.io-client';
import {
	ServerToClientEvents,
	ClientToServerEvents,
} from '../shared/interfaces/events';
import Board from './Board/Board';
import Scoreboard from './Scoreboard/Scoreboard';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://${process.env.HOST}:8001`);

export default class Pong extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			t: 0,
			ping: {
				connected: false,
				timePingSent: [],
				nMostRecentPingReceived: 0,
				nMostRecentPingSent: 0,
				latency: 0,
			},
			player1: {
				score: 0,
				y: 0,
				vy: 0,
				position: 0,
			},
			player2: {
				score: 0,
				y: 0,
				vy: 0,
				position: 1,
			},
			ball: {
				x: 0,
				vx: 0,
				y: 0,
				vy: 0,
				r: 10,
			},
		}
		window.addEventListener('keydown', (e) => this.manageKeydown(e));
		window.addEventListener('keyup', (e) => this.manageKeyup(e));
	}

	componentDidMount() {
		socket.on('connect', () => {
			this.setState({
				connected: true,
			});
		});
		socket.on('disconnect', () => {
			this.setState({
				connected: false,
			});
		});
		socket.on('ping', (n) => {
//			console.log(`Ping ${n} received\n`);
			if (n >= this.state.ping.nMostRecentPingReceived) {
				var newPing = this.state.ping;
				newPing.nMostRecentPingReceived = n;
				newPing.latency = new Date().getTime() - newPing.timePingSent[n].getTime();
				this.setState({
					ping: newPing,
				});
			}
		});
		socket.on('join', (id) => {
			this.setState({
				id: id,
			});
		});
		socket.on('update', (data) => {
			this.setState({
				player1: data.player1,
				player2: data.player2,
				ball: data.ball,
			});
		});
		const interval = setInterval(() => {
//			console.log(`Ping ${this.state.ping.nMostRecentPingSent} emitted\n`);
			var newPing = this.state.ping;
			newPing.timePingSent[newPing.nMostRecentPingSent] = new Date();
			socket.emit('ping', newPing.nMostRecentPingSent);
			newPing.nMostRecentPingSent += 1;
			this.setState({
				ping: newPing,
			});
		}, 1000);
		socket.emit('join');
	}

	componentWillUnmount() {
		socket.off('connect');
		socket.off('disconnect');
		socket.off('ping');
		socket.off('join');
		socket.off('update');
	}

	manageKeydown = (e) => {
		if (e.repeat)
			return ;
		if (e.key === "s")
			socket.emit('move', {direction: 5, id: "1"});
		if (e.key === "w")
			socket.emit('move', {direction: -5, id: "1"});
		if (e.key === "ArrowDown")
			socket.emit('move', {direction: 5, id: "2"});
		if (e.key === "ArrowUp")
			socket.emit('move', {direction: -5, id: "2"});
	};

	manageKeyup = (e) => {
		if ((e.key === "s" && this.state.player1.vy > 0)
			|| (e.key === "w" && this.state.player1.vy < 0))
			socket.emit('move', {direction: 0, id: "1"});
		if ((e.key === "ArrowDown" && this.state.player2.vy > 0)
			|| (e.key === "ArrowUp" && this.state.player2.vy < 0))
			socket.emit('move', {direction: 0, id: "2"});
	};

	ballOut = (id) => {
		socket.emit('ballOut', id);
	};

	ballTouched = (id) => {
		socket.emit('ballTouched', id);
	};

	render() {
		return (
			<>
				<p>URL: {process.env.HOST}:3030</p>
				<Scoreboard
					ping={this.state.ping}
					player1={this.state.player1}
					player2={this.state.player2}
				/>
				<Board
					player1={this.state.player1}
					player2={this.state.player2}
					ball={this.state.ball}
					ballTouched={this.ballTouched}
					ballOut={this.ballOut}
				/>
			</>
		);
	}
}
