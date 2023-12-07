export interface ServerToClientEvents {
	ping: (n) => void;
	join: (id: string) => void;
	update: (data: DataUpdate) => void;
}

export interface ClientToServerEvents {
	ping: (n) => void;
	join: () => void;
	move: (dataMove: DataMove) => void;
	ballTouched: (id: string) => void;
	ballOut: (id: string) => void;
}

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
	vx: number;
	y: number;
	vy: number;
	r: number;
}

export interface DataPlayer {
	score: number;
	y: number;
	vy: number;
	position: number,
}
