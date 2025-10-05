export type User = {
    id: string,
    username: string
}

export type Server = {
    id: string,
    name: string
}

export type DMMessage = {
    sender: string,
    receiver: string,
    content: string
}

export type DMMessageFromServer = {
    id: string,
    createdAt: Date
    sender: string,
    receiver: string,
    content: string
}

export type ServerMessage = {
    type: "server",
    content: string,
    sender: string,
    server: string
}
