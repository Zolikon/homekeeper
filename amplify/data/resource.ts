import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  ShoppingList: a
    .model({
      id: a.string().required(),
      name: a.string().required(),
      type: a.string().required(),
      added: a.timestamp().required(),
    })
    .authorization((allow) => [allow.authenticated()]),
  InfoStore: a
    .model({
      id: a.string().required(),
      title: a.string().required(),
      content: a.string().required(),
      category: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
  Recipe: a
    .model({
      id: a.string().required(),
      link: a.string(),
      name: a.string().required(),
      ingredients: a.string().array().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  VacationInfo: a
    .model({
      id: a.string().required(), // always "main" — singleton
      city: a.string().required(),
      hotelName: a.string().required(),
      hotelAddress: a.string(),
      hotelNotes: a.string(),
      startDate: a.string().required(), // "YYYY-MM-DD"
      endDate: a.string().required(),   // "YYYY-MM-DD"
      weatherLat: a.float(), // geocoded latitude — cached to avoid re-geocoding on force-dynamic pages
      weatherLon: a.float(), // geocoded longitude
    })
    .authorization((allow) => [allow.authenticated()]),

  VacationFlight: a
    .model({
      id: a.string().required(), // "outbound" or "return" — deterministic
      flightNumber: a.string(),
      airline: a.string(),
      departureTime: a.string().required(), // "HH:mm"
      departureTerminal: a.string(), // optional — budget airlines assign terminals late
      arrivalTime: a.string().required(), // "HH:mm"
      arrivalTerminal: a.string(), // optional
      baggageInfo: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  VacationDay: a
    .model({
      id: a.string().required(),
      date: a.string().required(), // "YYYY-MM-DD"
      order: a.integer().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  VacationProgram: a
    .model({
      id: a.string().required(),
      dayId: a.string().required(),
      name: a.string().required(),
      startTime: a.string().required(), // "HH:mm" — programs sorted by this field
      endTime: a.string(), // "HH:mm" — optional
      address: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
