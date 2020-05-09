# Users
Field name | Type | Encypted | Hashed | Description
--- | --- | --- | --- | ---
`email` | String | no | no | Registration email
`token` | String | no | __yes__ | Access Token
`createdAt` | Date | no | no | Creation date
`role` | Number | no | no | User's role (see `src/resources/users/collection.js`)
`firstName` | String | __yes__ | no | User's first name
`lastName` | String | __yes__ | no | User's last name
`status` | String | no | no | Account status (see `src/resources/users/collection.js`)
`password` | String | no | __yes__ | User's password
`salt` | String | no | no | Password salt