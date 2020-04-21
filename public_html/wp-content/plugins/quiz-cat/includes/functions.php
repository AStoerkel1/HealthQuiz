<?php

function fca_qc_share_string ( $quiz_id = 0, $quiz_text_strings = '', $result_title = '{{MY_QUIZ_RESULT}}' ) {
		
	if ( empty ( $quiz_text_strings ) ) {
		$quiz_text_strings = fca_qc_set_quiz_text_strings();
	}
	
	$quiz_title = get_the_title( $quiz_id );	
	return esc_attr( str_replace ( "'",  "&#39;", ( apply_filters( 'fca_qc_share_text', $quiz_text_strings['i_got'] . " \"$result_title\" - $quiz_title" ) ) )  );
}


function fca_qc_convert_entities ( $array ) {
	$array = is_array($array) ? array_map('fca_qc_convert_entities', $array) : html_entity_decode( $array, ENT_QUOTES );

	return $array;
}

//INFO SPAN
function fca_qc_info_span( $text = '', $link = '' ) {
	if ( empty( $link ) ) {
		return "<span class='fca_qc_info_span'>$text</span>";
	} else {
		return "<span class='fca_qc_info_span'><a class='fca_lpc_api_link' href='$link' target='_blank'>$text</a></span>";
	}
}

//OUTPUTS HTML FOR IMAGE ADD/CHANGE
function fca_qc_add_image_input($img = '', $name = '', $id = '', $hidden = false) {
	$hidden = $hidden ? "style='display:none;'" : '';
	$name = empty( $name ) ? '' : "name='$name'";
	
	$html = '';
	
	$html .= "<input type='text' class='fca_qc_image_input' $name id='$id' style='display: none;' value='$img'>";
	$html .= "<button $hidden title='" . __('Adds an image (optional).  For best results, use images at least 250px wide and use the same image resolution for each image you add to an answer.', 'quiz-cat') . "' type='button' class='button-secondary fca_qc_quiz_image_upload_btn'>" . __('Add Image', 'quiz-cat') . "</button>";
	$html .= "<img class='fca_qc_image' style='max-width: 252px' src='$img'>";
		
	$html .= "<div class='fca_qc_image_hover_controls'>";
		
		//IF PLACEHOLDER IS THERE DON'T SHOW THE "REMOVE OR CHANGE" BUTTON
		if ( empty ( $img ) ) {
			$html .= "<button type='button' class='button-secondary fca_qc_quiz_image_change_btn' $hidden>" . __('Change', 'quiz-cat') . "</button>";
			$html .= "<button type='button' class='button-secondary fca_qc_quiz_image_revert_btn' $hidden>" . __('Remove', 'quiz-cat') . "</button>";
		}else {
			$html .= "<button type='button' class='button-secondary fca_qc_quiz_image_change_btn'>" . __('Change', 'quiz-cat') . "</button>";
			$html .= "<button type='button' class='button-secondary fca_qc_quiz_image_revert_btn'>" . __('Remove', 'quiz-cat') . "</button>";
		}
		
	$html .=  '</div>';
	
	return $html;
}

