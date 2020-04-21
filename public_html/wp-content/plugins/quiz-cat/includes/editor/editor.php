<?php

////////////////////////////
// EDITOR PAGE 
////////////////////////////

//ENQUEUE ANY SCRIPTS OR CSS FOR OUR ADMIN PAGE EDITOR
function fca_qc_admin_enqueue( $hook ) {
	global $post;  
	if ( ($hook == 'post-new.php' || $hook == 'post.php')  &&  $post->post_type === 'fca_qc_quiz' ) {  
		wp_enqueue_media();	
		wp_enqueue_style('dashicons');
		wp_enqueue_script('jquery');
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-tooltip');
		
		wp_enqueue_script('fca_qc_wysi_js_main', FCA_QC_PLUGINS_URL . '/includes/wysi/wysihtml.min.js', array(), FCA_QC_PLUGIN_VER, true );		
		wp_enqueue_style('fca_qc_wysi_css', FCA_QC_PLUGINS_URL . '/includes/wysi/wysi.min.css', array(), FCA_QC_PLUGIN_VER );
		wp_enqueue_script('fca_qc_wysi_js', FCA_QC_PLUGINS_URL . '/includes/wysi/wysi.min.js', array( 'jquery', 'fca_qc_wysi_js_main' ), FCA_QC_PLUGIN_VER, true );		
		
		$editor_dependencies = array( 'fca_qc_wysi_js_main', 'fca_qc_wysi_js', 'jquery','jquery-ui-core', 'jquery-ui-tooltip');
		
		if ( FCA_QC_DEBUG ) {
			wp_enqueue_script('fca_qc_admin_js', FCA_QC_PLUGINS_URL . '/includes/editor/editor.js', $editor_dependencies, FCA_QC_PLUGIN_VER, true );		
			wp_enqueue_style( 'fca_qc_admin_stylesheet', FCA_QC_PLUGINS_URL . '/includes/editor/editor.css', array(), FCA_QC_PLUGIN_VER );			
			
		} else {
			wp_enqueue_script('fca_qc_admin_js', FCA_QC_PLUGINS_URL . '/includes/editor/editor.min.js', $editor_dependencies, FCA_QC_PLUGIN_VER, true );		
			wp_enqueue_style( 'fca_qc_admin_stylesheet', FCA_QC_PLUGINS_URL . '/includes/editor/editor.min.css', array(), FCA_QC_PLUGIN_VER );
		}

		
		$admin_data = array (
			//A TEMPLATE DIV OF THE QUESTION AND RESULT DIVS, SO WE CAN ADD MORE OF THEM VIA JAVASCRIPT
			'questionDiv' => 	fca_qc_render_question( array(), '{{QUESTION_NUMBER}}' ),
			'resultDiv' 	=> 	fca_qc_render_result( array(), '{{RESULT_NUMBER}}' ),
			'answerDiv' 	=> 	fca_qc_render_answer( array(), '{{QUESTION_NUMBER}}', '{{ANSWER_NUMBER}}' ),

			//SOME LOCALIZATION STRINGS FOR JAVASCRIPT STUFF
			'navigationWarning_string' => __( "You have entered new data on this page.  If you navigate away from this page without first saving your data, the changes will be lost.", 'quiz-cat'),
			'sureWarning_string' => 	 __( 'Are you sure?', 'quiz-cat'),
			'selectImage_string' => __('Select Image', 'quiz-cat' ),			
			'remove_string' =>  __('remove', 'quiz-cat'),
			'show_string' =>  __('show', 'quiz-cat'),
			'unused_string' =>  __('Unused', 'quiz-cat') . ':',
			'points_string' =>  __('Points', 'quiz-cat'),
			'question_string' =>  __('Question', 'quiz-cat'),
			'save_string' =>  __('Save', 'quiz-cat'),
			'preview_string' =>  __('Save & Preview', 'quiz-cat'),
			'on_string' =>  __('YES', 'quiz-cat'),
			'off_string' =>  __('NO', 'quiz-cat'),
			'debug' => FCA_QC_DEBUG,
			'stylesheet' => FCA_QC_PLUGINS_URL . '/includes/wysi/wysi.min.css'
		);
		 
		wp_localize_script( 'fca_qc_admin_js', 'fcaQcAdminData', $admin_data );
		wp_localize_script( 'fca_qc_wysi_js', 'fcaQcAdminData', $admin_data );
	}

}
add_action( 'admin_enqueue_scripts', 'fca_qc_admin_enqueue', 10, 1 );  

