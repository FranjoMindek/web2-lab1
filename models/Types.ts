export enum Role {
    USER,
    ADMIN,
}

export type User = {
    email: string,
    role: Role,
}

export type Game = {
    id: string,
    team1: string,
    team2: string,
    team1points: number,
    team2points: number,
    comments: Comment[]
}

export type GameDTO = {
    team1: string,
    team2: string,
    team1points: number,
    team2points: number,
}

export type CommentDTO = {
    email: string,
    text: string,
}

export type Comment = {
    id: string,
    email: string,
    text: string,
}
