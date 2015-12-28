/**
 * Add comenting functionality
 *
 * @mixin
 * @namespace Bolt.data
 *
 * @param {Object} bolt - The Bolt module.
 * @param {Object} $ - jQuery.
 */
(function (bolt, $) {
    bolt.commentingExt = bolt.commentingExt || {};

    var comments = {},
        currentUser = $('.nav .fa.fa-user').siblings('span').html();


    /**
     * Initial setup
     */
    function init() {
        // Hide comments field
        $('.comments-json').closest('.form-group').hide();

        // Add the popover to all text input and textarea fields
        addComments('#editcontent');

        // Parse through the comments
        updateComments();

        // Set listeners
        listen();
    }

    /**
     * Add comments to inputs in DOM element
     * @param {Object,string} el - jQuery object or selector
     *                             to apply the comments to
     */
    function addComments(el) {
      $(el).find('input.form-control[type=text], textarea')
           .each(function(index,el) {
               if(!$(el).attr('id'))
                 $(el).attr('id',$(el).attr('name'));
               $(el).addCommentsPopover();
           });
    }

    /**
     * Update the comments
     * @param {Object} setComments - Object to replace the current comments
     */
    function updateComments(setComments) {
      comments = setComments || JSON.parse($('.comments-json').val() || '{}');
      // Parse existing JSON
      for(var fieldId in comments) {
        var $popover = $('#'+fieldId).getPopover(),
            $trigger = $('#'+fieldId).getPopoverTrigger();

        // Remove existing badge
        $trigger.siblings('.badge').remove();

        // There are no comments for this field
        //
        // NB: This condition seems inneccessary but is an attempt to fix a
        //     bug visible in Chromium browser
        if(comments[fieldId] && !comments[fieldId].length) {
          // Remove from comments object
          delete comments[fieldId];
          // Clear the comments block
          $popover.find('.popover-comments').html('');
          // Mute the comment trigger icon
          $trigger.addClass('text-muted');
        } else {
          // If this field has any comments
          addBadge(fieldId, comments[fieldId].length);
        }

        // If this field has a popover
        if($popover && comments[fieldId]) {
          // Clear the list of comments
          $popover.find('.popover-comments').html('');

          // Create the content
          var content = '', comment = null;
          for(var index in comments[fieldId]) {
            var trash = '';
            comment = comments[fieldId][index];

            // Rudimentary check that user has permission to delete this
            if(currentUser == comment.user)
              trash = '<i class="fa fa-trash pull-right" data-field="' +
                        fieldId + '" data-delete="' + comment.datetime + '"></i>';
              
            content += '<div class="popover-comment">' + 
                          trash + comment.content + '<br />' +
                          '<small><strong>' +
                          comment.user +
                          '</strong> &nbsp; <span class="text-muted">' +
                          moment(comment.datetime).fromNow() +
                          '</span></small></div>';
          }
          $popover.find('.popover-comments').html(content);

          // Animate the comments in TODO: Move to CSS
          setTimeout(function() {
            $(this).find('.popover-comments').css('max-height','300px');
          }.bind($popover),50);
        }
      }
      // If we were overriding the comments, update the field
      if(setComments) {
        $('.comments-json').val(JSON.stringify(comments));
      }
    }

    function listen() {
      // TODO: When you click away from a popover, close it

      // Listen to nested content extension to add the comment bubbles to new
      // activities
      document.addEventListener('newNestedContent', function (e) {
        addComments(e.detail.container);
      }, false);

      // Should switch the ids of any fields that previously didn't have them
      document.addEventListener('fieldIdChanged', function (e) {
        updateInputFields(e.detail.oldId, e.detail.id);
      }, false);

      // Close all popovers if a modal is shown
      $(document).on('show.bs.modal',  '.modal', function (e) {
        $('.popover').siblings('i').popover('hide');
      });

      // Close popover
      $(document).on('click','.popover .btn-close', function(e) {
        e.preventDefault();
        $(this).closest('.popover').siblings('i').popover('hide');
        return false;
      });

      // Toggle enabling of save button
      $(document).on('keyup','.popover textarea', function(e) {
        $(this).closest('.popover').find('.btn-save')
            .toggleClass('disabled', !$(this).val().length);
      });

      // Delete comment
      $(document).on('click','.popover-comment *[data-delete]', function(e) {
        var fieldId = $(this).data('field');
        if(comments[fieldId]) {
          comments[fieldId] = comments[fieldId].filter(function(comment) {
            return comment.datetime != $(this).data('delete');
          }.bind(this));
        }

        // Update comments
        updateComments(comments);
      });

      // Save button in popover
      $(document).on('click','.popover .btn-save', function(e) {
        e.preventDefault();
        var $textarea = $('#'+$(this).data('save')),
            $field = $('#'+$textarea.data('field'));

        if(!$textarea || !$field) {
          console.error('No associated text field');
          return false;
        }

        // Check that there is content
        if($textarea.val().length > 0) {
          // Create comment object
          var comment = {
            content: $textarea.val(),
            datetime: Date.now(),
            field: $field.attr('id'),
            resolved: false,
            parent: null,
            user: currentUser
          };
          
          // Add comment to comments object
          comments[comment.field] = comments[comment.field] || [];
          comments[comment.field].push(comment);

          // Clear out the textarea
          $textarea.val('');
          updateComments(comments);

          var $form = $('.comments-json').closest('.form');
          // Save the form
          if ($form.data('isSaving') && $form.data('isSaving').state() === "pending") {
            $form.data('isSaving').done(function() {
              $form.trigger('save');
            });
          } else {
            $form.trigger('save');
          }
        }
        return false;
      });
    }

    /**
     * Add the number of comments in a badge
     * @param {string} fieldId - The ID of the field
     * @param {number} numComments - The number of comments associated to
     *                               that field
     */
    function addBadge(fieldId, numComments) {
      if (numComments) {
        var $badge = $('<span>').addClass('badge pull-right').html(numComments),
            $trigger = $('#'+fieldId).getPopoverTrigger();

        // Un-mute the bubble and attach the badge
        $trigger.removeClass('text-muted').after($badge);
      }
    }

    /**
     * Update the id of an input field
     * @param {number} oldId - The old ID of the field
     * @param {number} fieldId - The new ID of the field
     */
    function updateInputFields(oldId, fieldId) {
      if (oldId != fieldId) {
        comments = JSON.parse($('.comments-json').val() || '{}');

        // Update the saved comments
        var comment = comments[oldId];
        comments[fieldId] = comment;
        delete comments[oldId];

        $('.comments-json').val(JSON.stringify(comments));

        // Destroy the old popover
        $('#icon-' + oldId).popover('destroy').remove();
        $('#' + fieldId).addCommentsPopover();
        if (comments[fieldId])
          addBadge(fieldId, comments[fieldId].length);
      }
    }

    /*
     * Create popover for comments
     */
    $.fn.addCommentsPopover = function() {
      // Get the input field 
      var $this = $(this.context).hasClass('form-control') ? $(this.context) : $(this),
          title = $this.attr('name'),
          field = $this.attr('id') || title,
          $icon = $('<i>').addClass('fa fa-comment-o pull-right text-muted')
                          .attr('id', 'icon-' + field);

      if (!$this.is('input, textarea') || $this.attr('type') == 'hidden') return;

      // Remove any old icons and badges
      $this.siblings('label').find('i,.badge').remove();

      // Add in the new icon
      $this.siblings('label').append($icon);

      // Construct the popover content
      var popover_content = '<div class="popover-comments"></div>' +
        '<div class="popover-textarea">' +
        '<textarea name="comment" style="height: 50px; min-height: initial;"' +
        'id="comment-' + field + '" data-field="' + field + '"></textarea>' +
        '<div class="text-right">' +
        '<button class="btn btn-xs btn-link btn-close">Close</button> ' +
        '<button class="btn btn-xs btn-success btn-save disabled"' +
        ' data-save="comment-' + field + '">Save</button>' +
        '</div></div>';

      // Initialize the popover
      $this.getPopoverTrigger().attr('data-popover','popover').attr('data-content',popover_content).popover({
          html: true
        }).on('show.bs.popover', function () {
          $this.getPopover().addClass('comments-popover');
          // Hide all other popovers
          $('[data-popover=popover]').not(this).popover('hide');
        }).on('shown.bs.popover', function () {
          updateComments();
        });
    }

    /**
     * Get the popover element
     * @returns {jQuery.object}
     */
    $.fn.getPopover = function() {
      $el = $(this).getPopoverTrigger();
      if($el.data('bs.popover') && $el.data('bs.popover').$tip)
        return $($el.data('bs.popover').$tip[0]); 
      return false;
    }

    /**
     * Get the element(s) that trigger the popover
     * @returns {jQuery.object}
     */
    $.fn.getPopoverTrigger = function() {
      $el = $(this).siblings('label').find('i').first();
      return $el;
    }

    init();

}(Bolt || {}, jQuery));
