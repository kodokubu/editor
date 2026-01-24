import { onRequestGet as __api_notes___id___ts_onRequestGet } from "/Users/kodokubu/archive/antigravity/cloud-memo/functions/api/notes/[[id]].ts"
import { onRequestPost as __api_notes___id___ts_onRequestPost } from "/Users/kodokubu/archive/antigravity/cloud-memo/functions/api/notes/[[id]].ts"

export const routes = [
    {
      routePath: "/api/notes/:id*",
      mountPath: "/api/notes",
      method: "GET",
      middlewares: [],
      modules: [__api_notes___id___ts_onRequestGet],
    },
  {
      routePath: "/api/notes/:id*",
      mountPath: "/api/notes",
      method: "POST",
      middlewares: [],
      modules: [__api_notes___id___ts_onRequestPost],
    },
  ]