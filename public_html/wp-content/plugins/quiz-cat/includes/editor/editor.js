/* jshint asi: true */
jQuery(document).ready(function($){
	
	//DISABLE DESCRIPTION METABOX FROM DRAGGABLE ( WILL BREAK THE WYSIHTML )
	$('.meta-box-sortables').sortable({
		disabled: true
	})

	$('.postbox .hndle').css('cursor', 'pointer');
	
	fca_qc_attach_radio_selects()
	
	////////////////
	// SET DEFAULTS
	////////////////
	
	var question_number = $( '.fca_qc_question_item' ).length
	var result_number = $('.fca_qc_result_item ').length
	
	//SET THE SLUG IF ITS EMPTY
	if ( $('#post_name').val() === '' ) {
		$('#post_name').val( $('#post_ID').val() )
	}
	
	//SHOW METABOXES IN CASE HIDDEN IN FREE FOR SOME REASON
	if ( $('#fca_qc_quiz_type_meta_box').length === 0 ) {
		$('#fca_qc_questions_meta_box, #fca_qc_add_result_meta_box').show()
	}
	
	//SET TRANSLATIONS FOR ON/OFF SWITCHES
	$( '.onoffswitch-inner' ).each( function(){
		$(this).attr('data-content-on', fcaQcAdminData.on_string )
		$(this).attr('data-content-off', fcaQcAdminData.off_string )
	})
	
	//HIDE THE INDIVIDUAL QUESTION AND RESULT INPUTS
	if ( $( '.fca_qc_question_input_div' ).length > 1 ) {
		$( '.fca_qc_question_input_div' ).hide()
	}
	if ( $( '.fca_qc_result_input_div' ).length > 1 ) {
		$( '.fca_qc_result_input_div' ).hide()
	}
	
	//SET UP SAVE AND PREVIEW BUTTONS, THEN HIDE THE PUBLISHING METABOX
	var saveButton = '<button type="submit" class="button-primary" id="fca_qc_submit_button">' + fcaQcAdminData.save_string + '</buttton>'
	var previewButton = '<button type="button" class="button-secondary" id="fca_qc_preview_button">' + fcaQcAdminData.preview_string + '</buttton>'

	$( '#normal-sortables' ).append( saveButton )
	$('#fca_qc_submit_button').click(function(event) {
		$(window).unbind('beforeunload')
		event.preventDefault()
		
		// Add target
		var thisForm = $(this).closest('form')
		thisForm.removeAttr('target')

		// Remove preview url
		$('#fca_qc_quiz_preview_url').val('')
		
		// Submit form
		fca_qc_save_question_json( thisForm )
				
		return false
	})
	 
	$( '#normal-sortables' ).append( previewButton )
	$('#fca_qc_preview_button').click(function(event) {
		
		event.preventDefault()
		
		// Add target
		var thisForm = $(this).closest('form')
		thisForm.prop('target', '_blank')
					
		fca_qc_save_question_json( thisForm )	
		
		return false
	})	
	$( '#submitdiv' ).hide()
	
	//HIDE "ADD IMAGE" BUTTONS IF IMAGE HAS BEEN SET
	$('.fca_qc_image').each(function(index){
		if ( $(this).attr('src') !== '' ) {
			$(this).siblings('.fca_qc_quiz_image_upload_btn').hide()
		}
		
	})
	
	// ACTIVATE TOOLTIPS
	jQuery.widget.bridge( 'jQueryUITooltipFCAQC', jQuery.ui.tooltip )
	$('.fca_qc_tooltip').jQueryUITooltipFCAQC({
		position: { my: 'left', at: 'right+2' }
	})
		
	//SHOW OUR MAIN DIV AFTER WE'RE DONE WITH DOM CHANGES
	$( '#wpbody-content').show()

	////////////////
	// ON CLICK EVENT HANDLERS
	////////////////
	
	//NAVIGATION
	
	$('#editor-nav').click(function(){
		$('.nav-tab-active').removeClass('nav-tab-active')
		$(this).addClass('nav-tab-active').blur()
		
		$('#fca_qc_quiz_settings_meta_box, #fca_qc_social_sharing_meta_box, #fca_qc_email_optin_meta_box, #fca_qc_appearance_meta_box').hide()
		
		$('#fca_qc_description_meta_box').show()
		if ( $('#fca_qc_quiz_type_meta_box').length === 0 || $('#fca_qc_quiz_type').val() === 'mc' ) {
			$('#fca_qc_questions_meta_box, #fca_qc_add_result_meta_box').show()
		} else {
			$('#fca_qc_personality_questions_meta_box, #fca_qc_add_personality_result_meta_box').show()
		}

	}).click()
	
	$('#settings-nav').click(function(){
		$('.nav-tab-active').removeClass('nav-tab-active')
		$(this).addClass('nav-tab-active').blur()
		$('#fca_qc_description_meta_box, #fca_qc_questions_meta_box, #fca_qc_add_result_meta_box, #fca_qc_personality_questions_meta_box, #fca_qc_add_personality_result_meta_box').hide()
		$('#fca_qc_quiz_settings_meta_box, #fca_qc_social_sharing_meta_box, #fca_qc_email_optin_meta_box, #fca_qc_appearance_meta_box').show()

	})
	
	//THE ADD QUESTION BUTTON
	$( '#fca_qc_add_question_btn' ).click(function() {

		question_number = question_number + 1

		$( '.fca_qc_question_input_div' ).hide()
		var div_to_append = fcaQcAdminData.questionDiv.replace(/{{QUESTION_NUMBER}}/g, question_number)
		while ( div_to_append.indexOf('{{ID}}') !== -1 ) {
			div_to_append = div_to_append.replace(/{{ID}}/, fca_qc_new_GUID() )
		}
		
		$(this).siblings( '.fca_qc_sortable_questions' ).append(div_to_append)
		
		add_drag_and_drop_sort()
		add_question_heading_text_handlers()
		add_question_and_result_click_toggles()
		attach_delete_button_handlers()
		attach_image_upload_handlers()
		attach_add_answer_button_handlers_free()
		setScoreRanges()
		setQuestionNumbers( $(this).siblings( '.fca_qc_sortable_questions' ) )
		
		$('#fca_qc_explanations').change()
		
	})
	
	//THE ADD RESULT BUTTON
	$( '#fca_qc_add_result_btn' ).click(function() {

		result_number = result_number + 1
		
		$( '.fca_qc_result_input_div' ).hide()
		var div_to_append = fcaQcAdminData.resultDiv.replace(/{{RESULT_NUMBER}}/g, result_number )
		div_to_append = div_to_append.replace(/{{ID}}/g, fca_qc_new_GUID() )
		$(this).siblings('.fca_qc_sortable_results').append(div_to_append)
		add_drag_and_drop_sort()
		add_question_and_result_click_toggles()
		attach_delete_button_handlers()
		attach_image_upload_handlers()
		add_result_heading_text_handlers()
		setScoreRanges()
		fca_attach_wysiwyg()
	})
	
	//MAKES SHORTCODE INPUT AUTO-SELECT THE TEXT WHEN YOU CLICK IT
	$('.fca_qc_shortcode_input').click(function(e) {
		this.select()
	})
	$('#fca_qc_shortcode_label').click(function(e) {
		$('.fca_qc_shortcode_input').select()
	})
	
	
	//MAKES CLICKING LABELS AUTO-SELECT THE NEXT ITEM
	$('.fca_qc_admin_label').click(function(e) {
		$( this ).next().focus()
	})
	
	add_drag_and_drop_sort()
	add_question_and_result_click_toggles()
	add_question_heading_text_handlers()
	add_result_heading_text_handlers()
	attach_delete_button_handlers()
	attach_add_answer_button_handlers_free()
	setScoreRanges()
	attach_image_upload_handlers()

})

