package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// Create behaviors collection
		behaviorsColl := &models.Collection{}
		behaviorsColl.Name = "behaviors"
		behaviorsColl.Type = "base"
		behaviorsColl.Schema = schema.NewSchema(
			&schema.SchemaField{
				Id:       "label",
				Name:     "label",
				Type:     schema.FieldTypeText,
				Required: true,
			},
			&schema.SchemaField{
				Id:       "pts",
				Name:     "pts",
				Type:     schema.FieldTypeNumber,
				Required: true,
			},
			&schema.SchemaField{
				Id:       "type",
				Name:     "type",
				Type:     schema.FieldTypeSelect,
				Required: true,
				Options: &schema.SelectOptions{
					MaxSelect: 1,
					Values:    []string{"wow", "nono"},
				},
			},
			&schema.SchemaField{
				Id:   "icon",
				Name: "icon",
				Type: schema.FieldTypeText,
			},
		)

		if err := app.Dao().SaveCollection(behaviorsColl); err != nil {
			log.Println("Warning: behaviors collection may already exist:", err)
		} else {
			log.Println("Created behaviors collection")
		}

		// Create classes collection
		classesColl := &models.Collection{}
		classesColl.Name = "classes"
		classesColl.Type = "base"
		classesColl.Schema = schema.NewSchema(
			&schema.SchemaField{
				Id:       "name",
				Name:     "name",
				Type:     schema.FieldTypeText,
				Required: true,
			},
			&schema.SchemaField{
				Id:       "teacher",
				Name:     "teacher",
				Type:     schema.FieldTypeText,
				Required: true,
			},
			&schema.SchemaField{
				Id:   "students",
				Name: "students",
				Type: schema.FieldTypeJson,
			},
			&schema.SchemaField{
				Id:   "tasks",
				Name: "tasks",
				Type: schema.FieldTypeJson,
			},
		)

		if err := app.Dao().SaveCollection(classesColl); err != nil {
			log.Println("Warning: classes collection may already exist:", err)
		} else {
			log.Println("Created classes collection")
		}

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
