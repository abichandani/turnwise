@./ this is an empty git repository. I want to create a simple Android+iOS application.

# Floor duty tracker

## Background

I live on a floor with 17 other single rooms (18 people total), sharing one
kitchen. There are three recurring duties:

1. Paper + glass trash
2. Bio + plastic trash
3. Kitchen stove + cooking area wipe-down

Originally this was tracked with physical cards hung on each person's
nameplate. When someone finished a duty, they physically moved the card to
their neighbour's door. Two of the three duties pass **anti-clockwise** around the
floor; one (bio + plastic trash) passes **clockwise**. Everyone does
each duty once in a while, in a fixed rotation around the physical layout of
the floor.

We want to replace the physical cards with a digital system.

## Use cases:
- a database which
	- can temporarily be a google spreadsheet
	- should store logs, user data etc. 
	- should delete all data older than a year once a month.
- A default admin account named "admin" should already exist with fixed credentials for me (the developer).
- There can be multiple admins.
- An admin should be able to
    - do everything a user can
	- add a new duty (name, description, image or pdf)
	- delete/update an existing duty
	- update direction of rotation of the duty
	- approve or deny if another user requests to skip the duty and log the reason
	- delete a user
	- make another user an admin
    - generate a new 6 digit floor passkey
- A user should be able to 
	- create an account with name, room number(primary key in db), password and a floor passkey(changeable only by an admin).
	- login to the app with their room number and password
	- mark the duty as "completed" only if the duty was assigned to him/her.
	- request to skip a duty with a **required** reason.
- The app should have a panel at the bottom with three icons/pages: home(icon: a home icon), duties(icon: a mop or a vacuum cleaner) and account
- The home page should greet the user and show the list of duties he/she has at the moment. If they are not currently assigned any duties, the page should display an appropriate message.
- The duties page should display all duties on the floor and their currently assigned room number.
- The account page should 
    - display their account information
    - have an option to update password
    - have an option to update personal details
    - have an option to delete the account
- The app should share a notification with the user if
    - they are assigned a duty
    - an admin approved/denied their duty skip request
    - a new duty was added to the floor
    - an existing duty was deleted

## Additionally:
- Make the UI user-friendly, easy to use and understand.
- Implement error handling such that no error is propagated to the user. If the failure case isn't anticipated, it should only show "Some error occurred.".
- The app should log all events: 
    - account creation/deletion 
    - any kind of failures
    - updation of a duty
    - marking duty completed by a user
    - assignment of duty to someone
    - request by a user to skip a duty
    - approval/denial of a duty skip by an admin
    - addition/updation/deletion of a duty
    - user deletion by an admin. 
    - user becoming an admin.
    - Logins don't need to be logged.

## Open questions:
- The technology to be used to build this app is up to you.
- The choice or architecture of database is open to suggestion. Confirm with me on it.
- Ask me if something is ambiguous.