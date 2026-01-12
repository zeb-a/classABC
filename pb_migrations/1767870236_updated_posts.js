/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "name": "behaviors"
  }, collection)

  return app.dao().saveCollection(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "name": "posts"
  }, collection)

  return app.dao().saveCollection(collection)
})
