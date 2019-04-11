import express from 'express'

interface GroupDetailRouteParams {
    id: string
}

export function getGroupDetailRoute(request: express.Request, response: express.Response) {
    const { id } = request.params as GroupDetailRouteParams

    response.status(200).render('view/groups/detail', {
        id,
    })
}
