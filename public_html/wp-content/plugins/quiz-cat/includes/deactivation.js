/* jshint asi: true */
jQuery(document).ready(function($){
	
	var $deactivateButton = $('#the-list tr.active').filter( function() { return $(this).data('plugin') === 'quiz-cat/quizcat.php' } ).find('.deactivate a')
		
	$deactivateButton.click(function(e){
		e.preventDefault()
		$deactivateButton.unbind('click')
		$('body').append(fca_qc.html)
		fca_qc_uninstall_button_handlers( $deactivateButton.attr('href') )
		
	})
}) 

function fca_qc_uninstall_button_handlers( url ) {
	var $ = jQuery
	$('#fca-qc-deactivate-skip').click(function(){
		$(this).prop( 'disabled', true )
		window.location.href = url
	})
	$('#fca-qc-deactivate-send').click(function(){
		$(this).prop( 'disabled', true )
		$(this).html('...')
		$('#fca-qc-deactivate-skip').hide()
		$.ajax({
			url: fca_qc.ajaxurl,
			type: 'POST',
			data: {
				"action": "fca_qc_uninstall",
				"nonce": fca_qc.nonce,
				"msg": $('#fca-qc-deactivate-textarea').val()
			}
		}).done( function( response ) {
			console.log ( response )
			window.location.href = url			
		})	
	})
	
}