function fca_qc_admin_nav() {
	global $post;
	if ( $post->post_type === 'fca_qc_quiz'	 ) {
		$html = '<div id="qc-nav">';
			
			$html .= '<h1 class="nav-tab-wrapper">';
				$html .= '<a href="#" id="editor-nav" class="nav-tab nav-tab-active">' . __('Editor', 'quiz-cat') . '</a>';
				$html .= '<a href="#" id="settings-nav" class="nav-tab">' . __('Settings', 'quiz-cat') . '</a>';
			$html .= '</h1>';
			
		$html .= '</div>';
		echo $html;
	}
}
add_action( 'edit_form_after_title', 'fca_qc_admin_nav' );


//ADD META BOXES TO EDIT CPT PAGE
function fca_qc_add_custom_meta_boxes( $post ) {

	add_meta_box( 
		'fca_qc_description_meta_box',
		__( 'This Quiz', 'quiz-cat' ),
		'fca_qc_render_description_meta_box',
		null,
		'normal',
		'high'
	);	
	
	add_meta_box( 
		'fca_qc_questions_meta_box',
		__( 'Questions', 'quiz-cat' ),
		'fca_qc_render_questions_meta_box',
		null,
		'normal',
		'default'
	);
	
	add_meta_box( 
		'fca_qc_add_result_meta_box',
		__( 'Results', 'quiz-cat' ),
		'fca_qc_render_add_result_meta_box',
		null,
		'normal',
		'default'
	);
	
	add_meta_box( 
		'fca_qc_quiz_settings_meta_box',
		__( 'General', 'quiz-cat' ),
		'fca_qc_render_quiz_settings_meta_box',
		null,
		'normal',
		'default'
	);	
}
add_action( 'add_meta_boxes_fca_qc_quiz', 'fca_qc_add_custom_meta_boxes' );

//RENDER THE DESCRIPTION META BOX
function fca_qc_render_description_meta_box( $post ) {
	
	$quiz_meta = get_post_meta ( $post->ID, 'quiz_cat_meta', true );
	$quiz_meta = empty( $quiz_meta ) ? array() : $quiz_meta;
	$quiz_meta['desc'] = empty ( $quiz_meta['desc'] ) ? '' : $quiz_meta['desc'];
	$quiz_meta['desc_img_src'] = empty ( $quiz_meta['desc_img_src'] ) ? '' : $quiz_meta['desc_img_src'];

	//ADD A HIDDEN PREVIEW URL INPUT
	$html = "<input type='hidden' name='fca_qc_quiz_preview_url' id='fca_qc_quiz_preview_url' value='" . get_permalink( $post ) . "'>";
	
	$html .= "<table class='fca_qc_inner_setting_table'>";
		$html .= "<tr>";
			$html .= "<th>" . __('Description', 'quiz-cat') . "</th>";
			$html .= "<td>" . fca_qc_add_wysiwyg( $quiz_meta['desc'], 'fca_qc_quiz_description' ) . "</td>";
		$html .= "</tr>";
		$html .= "<tr>";
			$html .= "<th>" . __('Image', 'quiz-cat') . "</th>";
			$html .= "<td>" . fca_qc_add_image_input( $quiz_meta['desc_img_src'], 'fca_qc_quiz_description_image_src', 'fca_qc_quiz_description_image_src' ) . "</td>";
		$html .= "</tr>";
	$html .= "</table>";
	
	echo $html;
}