//GLOBAL FUNCTIONS

//THE ADD ANSWER BUTTON
function attach_add_answer_button_handlers_free() {
	var $ = jQuery
	$('.fca_qc_add_answer_btn').unbind( 'click' )

	$('.fca_qc_add_answer_btn').click(function() {
		
		var answer_number = parseInt( $(this).siblings('.fca_qc_answer_input_div').length + 1 )
		var question_number = parseInt( $(this).closest('.fca_qc_question_item').attr('id').replace(/[^0-9.]/g, "") )
		
		var div_to_append = fcaQcAdminData.answerDiv.replace(/{{ANSWER_NUMBER}}/g, answer_number )
		div_to_append = div_to_append.replace(/{{QUESTION_NUMBER}}/g, question_number )
		div_to_append = div_to_append.replace(/{{ID}}/g, fca_qc_new_GUID() )
		
		$(this).before(div_to_append)
		attach_delete_button_handlers()

		attach_image_upload_handlers()
		
	})
}


//THE DELETE QUESTION BUTTON
function attach_delete_button_handlers() {
	var $ = jQuery
	
	$('.fca_qc_delete_icon').unbind( 'click' )
	
	$('.fca_qc_delete_icon_confirm').click( function(){	
		
		$( this ).closest( '.' + $(this).data('target') ).remove()
		
		if ( $(this.parentNode).hasClass('fca_qc_personality_result_item') ) {
			add_result_personality_result_text_handlers()
		} else {
			setScoreRanges ()
		}
	})
	
	$('.fca_qc_delete_icon_cancel').click( function(){
		$(this).hide().siblings('.fca_qc_delete_icon').hide()
		$(this).siblings('.fca_qc_delete_button').show()
	})
	
	$('.fca_qc_delete_button').click( function(){
		$(this).siblings('.fca_qc_delete_icon').show()
		$(this).hide()
	})
}
//MAKES RESULT HEADINGS AUTOMATICALLY SHOW THE RESULT TITLE FROM THE INPUT BELOW IT
function add_result_heading_text_handlers() {
	var $ = jQuery
	$('.fca_qc_quiz_result').unbind( 'keyup' )

	$( '.fca_qc_quiz_result' ).keyup( function() {
		$( this ).closest( '.fca_qc_result_input_div').siblings( '.fca_qc_result_label').children( '.fca_qc_result_score_title' ).html( $( this ).val() )
	})	
}
//MAKES QUESTION HEADINGS AUTOMATICALLY SHOW THE QUESTION FROM THE INPUT BELOW IT
function add_question_heading_text_handlers() {
	var $ = jQuery
	$( '.fca_qc_question_text' ).unbind( 'keyup' )
	$( '.fca_qc_question_text' ).keyup( function() {
		$( this ).closest( '.fca_qc_question_input_div').prev().children( '.fca_qc_quiz_heading_text' ).html( $( this ).val() )
	})	
}
//MAKES QUESTION AND RESULT LABELS TOGGLE THE INPUT VISIBILITY ON CLICK
function add_question_and_result_click_toggles() {
	var $ = jQuery
	$( '.fca_qc_question_item, .fca_qc_result_item' ).unbind( 'click' )

	$( '.fca_qc_question_item' ).click( function(e) {
		var trash = $(e.target).hasClass('fca_qc_delete_icon')
		if ( dragCheck === false && !trash ) {
			$( '.fca_qc_question_input_div' ).not($( this ).find( '.fca_qc_question_input_div' )).hide()
			$( this ).find( '.fca_qc_question_input_div' ).toggle( 'fast' )
		}
			
	})	
	$( '.fca_qc_result_item' ).click( function(e) {
		var trash = $(e.target).hasClass('fca_qc_delete_icon')
		if ( dragCheck === false && !trash ) {
			$( '.fca_qc_result_input_div' ).not($( this ).find( '.fca_qc_result_input_div' )).hide()
			$( this ).find( '.fca_qc_result_input_div' ).toggle( 'fast' )	
		}
				
	})	
	
	$( '.fca_qc_question_input_div, .fca_qc_result_input_div, .fca_qc_delete_icon' ).bind( 'click', function(e) {
		e.stopPropagation()
	})
	
}

