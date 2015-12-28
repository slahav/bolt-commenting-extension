Editorial Commenting Extension
==============================

The purpose of this extension is to allow for editorial comments to be inserted at any point on the backend forms when editing an item.

Enabling Commenting
===================

By default commenting is enabled.
To add comments to a specific contenttype, please add the comments field, use the following example:

    fields:
        comments:
            type: textarea
            class: comments-json

This will add a commenting bubble to every field on the form (right aligned).<br />
Every time the user will click the commenting bubble, a small form will popup that will include of a textarea, 'Save' button,
and a 'Close' button.<br />
<br />
When a previous comments exist on a certain that, there will be a counter next to the bubble, showing the amount of comments
that exist for that field. When clicking the counter, a list of all the comments will be displayed. For each of the comments
the following information will be displayed:<br />
1. user made the comment.<br />
2. date time of the comment.<br />
3. comment details.<br />