function fca_qc_add_wysiwyg ( $value = '', $name = '' ) {	
	$html = '';
		$html .= "<div class='fca-wysiwyg-nav' style='display:none'>";
			$html .= '<div class="fca-wysiwyg-group fca-wysiwyg-text-group">';
				$html .= '<button type="button" data-wysihtml5-command="bold" class="fca-nav-bold fca-nav-rounded-left" ><span class="dashicons dashicons-editor-bold"></span></button>';
				$html .= '<button type="button" data-wysihtml5-command="italic" class="fca-nav-italic fca-nav-no-border" ><span class="dashicons dashicons-editor-italic"></span></button>';
				$html .= '<button type="button" data-wysihtml5-command="underline" class="fca-nav-underline fca-nav-rounded-right" ><span class="dashicons dashicons-editor-underline"></span></button>';
			$html .= "</div>";
			$html .= '<div class="fca-wysiwyg-group fca-wysiwyg-alignment-group">';
				$html .= '<button type="button" data-wysihtml5-command="justifyLeft" class="fca-nav-justifyLeft fca-nav-rounded-left" ><span class="dashicons dashicons-editor-alignleft"></span></button>';
				$html .= '<button type="button" data-wysihtml5-command="justifyCenter" class="fca-nav-justifyCenter fca-nav-no-border" ><span class="dashicons dashicons-editor-aligncenter"></span></button>';
				$html .= '<button type="button" data-wysihtml5-command="justifyRight" class="fca-nav-justifyRight fca-nav-rounded-right" ><span class="dashicons dashicons-editor-alignright"></span></button>';
			$html .= "</div>";
			
			$html .= '<div class="fca-wysiwyg-group fca-wysiwyg-link-group">';
				$html .= '<button type="button" data-wysihtml5-command="createLink" style="border-right: 0;" class="fca-wysiwyg-link-group fca-nav-rounded-left"><span class="dashicons dashicons-admin-links"></span></button>';
				$html .= '<button type="button" data-wysihtml5-command="unlink" class="fca-wysiwyg-link-group fca-nav-rounded-right"><span class="dashicons dashicons-editor-unlink"></span></button>';
				$html .= '<div class="fca-wysiwyg-url-dialog" data-wysihtml5-dialog="createLink" style="display: none">';
					$html .= '<input data-wysihtml5-dialog-field="href" value="http://">';
					$html .= '<a class="button button-secondary" data-wysihtml5-dialog-action="cancel">' . __('Cancel', 'quiz-cat') . '</a>';
					$html .= '<a class="button button-primary" data-wysihtml5-dialog-action="save">' . __('OK', 'quiz-cat') . '</a>';
				$html .= "</div>";
			$html .= "</div>";
			
			$html .= '<button class="fca-wysiwyg-view-html action" type="button" data-wysihtml5-action="change_view">HTML</button>';
	
		$html .= "</div>";
		$html .= "<textarea class='fca-wysiwyg-html fca-qc-input-wysi fca-qc-$name' name='$name'>$value</textarea>";

	return $html;
}

function fca_qc_sanitize_text( $data ) {
	
	if ( is_array ( $data ) ) {
		forEach ( $data as $k => $v ) {
			$data[ $k ] = fca_qc_sanitize_text( $v );
		}
		return $data;
	}
	
	$data = sanitize_text_field( $data );
		
	return $data;

}

function fca_qc_kses_html( $data ) {
	$allowed_tags = wp_kses_allowed_html( 'post' );
	//ADD VIDEO/EMBEDS
	$allowed_tags['iframe'] = array( 'src' => true, 'width' => true, 'height' => true, 'frameborder' => true );
	
	if ( is_array ( $data ) ) {
		forEach ( $data as $k => $v ) {
			$data[ $k ] = fca_qc_kses_html( $v );
		}
		return $data;
	}
	
	$data = wp_kses( $data, $allowed_tags );
		
	return $data;

}
	
function fca_qc_tooltip( $text = 'Tooltip', $icon = 'dashicons dashicons-editor-help' ) {
	return "<span class='$icon fca_qc_tooltip' title='" . htmlentities($text) . "'></span>";
}

//RN NOTE: TODO REWRITE ? REMOVE?
function fca_qc_convert_question_meta() {

}

//RN NOTE: ONLY DO THIS IF THEY HAVE STATS OR CSV OR SOMETHING LIKE THAT .. EG NOT FREE / PERSONAL
//CONVERT OLD CSV FILES INTO DB ENTRIES
function fca_qc_convert_csv() {
	update_option( 'fca_qc_meta_version', '1.5.0');
	$upload_dir = wp_upload_dir();
	$upload_dir = $upload_dir['basedir'] . '/quizcat/*';
	
	$files_found = glob( $upload_dir );
	
	if ( !is_array( $files_found ) ) {
		return true;
	}
	
	$files_updated = 0;
	
	forEach ( $files_found as $file ) {
		
		$filename = basename( $file, '.csv' );
		$filename_explode = explode( 'quizcat_log_', $filename );
				
		$quiz_id = empty( $filename_explode[1] ) ? 0 : intVal ( $filename_explode[1] );
				
		if ( is_int( $quiz_id ) && $quiz_id > 0 ) {
			
			//MAKE THE DB TABLES IF THEY ARENT THERE
			fca_qc_maybe_create_quiz_row( $quiz_id ); 
			$handle = fopen( $file, 'r' );
			$rows = 0;
			$writes = 0;
			
			while ( ( $data = fgetcsv( $handle, 0, "\t" ) ) !== FALSE ) {
				
				$rows = $rows + 1;
				
				//SAVE INDIVIDUAL USER RESPONSES TO DB
				//THE FIRST 4 CSV ENTRIES ARE META DATA
				
				$response_save = array(
					'email' => empty( $data[0] ) ? '' : $data[0],
					'name' => empty( $data[1] ) ? '' : $data[1],
					'result' => empty( $data[3] ) ? '' : $data[3],
					'responses' => array(),
				);
				
				//THE ENTRIES AFTER 4 ARE QUESTION, ANSWER, QUESTION, ANSWER ETC -- SHOULD BE GROUPED IN 2s
				$i = 4;
				for ( $i; $i < count( $data ) - 1; $i = $i + 2 ) {
					$response_save['responses'][] = array(
						'question' => $data[ $i ],
						'answer' => $data[ $i + 1 ],
					);
				}
				
				//WRITE TO THE NEW FORMAT
				if ( fca_qc_save_responses( $quiz_id, $response_save ) ) {
					$writes = $writes + 1;
				}
				
			}
			fclose( $handle );
			
			//CLEAN UP
			if ( $rows === $writes ) {
				$files_updated = $files_updated + 1;
				unlink( $file );
			}
		}
	}
		
	if ( $files_updated === count( $files_found ) ) {
		//IT WORKED?
		return true;
	}
	
	return false;
	
}	