////////////////
// HELPER FUNCTIONS
////////////////

function fca_qc_save_question_json( thisForm ) {
	
	var $ = jQuery
	
	var questions = []
	
	var $questionList = []
	if ( $('#fca_qc_quiz_type_meta_box').length === 0 || $('#fca_qc_quiz_type').val() === 'mc' ) {
		$questionList = $( '.fca_qc_question_item' ).not( '.fca_qc_personality_question_item' )
	} else {
		$questionList = $( '.fca_qc_personality_question_item' )
	}
		
	$( $questionList ).each(function(){
		
		var answers = []
		$(this).find('.fca_qc_answer_input_div').each(function(){
			
			answers.push({
				"answer": $(this).find('.fca_qc_question_texta').val(),
				"img": $(this).find('.fca_qc_image_input').val(),
				"id": $(this).find('.fca_qc_id').val(),
				"hint":	$(this).find('.fca_qc_hint_tr .fca_qc_question_texta').val(),
				"results":	$(this).find('.fca_qc_multiselect').val()
			})
		})
			
		questions.push({
			"question": $(this).find('.fca_qc_question_text').val(),
			"img": $(this).find('.fca_qc_image_input').val(),
			"id": $(this).find('.fca_qc_id').val(),
			"answers" : answers		
		})
		
	})
	
	$('#fca_qc_questions_json').val( JSON.stringify( questions ) )
	
	thisForm.submit()	
	
}

