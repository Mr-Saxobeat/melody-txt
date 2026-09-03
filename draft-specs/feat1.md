# Multiple instruments management

## Current stat

When a user is on the compose/edit melody page, they can remove an instrument tab by clicking on the X button of this instrument and this tab closes. However, it was observed that no request is sent to the API to delete the tab, what is causing bugs.

## Desired state

When a use on the compose/edit melody clicks on X button of an instrument tab, a confirmation modal must appear asking if the user is sure to delete that tab.
If the user answers yes, then a delete request must be sent to the backend deleting that tab.
If the user answers no, then the model closes and nothing happens.