//RENDER THE ADD QUESTION META BOX
function fca_qc_render_questions_meta_box( $post ) {
		
	$questions = get_post_meta ( $post->ID, 'quiz_cat_questions', true );
	
	echo "<p class='fca_qc_quiz_instructions'>" . __('Add your questions to ask and the possible responses. Drag to re-order.', 'quiz-cat') . "</p>";
	
	echo "<div class='fca_qc_sortable_questions'>";
	if ( empty ( $questions ) ) {
		
		echo fca_qc_render_question( array(), 1 );
		
	} else {
		
		$counter = 1;
		
		forEach ( $questions as $question ) {
			
			echo fca_qc_render_question( $question, $counter );
			$counter = $counter + 1;
			
		}		
	}	
	echo "</div>";
	
	//A HIDDEN INPUT FOR QUESTION JSON
	echo "<input type='hidden' name='fca_qc_questions_json' id='fca_qc_questions_json' >";
	
	echo "<button type='button' title='" . __( 'Add a new Question', 'quiz-cat') . "' id='fca_qc_add_question_btn' class='button-secondary fca_qc_add_btn' ><span class='dashicons dashicons-plus' style='vertical-align: text-top;'></span>" .__('Add', 'quiz-cat') . "</button>";
	
}

// RENDER A QUESTION META BOX
// INPUT: ARRAY->$question
// OUTPUT: HTML 
function fca_qc_render_question( $question, $question_number ) {
	
	if ( empty ( $question ) ) {
		$question = array(
			'question' => '',
			'img' => '',
			'hint' => '',
			'answers' => '',
			'id' => '{{ID}}',
		);
	}
	$question['id'] = empty( $question['id'] ) ? '{{ID}}' : $question['id'];
			
	$html = "<div class='fca_qc_question_item fca_qc_deletable_item' id='fca_qc_question_$question_number'>";
		$html .= "<input class='fca_qc_id' value='" . $question['id'] . "' type='hidden' >";
		$html .= fca_qc_add_delete_button();
		$html .= "<h3 class='fca_qc_question_label'><span class='fca_qc_quiz_heading_question_number'>" . __('Question', 'quiz-cat') . ' ' . $question_number . ": </span><span class='fca_qc_quiz_heading_text'>". $question['question'] . "</span></h3>";
			
			$html .= "<div class='fca_qc_question_input_div'>";
				$html .= "<div class='fca_qc_question_header_div'>";
					$html .= "<table class='fca_qc_inner_setting_table'>";
						$html .= "<tr>";
							$html .= "<th>" . __('Image', 'quiz-cat') . "</th>";
							$html .= '<td>' . fca_qc_add_image_input( $question['img'], '' ) . '</td>';
						$html .= "</tr>";
						$html .= "<tr>";
							$html .= "<th>" . __('Description', 'quiz-cat') . "</th>";
							$html .= "<td><textarea placeholder='" . __('e.g. Can cats fly?', 'quiz-cat') . "' class='fca_qc_question_texta fca_qc_question_text'>" . $question['question']  ."</textarea></td>";
						$html .= "</tr>";
					$html .= "</table>";
				$html .= "</div>";
				
				$answers = empty ($question['answers']) ? array(array(),array()) : $question['answers'];
				$answer_number = 1;
				forEach ( $answers as $answer ) {
					$html .= fca_qc_render_answer( $answer, $question_number, $answer_number );
					$answer_number++;
				}
				$html .= "<a class='fca_qc_add_answer_btn'>" . __('Add Answer', 'quiz-cat') ."</a>";
				
			$html .= "</div >";
	$html .= "</div >";

	return $html;

}

