export type DMPayload = {
    type: "dm"
    data: {
        content: string,
        createdAt: string,
        id: string,
        receiver: {
            username: string
        },
        sender: {
            username: string
        },
    }
}

export type ServerMessagePayload = {
    type: "server"
    data: {
        content: string,
        createdAt: string,
        id: string,
        receiver: {
            username: string
        },
        sender: {
            username: string
        },
    }
}
