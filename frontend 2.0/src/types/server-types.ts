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
