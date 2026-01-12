/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // update collection data
  unmarshal({
    "name": "classes"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // update collection data
  unmarshal({
    "name": "class"
  }, collection)

  return app.save(collection)
})