function fca_qc_render_answer( $answer, $question_number, $answer_number ) {
	
	$html = '';

	$answer['answer'] = empty ( $answer['answer'] ) ? '' : $answer['answer'];
	$answer['img'] = empty ( $answer['img'] ) ? '' : $answer['img'];
	$answer['id'] = empty ( $answer['id'] ) ? '{{ID}}' : $answer['id'];
	$answer['hint'] = empty( $answer['hint'] ) ? '' : $answer['hint'];
	
	$placeholder = $answer_number == 1 ? __('e.g. No', 'quiz-cat') :  __('e.g. Yes', 'quiz-cat');
	$html .= "<div class='fca_qc_answer_input_div fca_qc_deletable_item'>";
	
		$html .= "<input class='fca_qc_id' value='" . $answer['id'] . "' type='hidden' >";
		
		if ( $answer_number == 1 ) {
			$html .= "<h4>" . __('Correct Answer', 'quiz-cat') . "</h4>";
		} else {
			$html .= "<h4>" . __('Wrong Answer', 'quiz-cat') . fca_qc_add_delete_button() . '</h4>';
		}
		$html .= "<table class='fca_qc_inner_setting_table'>";
			
			if ( function_exists( 'fca_qc_save_quiz_settings_premium' ) ) {
				$html .= "<tr>";
					$html .= "<th>" . __('Image', 'quiz-cat') . "</th>";
					$html .= "<td>" . fca_qc_add_image_input( $answer['img'], '' ) . "</td>";
				$html .= "</tr>";
			}
			$html .= "<tr>";
				$html .= "<th>" . __('Text', 'quiz-cat') . "</th>";
				$html .= "<td><textarea placeholder='$placeholder' class='fca_qc_question_texta'>" . $answer['answer']  ."</textarea></td>";
			$html .= "</tr>";
			
			if ( function_exists ('fca_qc_save_quiz_settings_premium' ) && $answer_number === 1 ) {
				$html .= "<tr class='fca_qc_hint_tr'>";
					$html .= "<th>" . __('Explanation', 'quiz-cat') . "</th>";
					$html .= "<td><textarea placeholder='" . __('Explanation', 'quiz-cat') . "' class='fca_qc_question_texta' >" . $answer['hint']  ."</textarea></td>";
				$html .= "</tr>";
			}
		$html .= "</table>";
	$html .= "</div>";	
	
	return $html;	
}

//RENDER THE ADD RESULT META BOX
function fca_qc_render_add_result_meta_box( $post ) {
			
	$results = get_post_meta ( $post->ID, 'quiz_cat_results', true );
	
	echo "<p class='fca_qc_quiz_instructions'>" . __('Add your results based on the number of correct answers. Drag to re-order. This is optional.', 'quiz-cat') . "</p>";
	
	echo "<div class='fca_qc_sortable_results'>";
	if ( empty ( $results ) ) {
		
		echo fca_qc_render_result( array(), 1 );
		
	} else {
		
		$counter = 1;
		
		forEach ( $results as $result ) {
			
			echo fca_qc_render_result ($result, $counter );
			
			$counter = $counter + 1;
			
		}		
	}
	echo "</div>";	
	echo "<button type='button' title='" . __( 'Add a new Result', 'quiz-cat') . "' id='fca_qc_add_result_btn' class='button-secondary fca_qc_add_btn' ><span class='dashicons dashicons-plus' style='vertical-align: text-top;'></span>" . __('Add', 'quiz-cat') . "</button>";

}
function fca_qc_add_delete_button ( $target_class = 'fca_qc_deletable_item' ) {
	
	$html = "<span class='dashicons dashicons-trash fca_qc_delete_icon fca_qc_delete_button'></span>";
	$html .= "<span style='display:none;' class='dashicons dashicons-no fca_qc_delete_icon fca_qc_delete_icon_cancel'></span>";
	$html .= "<span data-target='$target_class' style='display:none;' class='dashicons dashicons-yes fca_qc_delete_icon fca_qc_delete_icon_confirm'></span>";

	return $html;
}

