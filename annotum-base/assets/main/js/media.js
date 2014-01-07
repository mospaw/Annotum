/**
 * CF Image Library Filter
 */

var wpActiveEditor;
(function($) {
	$(function() {
		// Override wpActiveEditor instead of having to rewrite the entire media-upload.js file
		$('.insert-media').on('click', function(e) {
			wpActiveEditor = $(this).data('editor');
		});

		var media = wp.media;
		if (!media || !media.view || !media.view.Settings.AttachmentDisplay) {
			return;
		}

		// Supercede the default AttachmentsBrowser view
		var AttachmentDisplay = media.view.Settings.AttachmentDisplay;
		media.view.Settings.AttachmentDisplay = AttachmentDisplay.extend({
			className: 'attachment-display-settings',
			template:  media.template('anno-attachment-display-settings')
		});

		var AttachmentDetails = media.view.Attachment.Details;
		media.view.Attachment.Details = AttachmentDetails.extend({
			template:  media.template('anno-attachment-details')
		});

		// Override default send. Add in the display type
		wp.media.editor.send = {
			attachment: function( props, attachment ) {
				var caption = attachment.caption,
					options, html;

				// If captions are disabled, clear the caption.
				if ( ! wp.media.view.settings.captions )
					delete attachment.caption;

				props = wp.media.string.props( props, attachment );

				options = {
					id:           attachment.id,
					post_content: attachment.description,
					post_excerpt: caption
				};

				if ( props.linkUrl )
					options.url = props.linkUrl;

				if ( 'image' === attachment.type ) {
					html = wp.media.string.image( props );
					// Only unique part to annotum is the displaytype... seems lke there should be
					// a better way.
					_.each({
						align: 'align',
						size:  'image-size',
						alt:   'image_alt',
						displaytype: 'display'

					}, function( option, prop ) {
						if ( props[ prop ] ) {
							options[ option ] = props[ prop ];
						}
					});
				} else if ( 'video' === attachment.type ) {
					html = wp.media.string.video( props, attachment );
				} else if ( 'audio' === attachment.type ) {
					html = wp.media.string.audio( props, attachment );
				} else {
					html = wp.media.string.link( props );
					options.post_title = props.title;
				}
				return wp.media.post( 'send-attachment-to-editor', {
					nonce:      wp.media.view.settings.nonce.sendToEditor,
					attachment: options,
					html:       html,
					post_id:    wp.media.view.settings.post.id
				});
			},

			link: function( embed ) {
				return wp.media.post( 'send-link-to-editor', {
					nonce:   wp.media.view.settings.nonce.sendToEditor,
					src:     embed.linkUrl,
					title:   embed.title,
					html:    wp.media.string.link( embed ),
					post_id: wp.media.view.settings.post.id
				});
			}
		};
	});
})(jQuery);
