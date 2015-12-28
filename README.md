Commenting Extension
======================

The purpose of this extension is to allow for comments to be inserted at any point on the backend forms when editing an item.

Enabling Commenting
===============================

By default commenting is enabled.
To add comments to a contenttype:

    fields:
        comments:
            type: textarea
            class: comments-json