//FINDS RANGE OF RESULTS FOR EACH RESULT AUTOMATICALLY.
//results -> based on question count, divided by result count, with rounding to cover all
//e.g. 5 ANSWERS, 3 RESULTS = [0-1],[2-3],[4-5]
//at max ( equal to questions ) -> remove ability to add more
//when question or result count changes, have to re-calculate
function setScoreRanges() {
	var $ = jQuery
	var questionCount = $( '.fca_qc_question_item' ).not('.fca_qc_personality_question_item').length
	var resultCount = $( '.fca_qc_result_item' ).not('.fca_qc_personality_result_item').length
	//plus one because zero is a possible result, e.g. you can get 0/10
	var divisor = parseInt ( (questionCount + 1) / resultCount )
	var remainder = ( (questionCount + 1) % resultCount )
	//n is the result 'counter' to be iterated, and passed to the next result to start at
	var n = 0
	
	$( '.fca_qc_result_item' ).not('.fca_qc_personality_result_item').each(function() {
		
		if ( n <= questionCount ) {
			var start = n
			var end = 0
					
			if ( start == questionCount ) {
				
				end = start
				
			} else {
				
				end = start + (divisor - 1)
				if ( remainder !== 0 ) {
					end = end + 1
					remainder = remainder - 1
				}
				if ( end > questionCount ) {
					end = questionCount
				}
				
			}
			
			n = end + 1
						
			$(this).children( '.fca_qc_result_min' ).attr('value', start)
			$(this).children( '.fca_qc_result_max' ).attr('value', end)
			
			if (end == start ) {
				$(this).children('.fca_qc_result_label').children('.fca_qc_result_score_value').html( start + ' ' + fcaQcAdminData.points_string + ': ' )
			} else {
				$(this).children('.fca_qc_result_label').children('.fca_qc_result_score_value').html( start + '-' + end + ' ' + fcaQcAdminData.points_string + ': ')
			}		
		} else {
			$(this).children('.fca_qc_result_label').children('.fca_qc_result_score_value').html( fcaQcAdminData.unused_string )
		}

	})
}	


function setQuestionNumbers( $set ){
	var $ = jQuery
	var n = 1;
	$set.find('.fca_qc_question_item').each(function() {
		$(this).find( '.fca_qc_quiz_heading_question_number' ).html( fcaQcAdminData.question_string + ' ' + n + ': ')
		n = n + 1
	})
}

////////////////
// MEDIA UPLOAD
////////////////
		
