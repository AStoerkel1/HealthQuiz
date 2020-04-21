<?php
/*
	Plugin Name: Quiz Cat Free
	Plugin URI: https://fatcatapps.com/quiz-cat
	Description: Provides an easy way to create and administer quizes
	Text Domain: quiz-cat
	Domain Path: /languages
	Author: Fatcat Apps
	Author URI: https://fatcatapps.com/
	License: GPLv2
	Version: 1.7.2
*/


// BASIC SECURITY
defined( 'ABSPATH' ) or die( 'Unauthorized Access!' );



if ( !defined ('FCA_QC_PLUGIN_DIR') ) {
	
	// DEFINE SOME USEFUL CONSTANTS
	define( 'FCA_QC_DEBUG', FALSE );
	define( 'FCA_QC_PLUGIN_VER', '1.7.2' );
	define( 'FCA_QC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
	define( 'FCA_QC_PLUGINS_URL', plugins_url( '', __FILE__ ) );
	define( 'FCA_QC_PLUGINS_BASENAME', plugin_basename(__FILE__) );
	define( 'FCA_QC_PLUGIN_FILE', __FILE__ );
	define( 'FCA_QC_PLUGIN_PACKAGE', 'Free' ); //DONT CHANGE THIS, IT WONT ADD FEATURES, ONLY BREAKS UPDATER AND LICENSE
		
	include_once( FCA_QC_PLUGIN_DIR . '/includes/functions.php' );
	include_once( FCA_QC_PLUGIN_DIR . '/includes/quiz/quiz.php' );
	include_once( FCA_QC_PLUGIN_DIR . '/includes/editor/editor.php' );	
	include_once( FCA_QC_PLUGIN_DIR . '/includes/block.php' );
	
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/editor/sidebar.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/editor/sidebar.php' );
	}	
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/premium/premium.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/premium/premium.php' );
	}
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/premium/optins.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/premium/optins.php' );
	}
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/premium/licensing.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/premium/licensing.php' );
	}	
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/premium/db.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/premium/db.php' );
	}
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/stats/stats.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/stats/stats.php' );
	}
	if ( file_exists ( FCA_QC_PLUGIN_DIR . '/includes/upgrade.php' ) ) {
		include_once( FCA_QC_PLUGIN_DIR . '/includes/upgrade.php' );
	}	
	
	//FILTERABLE FRONT-END STRINGS
	$global_quiz_text_strings = array (
		'no_quiz_found' => __('No Quiz found', 'quiz-cat'),
		'correct' => __('Correct!', 'quiz-cat'),
		'wrong' => __('Wrong!', 'quiz-cat'),
		'your_answer' => __('Your answer:', 'quiz-cat'),
		'correct_answer' => __('Correct answer:', 'quiz-cat'),
		'question' => __('Question', 'quiz-cat'),
		'next' =>  __('Next', 'quiz-cat'),
		'you_got' =>  __('You got', 'quiz-cat'),
		'out_of' => __('out of', 'quiz-cat'),
		'your_answers' =>  __('Your Answers', 'quiz-cat'),
		'start_quiz' => __('Start Quiz', 'quiz-cat'),
		'retake_quiz' => __('Retake Quiz', 'quiz-cat'),
		'share_results' => __('SHARE YOUR RESULTS', 'quiz-cat'),
		'i_got' => __('I got', 'quiz-cat'),
		'skip_this_step' => __('Skip this step', 'quiz-cat'),
		'your_name' => __('Your Name', 'quiz-cat'),
		'your_email' => __('Your Email', 'quiz-cat'),
		'share'  => __('Share', 'quiz-cat'),
		'tweet'  =>  __('Tweet', 'quiz-cat'),
		'pin'  =>  __('Pin', 'quiz-cat'),
		'email'  =>  __('Email', 'quiz-cat') 
	);
	
	//ACTIVATION HOOK
	function fca_qc_activation() {
	
		$meta_version = get_option ( 'fca_qc_meta_version' );
		
		if ( function_exists('fca_qc_convert_csv') && version_compare( $meta_version, '1.5.0', '<' ) ) {
			//convert CSV from old format to new
			fca_qc_convert_csv();
					
		}
	}
	register_activation_hook( FCA_QC_PLUGIN_FILE, 'fca_qc_activation' );

	////////////////////////////
	// SET UP POST TYPE
	////////////////////////////

	//REGISTER CPT
	function fca_qc_register_post_type() {
		
		$labels = array(
			'name' => _x('Quizzes','quiz-cat'),
			'singular_name' => _x('Quiz','quiz-cat'),
			'add_new' => _x('Add New','quiz-cat'),
			'all_items' => _x('All Quizzes','quiz-cat'),
			'add_new_item' => _x('Add New Quiz','quiz-cat'),
			'edit_item' => _x('Edit Quiz','quiz-cat'),
			'new_item' => _x('New Quiz','quiz-cat'),
			'view_item' => _x('View Quiz','quiz-cat'),
			'search_items' => _x('Search Quizzes','quiz-cat'),
			'not_found' => _x('Quiz not found','quiz-cat'),
			'not_found_in_trash' => _x('No Quizzes found in trash','quiz-cat'),
			'parent_item_colon' => _x('Parent Quiz:','quiz-cat'),
			'menu_name' => _x('Quiz Cat','quiz-cat')
		);
			
		$args = array(
			'labels' => $labels,
			'description' => "",
			'public' => false,
			'exclude_from_search' => true,
			'publicly_queryable' => true,
			'show_ui' => true,
			'show_in_nav_menus' => false,
			'show_in_menu' => true,
			'show_in_admin_bar' => true,
			'menu_position' => 117,
			'menu_icon' => FCA_QC_PLUGINS_URL . '/assets/icon.png',
			'capability_type' => 'post',
			'hierarchical' => false,
			'supports' => array('title'),
			'has_archive' => false,
			'rewrite' => false,
			'query_var' => true,
			'can_export' => true
		);
		
		register_post_type( 'fca_qc_quiz', $args );
	}
	add_action ( 'init', 'fca_qc_register_post_type' );
	
	//CHANGE CUSTOM 'UPDATED' MESSAGES FOR OUR CPT
	function fca_qc_post_updated_messages( $messages ){
		
		$post = get_post();
		
		$messages['fca_qc_quiz'] = array(
			0  => '', // Unused. Messages start at index 1.
			1  => __( 'Quiz updated.','quiz-cat'),
			2  => __( 'Quiz updated.','quiz-cat'),
			3  => __( 'Quiz deleted.','quiz-cat'),
			4  => __( 'Quiz updated.','quiz-cat'),
			/* translators: %s: date and time of the revision */
			5  => isset( $_GET['revision'] ) ? sprintf( __( 'Quiz restored to revision from %s','quiz-cat'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
			6  => __( 'Quiz published.' ,'quiz-cat'),
			7  => __( 'Quiz saved.' ,'quiz-cat'),
			8  => __( 'Quiz submitted.' ,'quiz-cat'),
			9  => sprintf(
				__( 'Quiz scheduled for: <strong>%1$s</strong>.','quiz-cat'),
				// translators: Publish box date format, see http://php.net/date
				date_i18n( __( 'M j, Y @ G:i' ), strtotime( $post->post_date ) )
			),
			10 => __( 'Quiz draft updated.' ,'quiz-cat'),
		);

		return $messages;
	}
	add_filter('post_updated_messages', 'fca_qc_post_updated_messages' );

	//Customize CPT table columns
	function fca_qc_add_new_post_table_columns($columns) {
		$new_columns = array();
		$new_columns['cb'] = '<input type="checkbox" />';
		$new_columns['title'] = _x('Quiz Name', 'column name', 'quiz-cat');
		$new_columns['shortcode'] = __('Shortcode', 'quiz-cat');
		$new_columns['date'] = _x('Date', 'column name', 'quiz-cat');
	 
		return $new_columns;
	}
	add_filter('manage_edit-fca_qc_quiz_columns', 'fca_qc_add_new_post_table_columns', 10, 1 );

	function fca_qc_manage_post_table_columns($column_name, $id) {
		switch ($column_name) {
			case 'shortcode':
				echo '<input type="text" readonly="readonly" onclick="this.select()" value="[quiz-cat id=&quot;'. $id . '&quot;]"/>';
					break;
		 
			default:
			break;
		} // end switch
	}
	add_action('manage_fca_qc_quiz_posts_custom_column', 'fca_qc_manage_post_table_columns', 10, 2);

	/* Localization */
	function fca_qc_load_localization() {
		load_plugin_textdomain( 'quiz-cat', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
	}
	add_action( 'init', 'fca_qc_load_localization' );
	
	function fca_qc_add_plugin_action_links( $links ) {
		
		$support_url = FCA_QC_PLUGIN_PACKAGE === 'Free' ? 'https://wordpress.org/support/plugin/quiz-cat' : 'https://fatcatapps.com/support';
		
		$new_links = array(
			'support' => "<a target='_blank' href='$support_url' >" . __('Support', 'quiz-cat' ) . '</a>'
		);
		
		$links = array_merge( $new_links, $links );
	
		return $links;
		
	}
	add_filter( 'plugin_action_links_' . FCA_QC_PLUGINS_BASENAME, 'fca_qc_add_plugin_action_links' );
	
	function fca_qc_remove_screen_options_tab ( $show_screen, $screen ) {
		if ( $screen->id == 'fca_qc_quiz' ) {
			return false;
		}
		return $show_screen;
	}	
	add_filter('screen_options_show_screen', 'fca_qc_remove_screen_options_tab', 10, 2);
	
	//DEACTIVATION SURVEY
	function fca_qc_admin_deactivation_survey( $hook ) {
		if ( $hook === 'plugins.php' ) {
			
			ob_start(); ?>
			
			<div id="fca-deactivate" style="position: fixed; left: 232px; top: 191px; border: 1px solid #979797; background-color: white; z-index: 9999; padding: 12px; max-width: 669px;">
				<h3 style="font-size: 14px; border-bottom: 1px solid #979797; padding-bottom: 8px; margin-top: 0;"><?php _e( 'Sorry to see you go', 'quiz-cat' ) ?></h3>
				<p><?php _e( 'Hi, this is David, the creator of Quiz Cat. Thanks so much for giving my plugin a try. I’m sorry that you didn’t love it.', 'quiz-cat' ) ?>
				</p>
				<p><?php _e( 'I have a quick question that I hope you’ll answer to help us make Quiz Cat better: what made you deactivate?', 'quiz-cat' ) ?>
				</p>
				<p><?php _e( 'You can leave me a message below. I’d really appreciate it.', 'quiz-cat' ) ?>
				</p>
				
				<p><textarea style='width: 100%;' id='fca-qc-deactivate-textarea' placeholder='<?php _e( 'What made you deactivate?', 'quiz-cat' ) ?>'></textarea></p>
				
				<div style='float: right;' id='fca-deactivate-nav'>
					<button style='margin-right: 5px;' type='button' class='button button-secondary' id='fca-qc-deactivate-skip'><?php _e( 'Skip', 'quiz-cat' ) ?></button>
					<button type='button' class='button button-primary' id='fca-qc-deactivate-send'><?php _e( 'Send Feedback', 'quiz-cat' ) ?></button>
				</div>
			
			</div>
			
			<?php
				
			$html = ob_get_clean();
			
			$data = array(
				'html' => $html,
				'nonce' => wp_create_nonce( 'fca_qc_uninstall_nonce' ),
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
			);
						
			wp_enqueue_script('fca_qc_deactivation_js', FCA_QC_PLUGINS_URL . '/includes/deactivation.min.js', false, FCA_QC_PLUGIN_VER, true );
			wp_localize_script( 'fca_qc_deactivation_js', "fca_qc", $data );
		}
		
		
	}	
	add_action( 'admin_enqueue_scripts', 'fca_qc_admin_deactivation_survey' );
}