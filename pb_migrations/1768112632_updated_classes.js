/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json3586673122",
    "maxSize": 0,
    "name": "Access_Codes",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // remove field
  collection.fields.removeById("json3586673122")

  return app.save(collection)
})
