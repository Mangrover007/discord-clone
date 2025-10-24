// backend

type errorMessage = {
    type: "error",
    message: string
}

type serverMessage = {
    type: "server",
    message: string,
    sender: string
}

type dmMessage = {
    type: "dm",
    message: string,
    sender: string
}