// RENDER A RESULT META BOX
// INPUT: ARRAY->$result (TITLE, DESC, IMG), INT|STRING->$result_number
// OUTPUT: HTML			
function fca_qc_render_result( $result, $result_number ) {
	
	if ( empty ( $result ) ) {
		$result = array(
			'title' => '',
			'desc' => '',
			'img' => '',
			'url' => '',
			'tags' => array(),
		);
	}
	
	$result['url'] = empty ( $result['url'] ) ? '' : $result['url'];
	$result['tags'] = empty ( $result['tags'] ) ? '' : $result['tags'];
	
	$html = "<div class='fca_qc_result_item fca_qc_deletable_item' id='fca_qc_result_$result_number'>";
		$html .= fca_qc_add_delete_button(); //nearest class?
		$html .= "<h3 class='fca_qc_result_label'><span class='fca_qc_result_score_value'></span><span class='fca_qc_result_score_title'>" . $result['title'] . "</span></h3>";
		
		$html .= "<div class='fca_qc_result_input_div'>";
			$html .= "<table class='fca_qc_inner_setting_table'>";
				$html .= "<tr>";
					$html .= "<th>" . __('Result Title', 'quiz-cat') . "</th>";
					$html .= "<td><input type='text' placeholder='" . __('Title', 'quiz-cat') . "' class='fca_qc_text_input fca_qc_quiz_result' name='fca_qc_quiz_result_title[]' value='" . htmlspecialchars ( $result['title'], ENT_QUOTES  ) . "'></input></td>";
				$html .= "</tr>";
				$html .= "<tr class='fca_qc_result_row_default'>";
					$html .= "<th>" . __('Image', 'quiz-cat') . "</th>";
					$html .= "<td>" . fca_qc_add_image_input( $result['img'], 'fca_qc_quiz_result_image_src[]' ) . "</td>";
				$html .= "</tr>";
				$html .= "<tr class='fca_qc_result_row_default'>";
					$html .= "<th>" . __('Description', 'quiz-cat') . "</th>";
					$html .= "<td>" . fca_qc_add_wysiwyg( $result['desc'], 'fca_qc_quiz_result_description[]' ) . "</td>";
				$html .= "</tr>";
				if ( function_exists ('fca_qc_save_quiz_settings_premium' ) ) {
					$html .= "<tr class='fca_qc_result_row_url'>";
						$html .= "<th>" . __('Redirect URL', 'quiz-cat') . "</th>";
						$html .= "<td><input type='url' placeholder='" . __('http://mycoolsite.com/grumpy-cat', 'quiz-cat') . "' class='fca_qc_url_input' name='fca_qc_quiz_result_url[]' value='" . $result['url'] . "'></input></td>";
					$html .= "</tr>";
				
					if ( function_exists( 'fca_qc_add_tag_div' ) ) {
						$html .= fca_qc_add_tag_div( 'results', $result['tags'] );
						
						$html .= "<tr class='fca_qc_mailchimp_api_settings'>";	
						
							$html .= "<th>";
								$html .= "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_quiz_result_mailchimp_groups'>" . __('Interest Groups', 'quiz-cat') . fca_qc_tooltip( __("If you use MailChimp Groups opt-in feature, select one or more interest groups quiz takers should be added to.  Optional.", 'quiz-cat') ) ."</label>";
							$html .= "</th>";
								
							$html .= "<td style='line-height: normal;'>";
								$html .= "<span style='display: none;' class='fca_qc_icon dashicons dashicons-image-rotate fca_qc_spin'></span>";
								$html .= '<select style="width: 300px; border: 1px solid #ddd; border-radius: 0;" data-placeholder="&#8681; ' . __('Select Interest Groups (Optional)', 'quiz-cat') . ' &#8681;" class="fca_qc_multiselect fca_qc_mailchimp_groups"" id="fca_qc_quiz_result_mailchimp_groups" multiple="multiple" name="fca_qc_quiz_result_mailchimp_groups[][]">';
									if ( !empty ( $result['groups'] ) ) {
										
										forEach ( $result['groups'] as $group ) {
											$html .= "<option value='$group' selected='selected' >" . __('Loading...', 'quiz-cat') . "</option>";
										}
										unset ( $group );
									}
								$html .= '</select>';
							$html .= "</td>";
						$html .= "</tr>";
						
					}
				}
				
			$html .= "</table>";
		$html .= '</div>';
		
		//SOME HIDDEN INPUTS FOR THE RANGE OF SCORES FOR THIS RESULT
		$html .= "<input type='number' class='fca_qc_result_min' name='fca_qc_result_min[]' value='-1' hidden >";
		$html .= "<input type='number' class='fca_qc_result_max' name='fca_qc_result_max[]' value='-1' hidden >";
		
	$html .= "</div>";
	
	return $html;
	
}

