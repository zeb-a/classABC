/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("rd0356b13b6de3d");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "name",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "teacher",
        "max": 0,
        "min": 0,
        "name": "teacher",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "students",
        "maxSize": 0,
        "name": "students",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "tasks",
        "maxSize": 0,
        "name": "tasks",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "rd0356b13b6de3d",
    "indexes": [],
    "listRule": "",
    "name": "classes",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": ""
  });

  return app.save(collection);
})
