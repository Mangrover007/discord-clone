export type DMMessage = {
    sender: string,
    content: string,
    receiver: string
}

export type User = {
    id: string,
    username: string
}

export type Server = {
    id: string,
    name: string,
    owner: User
}

export type ServerMessage = {
    sender: string,
    content: string,
    receiver: string
}