//RENDER THE QUIZ SETTINGS META BOX 
function fca_qc_render_quiz_settings_meta_box( $post ) {
	
	$settings = get_post_meta ( $post->ID, 'quiz_cat_settings', true );
	$settings = empty( $settings ) ? array() : $settings;
	$quiz_type = empty( $settings['quiz_type'] ) ? '' : $settings['quiz_type'];
	$settings['hide_answers'] = empty( $settings['hide_answers'] ) ? '' : $settings['hide_answers'];
	$hide_answers = empty ( $settings['hide_answers'] ) ? '' : "checked='checked'";
	$shuffle_questions = empty ( $settings['shuffle_questions'] ) ? '' : "checked='checked'";
	$restart_button = empty ( $settings['restart_button'] ) ? '' : "checked='checked'";
	$show_explanations = empty ( $settings['explanations'] ) ? '' : "checked='checked'";
	$disable_scroll = empty ( $settings['disable_scroll'] ) ? '' : "checked='checked'";
	$result_mode = empty ( $settings['result_mode'] ) ? 'basic' : $settings['result_mode'];

	$shortcode = '[quiz-cat id="' . $post->ID . '"]';
	echo "<table class='fca_qc_setting_table'>";

		echo "<tr>";
			echo "<th>";
				echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' id='fca_qc_shortcode_label' for='fca_qc_shortcode_input'>" . __('Shortcode', 'quiz-cat') . fca_qc_tooltip(__('Paste the shortcode in to a post or page to embed this quiz.', 'quiz-cat')) . "</label>";
			echo "</th>";
			echo "<td>";
				echo "<input type='text' class='fca_qc_input_wide fca_qc_shortcode_input' name='fca_qc_shortcode_input' value='$shortcode' readonly>";		
			echo "</td>";
		echo "<tr>";
		echo "<tr>";
			echo "<th>";
				echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_disable_scroll'>" . __('Disable Auto Scrolling', 'quiz-cat') . "</label>";
			echo "</th>";
			echo "<td>";
				echo "<div class='onoffswitch'>";
					echo "<input type='checkbox' class='onoffswitch-checkbox' id='fca_qc_disable_scroll' style='display:none;' name='fca_qc_disable_scroll' $disable_scroll></input>";		
				echo "<label class='onoffswitch-label' for='fca_qc_disable_scroll'><span class='onoffswitch-inner'><span class='onoffswitch-switch'></span></span></label>";
				echo "</div>";
			echo "</td>";
		echo "</tr>";
		
		echo "<tr id='fca_qc_answer_mode_tr'>";
				if ( function_exists( 'fca_qc_answer_mode_toggle' ) ) {
					fca_qc_answer_mode_toggle( $settings['hide_answers'] );
				} else {
					echo "<th>";
						echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_hide_answers_until_end'>" . __('Hide Answers Until End of Quiz', 'quiz-cat') . "</label>";
					echo "</th>";
					echo "<td>";
					echo "<div class='onoffswitch'>";
						echo "<input type='checkbox' class='onoffswitch-checkbox' id='fca_qc_hide_answers_until_end' style='display:none;' name='fca_qc_hide_answers_until_end' $hide_answers></input>";		
						echo "<label class='onoffswitch-label' for='fca_qc_hide_answers_until_end'><span class='onoffswitch-inner'><span class='onoffswitch-switch'></span></span></label>";
					echo "</div>";
				}
			echo "</td>";
		echo "</tr>";
		
		if ( function_exists ('fca_qc_save_quiz_settings_premium' ) ) {
			echo "<tr id='fca_qc_hints_toggle_tr'>";
				echo "<th>";
					echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_explanations'>" . __('Enable Explanations', 'quiz-cat') . fca_qc_tooltip(__('Show an explanation or reasoning why an answer is correct.', 'quiz-cat')) .  "</label>";
				echo "</th>";
				echo "<td>";
					echo "<div class='onoffswitch'>";
						echo "<input type='checkbox' class='onoffswitch-checkbox' id='fca_qc_explanations' style='display:none;' name='fca_qc_explanations' $show_explanations></input>";		
						echo "<label class='onoffswitch-label' for='fca_qc_explanations'><span class='onoffswitch-inner'><span class='onoffswitch-switch'></span></span></label>";
					echo "</div>";
				echo "</td>";
			echo "</tr>";
		
			echo "<tr>";
				echo "<th>";
					echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_result_mode'>" . __('Results', 'quiz-cat') . fca_qc_tooltip(__('Choose to show a result panel at the end of the quiz, or redirect to a new page when a user completes the quiz.', 'quiz-cat')) .  "</label>";
				echo "</th>";
				echo "<td>";
					echo "<div class='radio-toggle'>";
						if ( $result_mode === 'basic' ) {
							echo "<label class='selected'>";
							_e('Show Result', 'quiz-cat');
							echo '<input class="qc_radio_input fca_qc_result_mode_input" name="fca_qc_result_mode" type="radio" value="basic" checked /></label>';
							echo "<label>";
							_e('Redirect to URL', 'quiz-cat');
							echo '<input class="qc_radio_input fca_qc_result_mode_input" name="fca_qc_result_mode" type="radio" value="redirect" /></label>';
						} else {
							echo "<label>";
							_e('Show Result', 'quiz-cat');
							echo '<input class="qc_radio_input fca_qc_result_mode_input" name="fca_qc_result_mode" type="radio" value="basic" /></label>';
							echo "<label class='selected'>";
							_e('Redirect to URL', 'quiz-cat');
							echo '<input class="qc_radio_input fca_qc_result_mode_input" name="fca_qc_result_mode" type="radio" value="redirect" checked /></label>';								
						}
					echo "</div>";
				echo "</td>";
			echo "</tr>";				
		
	
			echo "<tr>";
				echo "<th>";
					echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_shuffle_question_order'>" . __('Shuffle Question Order', 'quiz-cat') . fca_qc_tooltip(__( 'Shuffle or randomize the order of questions each time someone takes your quiz.','quiz-cat')) . "</label>";
				echo "</th>";
				echo "<td>";
					echo "<div class='onoffswitch'>";
						echo "<input type='checkbox' class='onoffswitch-checkbox' id='fca_qc_shuffle_question_order' style='display:none;' name='fca_qc_shuffle_question_order' $shuffle_questions></input>";		
					echo "<label class='onoffswitch-label' for='fca_qc_shuffle_question_order'><span class='onoffswitch-inner'><span class='onoffswitch-switch'></span></span></label>";
					echo "</div>";
				echo "</td>";
			echo "</tr>";
			echo "<tr>";
				echo "<th>";
					echo "<label class='fca_qc_admin_label fca_qc_admin_settings_label' for='fca_qc_show_restart_button'>" . __('Show "Restart Quiz" Button', 'quiz-cat') . "</label>";
				echo "</th>";
				echo "<td>";
					echo "<div class='onoffswitch'>";
						echo "<input type='checkbox' class='onoffswitch-checkbox' id='fca_qc_show_restart_button' style='display:none;' name='fca_qc_show_restart_button' $restart_button></input>";		
					echo "<label class='onoffswitch-label' for='fca_qc_show_restart_button'><span class='onoffswitch-inner'><span class='onoffswitch-switch'></span></span></label>";
					echo "</div>";
				echo "</td>";
			echo "</tr>";
		}
		
		
	echo "</table>";
}