//UNINSTALL ENDPOINT
function fca_qc_uninstall_ajax() {
	
	$msg = sanitize_text_field( $_POST['msg'] );
	$nonce = sanitize_text_field( $_POST['nonce'] );
	$nonceVerified = wp_verify_nonce( $nonce, 'fca_qc_uninstall_nonce') == 1;

	if ( $nonceVerified && !empty( $msg ) ) {
		
		$url =  "https://api.fatcatapps.com/api/feedback.php";
				
		$body = array(
			'product' => 'quizcat',
			'msg' => $msg,		
		);
		
		$args = array(
			'timeout'     => 15,
			'redirection' => 15,
			'body' => json_encode( $body ),	
			'blocking'    => true,
			'sslverify'   => false
		); 		
		
		$return = wp_remote_post( $url, $args );
		
		wp_send_json_success( $msg );

	}
	wp_send_json_error( $msg );

}
add_action( 'wp_ajax_fca_qc_uninstall', 'fca_qc_uninstall_ajax' );

//GDPR STUFF
function fca_qc_is_gdpr_country( $accept_language = '' ) {
	$accept_language = empty( $accept_language ) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : $accept_language;
	$gdpr_countries = array(
		"AT",
		"BE",
		"BG",
		"CY",
		"CZ",
		"DE",
		"DK",
		"EE",
		"EL",
		"ES",
		"FI",
		"FR",
		"HR",
		"HU",
		"IE",
		"IT",
		"LT",
		"LU",
		"LV",
		"MT",
		"NL",
		"PL",
		"PT",
		"RO",
		"SE",
		"SI",
		"SK",
		"UK",
		"GL",
		"GF",
		"PF",
		"TF",
		"GP",
		"MQ",
		"YT",
		"NC",
		"RE",
		"BL",
		"MF",
		"PM",
		"WF",
		"AW",
		"AN",
		"BV",
		"AI",
		"BM",
		"IO",
		"VG",
		"KY",
		"FK",
		"FO",
		"GI",
		"MS",
		"PN",
		"SH",
		"GS",
		"TC",
	);
		
	$code = '';
	//in some cases like "fr" or "hu" the language and the country codes are the same
	if ( strlen( $accept_language ) === 2 ){
		$code = strtoupper( $accept_language ); 
	} else if ( strlen( $accept_language ) === 5 ) {          
		$code = strtoupper( substr( $accept_language, 3, 5 ) ); 
	} 
	if ( in_array( $code, $gdpr_countries ) ) {
		return true;
	}
	
	if ( strlen( $accept_language ) > 5 ) {
		
		for ( $i=0; $i+2 < strlen( $accept_language ); $i++ ){
			$code = strtoupper( substr( $accept_language, $i, $i+2 ) );
			if ( in_array( $code, $gdpr_countries ) ) {
				return true;
			}
		}
	}
	return false;
}
function fca_qc_show_gdpr_checkbox(){
	$gdpr_checkbox = get_option( 'fca_qc_gdpr_checkbox' );
	if ( !empty( $gdpr_checkbox ) ) {
		$gdpr_locale = get_option( 'fca_qc_gdpr_locale' );
		if ( empty( $gdpr_locale ) ) {
			return true;
		}
		return fca_qc_is_gdpr_country();
	}
	
	return false;
}