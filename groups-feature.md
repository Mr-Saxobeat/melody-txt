# Groups feature

Now we will implement user groups.

- A user groups will gather a group of users that will have permissions in this group. The group will also gather melodies and setlists.

## Users group rules:
- Users can create and manage its own groups.
- Users can add and manage other users to groups.
- The user who creates the group will have read and write permissions to the group.
- The use who created the group can't be removed from the group.
- The user who adds other user to the group can manage the permissions of the added user.
- The user permissions on a group are: read and write.
- The read permissions allows: view group members, view group melodies and view group setlists.
- The write permissions allows: add/remove group members, add/edit/remove group melodies, add/edit/remove group setlists.

## Melodies group rules:
- All public melodies can be added to a group.
- The users with write permissions in a group can edit the musics in the group even they aren't the owner of the music.
- When a music is deleted, it will be removed from the group.
- The users can add a music to a group even if they aren't the owner of the music.

## Setlists group rules:
- All public setlists can be added to a group.
- The users with write permissions in a group can edit the setlists in the group even they aren't the owner of the setlist.
- When a setlist is deleted, it will be removed from the group.
- The users can add a setlist to a group even if they aren't the owner of the setlist.