//CUSTOM SAVE HOOK
function fca_qc_save_post( $post_id ) {
			
	if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {
		return $post_id;
	}
		
	//ONLY DO OUR STUFF IF ITS A REAL SAVE, NOT A NEW IMPORTED ONE
	if ( array_key_exists ( 'fca_qc_quiz_preview_url', $_POST ) ) {
		
		$quiz_type = empty( $_POST['fca_qc_quiz_type'] ) ? false : fca_qc_sanitize_text( $_POST['fca_qc_quiz_type'] );
				
		//SAVING META DATA ( DESCRIPTION, IMAGE )
		update_post_meta ( $post_id, 'quiz_cat_meta', array(
			'desc' => empty ( $_POST['fca_qc_quiz_description'] ) ? '' : fca_qc_kses_html( $_POST['fca_qc_quiz_description'] ),
			'desc_img_src' => empty ( $_POST['fca_qc_quiz_description_image_src'] ) ? '' : esc_url( $_POST['fca_qc_quiz_description_image_src'] ),
		) );
		
		
		//SAVING QUESTIONS
		update_post_meta ( $post_id, 'quiz_cat_questions', fca_qc_kses_html( json_decode( stripslashes_deep( $_POST['fca_qc_questions_json'] ), true ) ) );
		
		if ( function_exists ('fca_qc_save_appearance_settings') ) {
			fca_qc_save_appearance_settings( $post_id );
		}
			
		if ( $quiz_type == 'pt' && function_exists ('fca_qc_save_personality_results') ) {
			fca_qc_save_personality_results( $post_id );
		} else {

			$results = array();
			
			//SAVING RESULTS
			$n = empty ( $_POST['fca_qc_quiz_result_title'] ) ? 0 : count ( $_POST['fca_qc_quiz_result_title'] );
			
			for ($i = 0; $i < $n ; $i++) {
				$results[$i]['title'] = fca_qc_kses_html( $_POST['fca_qc_quiz_result_title'][$i] );
				$results[$i]['desc'] = fca_qc_kses_html( $_POST['fca_qc_quiz_result_description'][$i] );
				$results[$i]['img'] = fca_qc_sanitize_text( $_POST['fca_qc_quiz_result_image_src'][$i] );
				$results[$i]['min'] = intval ( fca_qc_sanitize_text( $_POST['fca_qc_result_min'][$i] ) );
				$results[$i]['max'] = intval ( fca_qc_sanitize_text( $_POST['fca_qc_result_max'][$i] ) );
				$results[$i]['url'] = esc_url( $_POST['fca_qc_quiz_result_url'][$i] );
				$results[$i]['tags'] = empty ( $_POST['fca_qc_results_tags'][$i] ) ? '' : fca_qc_sanitize_text(  $_POST['fca_qc_results_tags'][$i] );
				$results[$i]['groups'] = empty ( $_POST['fca_qc_quiz_result_mailchimp_groups'][$i] ) ? array() : fca_qc_sanitize_text(  $_POST['fca_qc_quiz_result_mailchimp_groups'][$i] );
			}
						
			update_post_meta ( $post_id, 'quiz_cat_results', $results );
		
		}
		

		if ( function_exists ('fca_qc_save_quiz_settings_premium') ) {
			fca_qc_save_quiz_settings_premium( $post_id );
		} else {
			fca_qc_save_quiz_settings( $post_id );
		}

		if ( function_exists ('fca_qc_save_optin_settings') ) {
			fca_qc_save_optin_settings( $post_id );
		}
					
		wp_publish_post( $post_id );
	
	}	
}
add_action( 'save_post_fca_qc_quiz', 'fca_qc_save_post' );

