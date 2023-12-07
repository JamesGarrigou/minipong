export interface DataMove {
	direction: number;
	id: string;
}

export interface DataUpdate {
	t: Date;
	player1: DataPlayer;
	player2: DataPlayer;
	ball: DataBall;
}

export interface DataBall {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	kickoff: boolean;
}

export interface DataPlayer {
	score: number;
	y: number;
	vy: number;
	position: number,
}
