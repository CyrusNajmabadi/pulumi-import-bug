export const listEvents = async () => {
    // I would prefer being able to import outside of the lambda scope but this is not currently possible
    // This is not even working anymore :(
    const {createResponse} = await import('./bin/utils')
    const {getAllBofEvents} = await import('./bin/dynamo')

    try {
        const events = await getAllBofEvents()

        return createResponse(200, events)
    } catch (e) {
        console.log(e)
        return createResponse(400, e.message)
    }
}