//SAVING SETTINGS
function fca_qc_save_quiz_settings( $post_id ) {
	
	$settings = array();
	
	$fields = array (
		'fca_qc_hide_answers_until_end'	=> 'hide_answers',
		'fca_qc_result_mode'			=> 'result_mode',
		'fca_qc_quiz_type'				=> 'quiz_type',
		'fca_qc_disable_scroll'			=> 'disable_scroll',
	);
	
	forEach ( $fields as $key => $value ) {
		$settings[$value] = empty ( $_POST[$key] ) ? '' : fca_qc_sanitize_text( $_POST[$key] );
	}
		
	update_post_meta ( $post_id, 'quiz_cat_settings', $settings );
}


//PREVIEW
function fca_qc_save_preview_redirect ( $location ) {
	global $post;
	if ( !empty($_POST['fca_qc_quiz_preview_url'] ) ) {
		// Flush rewrite rules
		global $wp_rewrite;
		$wp_rewrite->flush_rules(true);

		return $_POST['fca_qc_quiz_preview_url'];
	}
 
	return $location;
}
add_filter('redirect_post_location', 'fca_qc_save_preview_redirect');

function fca_qc_live_preview( $content ){
	global $post;
	if ( is_user_logged_in() && $post->post_type === 'fca_qc_quiz' && is_main_query() && !doing_action( 'wp_head' ) )  {
		return $content . do_shortcode("[quiz-cat id='" . $post->ID . "']");
	} else {
		return $content;
	}
}
add_filter( 'the_content', 'fca_qc_live_preview');