function attach_image_upload_handlers() {
	var $ = jQuery
	//ACTION WHEN CLICKING IMAGE UPLOAD
	$('.fca_qc_quiz_image_upload_btn, .fca_qc_image, .fca_qc_quiz_image_change_btn').unbind( 'click' )
	//HANDLER FOR RESULTS AND META IMAGES
	$('.fca_qc_quiz_image_upload_btn, .fca_qc_image, .fca_qc_quiz_image_change_btn').click(function(e) {
		
		e.preventDefault()
		var $this = $( this )
		
		//IF WE CLICK ON THE IMAGE VS THE BUTTON IT HAS TO WORK A LITTLE DIFFERENTLY
		if ( $(this).hasClass( 'fca_qc_quiz_image_change_btn' ) ) {
			$this = $( this.parentNode ).siblings('.fca_qc_quiz_image_upload_btn')
		} else if ( $(this).hasClass( 'fca_qc_image' ) ) {
			$this = $( this ).siblings('.fca_qc_quiz_image_upload_btn')
		}
		
		var wpmedia = wp.media( {
			frame: "post",
			title: fcaQcAdminData.selectImage_string,
			multiple: false
		}).open()
			.on('insert', function(){
				//GET VALUE FROM WP MEDIA UPLOAD THING
				var image = wpmedia.state().get('selection').first()
				var display = wpmedia.state().display( image ).toJSON()
				image = image.toJSON()
				//Do something with attachment.id and/or attachment.url here
				var image_url = image.sizes[display.size].url
	
				//ASSIGN VALUE
				if ( image_url ) {
					$this.siblings('.fca_qc_image_input').attr('value', image_url)
					$this.siblings('.fca_qc_image').attr('src',image_url)	
					//UNHIDE THE REMOVE AND CHANGE IMAGE BUTTONS
					$this.siblings('.fca_qc_image_hover_controls').find('.fca_qc_quiz_image_change_btn').show()
					$this.siblings('.fca_qc_image_hover_controls').find('.fca_qc_quiz_image_revert_btn').show()
				}

				$this.hide()
				
			})
	})
	
	//ACTION WHEN CLICKING REMOVE IMAGE
	$('.fca_qc_quiz_image_revert_btn').unbind( 'click' )
	$('.fca_qc_quiz_image_revert_btn').click( function(e) {
		$( this.parentNode ).siblings('.fca_qc_image_input').attr('value', '')
		$( this.parentNode ).siblings('.fca_qc_image').attr('src', '' )
		$( this.parentNode ).siblings('.fca_qc_quiz_image_upload_btn').show()
		$( this ).hide()
		$( this ).siblings( '.fca_qc_quiz_image_upload_btn' ).hide()
		
	})
}

//DRAG AND DROP SUPPORT
var dragCheck = false;
function add_drag_and_drop_sort() {
	var $ = jQuery
	
	$( '.fca_qc_sortable_results, .fca_qc_sortable_questions' ).sortable({
		revert: true,
		cancel: ':input,button, .fca-wysiwyg-html',
		start: function(){
			// On drag set that flag to true
			dragCheck = true
		},
		stop: function(){
			// On stop of dragging reset the flag back to false
			dragCheck = false
			//REDRAW WYSIWYG CAUSE IT BREAKS DRAG
			fca_attach_wysiwyg()
		}

	})
	
	$( '.fca_qc_sortable_results' ).unbind( 'sortupdate' )
	$( '.fca_qc_sortable_results' ).on( 'sortupdate', function( event, ui ) {
		setScoreRanges()

	})

	$( '.fca_qc_sortable_questions' ).unbind( 'sortupdate' )
	$( '.fca_qc_sortable_questions' ).on( 'sortupdate', function( event, ui ) {
		setQuestionNumbers( $(this) )

	})

}

//GUID Generation ( http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/21963136#21963136 )
var fca_qc_hash_seed = []
for (var i=0; i<256; i++) { 
	fca_qc_hash_seed[i] = (i<16?'0':'')+(i).toString(16)
}
function fca_qc_new_GUID() {
	var d0 = Math.random()*0x100000000>>>0
	var d1 = Math.random()*0x100000000>>>0
	var d2 = Math.random()*0x100000000>>>0
	var d3 = Math.random()*0x100000000>>>0
	
	return fca_qc_hash_seed[d0&0xff]+fca_qc_hash_seed[d0>>8&0xff]+fca_qc_hash_seed[d0>>16&0xff]+fca_qc_hash_seed[d0>>24&0xff]+'-'+
	fca_qc_hash_seed[d1&0xff]+fca_qc_hash_seed[d1>>8&0xff]+'-'+fca_qc_hash_seed[d1>>16&0x0f|0x40]+fca_qc_hash_seed[d1>>24&0xff]+'-'+
	fca_qc_hash_seed[d2&0x3f|0x80]+fca_qc_hash_seed[d2>>8&0xff]+'-'+fca_qc_hash_seed[d2>>16&0xff]+fca_qc_hash_seed[d2>>24&0xff]+
	fca_qc_hash_seed[d3&0xff]+fca_qc_hash_seed[d3>>8&0xff]+fca_qc_hash_seed[d3>>16&0xff]+fca_qc_hash_seed[d3>>24&0xff]
}
//RADIO INPUT SELECT JS	
function fca_qc_attach_radio_selects() {
	var $ = jQuery
	$('.qc_radio_input').change(function() {
		$(this).closest('.radio-toggle').children('label').removeClass('selected')
		$(this).closest('label').addClass('selected')
	})
}