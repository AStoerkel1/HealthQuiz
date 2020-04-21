/* jshint asi: true */
jQuery( document ).ready(function($) {
	
	
	////////////////
	//   BROWSER DETECTION
	////////////////
	
	function isIE() {
		var ua = window.navigator.userAgent
		var msie = ua.indexOf('MSIE ')
		if (msie > 0) {
			// IE 10 or older
			return true
		}
		var trident = ua.indexOf('Trident/')
		if (trident > 0) {
			// IE 11
			return true
		}
		// other browser
		return false
	}
	
	function isOldAndroidVersion() {
		var ua = navigator.userAgent.toLowerCase()
		var match = ua.match( /android\s([0-9\.]*)/ )
		if ( match ) {
			return parseFloat( match[1] ) < 5
		}
		return false
	}
	
	var usingOldBrowser = isIE() || isOldAndroidVersion()
	
	var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
	
	function oldBrowserFix( selector ) {
		$( selector ).find( '#fca_qc_back_container' ).css( "backface-visibility", "visible" )
		$( selector ).find( '#fca_qc_back_container' ).css( "transform", "none" )
		$( selector ).find( '#fca_qc_back_container' ).hide()
		if ( isIE() ) {
			svg_square = '<svg xmlns="http://www.w3.org/2000/svg" class="fca_qc_rectancle" width="26" height="26"><rect style="fill: #fff; stroke: #000; stroke-width: 1;" width="26" height="26" /></svg>'
		}
	}

	var scoreString = $( '.fca_qc_score_text').first().html()
	var svg_square = '<svg xmlns="http://www.w3.org/2000/svg" class="fca_qc_rectancle" width="26" height="26"><rect style="fill: #fff; stroke: #000; stroke-width: 1;" width="26" height="26"></rect></svg>'

	//LOAD ALL QUIZZES INTO AN ARRAY AS KEY->VALUE PAIR WHERE KEY IS THE POST-ID OF THE QUIZ AND VALUE IS THE QUIZ OBJECT
	var quizzes = {}
	var default_img = ''
	function loadQuizzes() {
		$('.fca_qc_quiz').each(function( index ) {
			var thisId = get_quiz_id(this)
			if ( thisId ) {
				quizzes[thisId] = eval( 'quizData_' + thisId )
				quizzes[thisId].selector = this
				default_img = quizzes[thisId].default_img
			}
		})
		//TRIM ANY QUESTIONS THAT HAVE NO ANSWERS
		$.each(quizzes, function (key, value) {
			$.each(quizzes[key].questions, function (i, value) {
				quizzes[key].questions[i].answers = quizzes[key].questions[i].answers.filter(function( answer ) {
					return answer.answer !== '' || answer.img !== ''
				})
				
				if ( !quizzes[key].questions[i].hasOwnProperty('answers') || quizzes[key].questions[i].answers.length === 0   ) {
					quizzes[key].questions.splice(i)
				}
			})
		})
	
		//SHUFFLE QUESTIONS IF SELECTED
		$.each(quizzes, function (key) {
			if ( quizzes[key].quiz_settings.shuffle_questions === 'on' ) {
				quizzes[key].questions = shuffleArray( quizzes[key].questions )
			}		
		})

	}
	loadQuizzes()
	
	if ( fcaQcData.debug ) {
		console.log(quizzes)
	}
	////////////////
	//	PRE LOAD RESULT IMAGES 
	////////////////	
		
	function preloadImages() {
		$.each(quizzes, function (key, value) {
			//LOAD FIRST IMAGE
			if ( quizzes[key].questions[0] ) {
				lazyLoadQuestion( quizzes[key].questions[0] )
			}
		})
	}
	preloadImages()

	function lazyLoadResults( quiz ) {
		if ( quiz.hasOwnProperty('quiz_results') ) {
			$.each(quiz.quiz_results, function (key) {
				if ( quiz.quiz_results[key].hasOwnProperty('img') ) {
					lazyLoadImage( quiz.quiz_results[key].img )
				}
			})
		}
	}
	
	function lazyLoadImage( src ) {
		if ( src !== '' && src !== undefined && typeof src === 'string' ) {
			var img = new Image()
			img.src = src
		}
	}
	
	function lazyLoadQuestion( question ) {
		
		//SHARED FOR BOTH TYPES
		if ( question.hasOwnProperty('img') ) {
			lazyLoadImage( question.img )
		}

		//PERSONALITY 
		if ( question.hasOwnProperty('answers') ) {
			$.each( question.answers, function(key) {
				if ( question.answers[key].hasOwnProperty('img') ) {
					lazyLoadImage( question.answers[key].img )
				}
			})
		}
		
	}
	
	////////////////
	//	EVENT HANDLERS 
	////////////////	
	
	$( '.fca_qc_start_button' ).click(function() {
		
		var thisQuiz =  quizzes[ get_quiz_id( $(this).closest('.fca_qc_quiz') ) ]
		
		add_activity( thisQuiz.ajaxurl, thisQuiz.nonce, thisQuiz.quiz_id, 'starts' )
		
		if ( usingOldBrowser ) {
			oldBrowserFix( thisQuiz.selector )
		}
		
		fix_hover( thisQuiz )
		
		thisQuiz.currentQuestion = 0
		thisQuiz.score = 0
		thisQuiz.responses = []
		thisQuiz.questionCount = thisQuiz.questions.length
		if ( thisQuiz.quiz_settings.hide_answers === '' ) {
			thisQuiz.hideAnswers = 'after'
		} else if ( thisQuiz.quiz_settings.hide_answers === 'on' ) {
			thisQuiz.hideAnswers = 'end'
		} else {
			thisQuiz.hideAnswers = thisQuiz.quiz_settings.hide_answers
		}
		
		
		$( this ).siblings( '.fca_qc_quiz_title' ).hide()
		$( this ).siblings( '.fca_qc_quiz_description' ).hide()
		$( this ).siblings( '.fca_qc_quiz_description_img' ).hide()
		$( this ).hide()
		
		$( this ).siblings( '.fca_qc_quiz_div' ).show()
		$( this ).siblings( '.fca_qc_quiz_footer' ).show()
		$( this ).siblings( '.flip-container' ).show()
		$( this ).siblings( '.fca_qc_question_count' ).html( 1 + "/" + thisQuiz.questionCount )
		
		showQuestion( thisQuiz )
		
	})
	
	$( '.fca_qc_next_question').click(function() {
		
		var thisQuiz =  quizzes[ get_quiz_id( $(this).closest('.fca_qc_quiz') ) ]
		
		if ( usingOldBrowser ) {
			$( thisQuiz.selector ).find( '#fca_qc_answer_container' ).show()
			$( thisQuiz.selector ).find( '#fca_qc_back_container' ).hide()
			
		} else {
			$( thisQuiz.selector ).find( '.fca_qc_quiz_div' ).removeClass('flip')
		}

		showQuestion( thisQuiz )
	})

	$( '.fca_qc_answer_div' ).click(function() {
		
		var thisQuiz =  quizzes[ get_quiz_id( $(this).closest('.fca_qc_quiz') ) ]
		$( this ).blur().removeClass('fakehover')
		
		var question_id = $(this).closest('#fca_qc_answer_container').data('id')
		var response_id = $(this).data('id')
		
		var isCorrect = false
		
		//STORE RESULT
		if ( $( this ).attr('data-question') === thisQuiz.currentAnswer ) {
			thisQuiz.score = thisQuiz.score + 1
			isCorrect = true
		}
		var response = {
			"answer": addQuizImg( $( this ).children('.fca_qc_quiz_answer_img').attr('src') ) + $( this ).children('.fca_qc_answer_span').html().replace(svg_square, ''),"answer": addQuizImg( $( this ).children('.fca_qc_quiz_answer_img').attr('src') ) + $( this ).children('.fca_qc_answer_span').html().replace(svg_square, ''),
			"isCorrect": isCorrect,
			"correctAnswer": get_correct_answer_html( thisQuiz ),
			"question": $(this).siblings('#fca_qc_question').html(),
			"id": question_id,
			"response": response_id,
		}
		
		if ( thisQuiz.quiz_settings.explanations === 'on' ) {
			var hint = thisQuiz.questions[thisQuiz.currentQuestion - 1].answers.filter(function(ans){ return ans.hasOwnProperty('hint') })
			if ( hint.length === 1 ) {
				response.hint = hint[0].hint
			} 
		}
		
		thisQuiz.responses.push( response )
		
		add_response( thisQuiz.ajaxurl, thisQuiz.nonce, thisQuiz.quiz_id, question_id, response_id )
		
		if ( thisQuiz.quiz_settings.quiz_type === 'pt' ) {
			//PERSONALITY QUIZZES
		
			$.each( $(this).data('results'), function( i, value ){
				 
				$.each( thisQuiz.quiz_results, function( j, result ){
					if ( value === result.id ) {
						if ( result.hasOwnProperty('score') ) {
							result.score = result.score + 1
						} else {
							result.score = 1
						}
					}
				})
			})
			
			showQuestion( thisQuiz )
			
		} else {
		
			if ( thisQuiz.hideAnswers === 'after' ) {
				
				//SHOW THE CORRECT ANSWER
				$( thisQuiz.selector ).find( '#fca_qc_your_answer' ).html( addQuizImg ( $( this ).children('.fca_qc_quiz_answer_img').attr('src')) + $( this ).children('.fca_qc_answer_span').html().replace(svg_square,'') )
				
				var answer_html = get_correct_answer_html( thisQuiz )
				$( thisQuiz.selector ).find( '#fca_qc_correct_answer' ).html( answer_html )
				
				if ( thisQuiz.quiz_settings.explanations === 'on' ) {
					var hint = thisQuiz.questions[thisQuiz.currentQuestion - 1].answers.filter(function(ans){ return ans.hasOwnProperty('hint') })
					if ( hint.length === 1 ) {
						$( thisQuiz.selector ).find( '#fca_qc_hint_p' ).html( hint[0].hint )
					} else {
						$( thisQuiz.selector ).find( '#fca_qc_hint_p' ).html( '' )
					}
					
				}
				
				if ( usingOldBrowser ) {
					$( thisQuiz.selector ).find( '#fca_qc_answer_container' ).hide()
					$( thisQuiz.selector ).find( '#fca_qc_back_container' ).show()
				} else {
					$( thisQuiz.selector ).find( '.fca_qc_quiz_div' ).addClass( 'flip' )
				}
				
				$( thisQuiz.selector ).find( '#fca_qc_back_container' ).removeClass( 'correct-answer' )
				$( thisQuiz.selector ).find( '#fca_qc_back_container' ).removeClass( 'wrong-answer' )

				if ( isCorrect ) {
					
					$( thisQuiz.selector ).find( '#fca_qc_back_container' ).addClass( 'correct-answer' )
					$( thisQuiz.selector ).find( '#fca_qc_question_right_or_wrong' ).html( thisQuiz.correct_string )
					$( thisQuiz.selector ).find( '#fca_qc_correct_answer_p' ).hide()
					
				} else {

					$( thisQuiz.selector ).find( '#fca_qc_back_container' ).addClass( 'wrong-answer' )
					$( thisQuiz.selector ).find( '#fca_qc_question_right_or_wrong' ).html( thisQuiz.wrong_string )
					$( thisQuiz.selector ).find( '#fca_qc_correct_answer_p' ).show()
					
				}
				
				scale_flip_box_back( thisQuiz.selector )
				
			} else {
				showQuestion( thisQuiz )
			}
		}
	})
	
	////////////////
	//	HELPER FUNCTIONS 
	////////////////	
	
	function get_quiz_id ( obj ){
		var id = $( obj ).attr('id')
		if ( id ) {
			return id.replace(/\D+/g, "")
		}		
		return false		
	}
	
	function showQuestion( quiz ) {
		if ( quiz.quiz_settings.disable_scroll ) {
			//DO NOTHING
		} else {
			scrollQuizInToView( quiz.selector )			
		}
		
		if ( quiz.currentQuestion < quiz.questionCount ) {
			
			$( quiz.selector ).find( '.fca_qc_question_count' ).html( ( quiz.currentQuestion + 1 ) + "/" + quiz.questionCount )
							
			var question = quiz.questions[quiz.currentQuestion].question
			$( quiz.selector ).find( '#fca_qc_question' ).html( question )
			$( quiz.selector ).find( '#fca_qc_question_back' ).html( question )
			
			var img = quiz.questions[quiz.currentQuestion].img
			$( quiz.selector ).find( '#fca_qc_answer_container' ).find( '.fca_qc_quiz_question_img' ).attr( 'src', img )
			$( quiz.selector ).find( '#fca_qc_back_container' ).find( '.fca_qc_quiz_question_img' ).attr( 'src', img )
			$( quiz.selector ).find( '#fca_qc_answer_container' ).data( 'id', quiz.questions[quiz.currentQuestion].id )
			
			
			var answer
			if ( quiz.quiz_settings.quiz_type === 'mc' || quiz.quiz_settings.quiz_type === '' ) {
				answer = quiz.questions[quiz.currentQuestion].answers[0]
			}
			
			var shuffled_answers = shuffleArray( quiz.questions[quiz.currentQuestion].answers )
			
			//LAZY LOAD NEXT IMAGE 
			if ( (quiz.currentQuestion + 1) < quiz.questionCount ) {
				lazyLoadQuestion ( quiz.questions[quiz.currentQuestion+1] )
			} else {
				lazyLoadResults( quiz )
			}
						
			$( quiz.selector ).find( '.fca_qc_answer_div' ).hide()
			
			//PUT OUR ANSWER DATA INTO THE DIVS, BUT IF ITS EMPTY HIDE THE PARENT ELEMENT
			for (var i = 0; i<shuffled_answers.length; i++) {
				//NOTE: CHECKS IF THE HTML IS EQUAL TO ADD QUIZ IMAGE WITH NOTHING E.G. EMPTY SVG ICON
				if ( shuffled_answers[i].img !== '' || shuffled_answers[i].answer !== '' ) {
					//set quiz current answer property as the question number ( question-data attribute)
					if ( ( quiz.quiz_settings.quiz_type === 'mc'  || quiz.quiz_settings.quiz_type === '' ) && shuffled_answers[i].answer === answer.answer &&  shuffled_answers[i].img === answer.img ) {
						quiz.currentAnswer = $( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).attr( 'data-question' )
					}
					if ( quiz.quiz_settings.quiz_type === 'pt' ) {
						$( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).data( 'results', shuffled_answers[i].results )
					}
						
					$( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).find('.fca_qc_quiz_answer_img').attr( 'src', shuffled_answers[i].img )
					$( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).find('.fca_qc_answer_span').html( svg_square + shuffled_answers[i].answer )
					$( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).data( 'id', shuffled_answers[i].id )
					$( quiz.selector ).find( '.fca_qc_answer_div' ).eq(i).show()
				}
		
			}

			$( quiz.selector ).find( '#fca_qc_answer_container' ).waitForImages( function() {
				maybe_add_quarter_class( quiz.selector )
				scale_flip_box_question( quiz.selector )
			})
						
			quiz.currentQuestion = quiz.currentQuestion + 1
			
		} else {
			endTest( quiz )
		}
	}
	
	function maxHeightOfElementSet( $set ) {
		var maxHeight = 0
		
		$.each( $set, function (i) {
			if ( $set.eq(i).outerHeight() > maxHeight ) {
				maxHeight = $set.eq(i).outerHeight()
			}
		})
		
		return maxHeight
	}
	
	function scale_flip_box_question( selector ) {
		
		var newHeight = $(selector).find('#fca_qc_question').outerHeight(true)
		
		newHeight += $(selector).find('.fca_qc_quiz_question_img').outerHeight(true)
		
		var divCount = 0
		var elHeight = 0
		
		if ( $(selector).find( '.fca_qc_answer_div:visible' ).eq(0).hasClass('fca-qc-twoup') ) {
			//CALCULATIONS FOR TWO-UP LAYOUT		
			elHeight = maxHeightOfElementSet( $(selector).find( '.fca_qc_answer_div:visible' ) )
			divCount = $(selector).find( '.fca_qc_answer_div:visible' ).length
			divCount = Math.floor( divCount / 2 ) + ( divCount % 2 )
			
			newHeight += (elHeight * divCount)
			
		} else if ( $(selector).find( '.fca_qc_answer_div:visible' ).eq(0).hasClass('fca-qc-threeup') ){ 
			//CALCULATIONS FOR THREE-UP LAYOUT
			elHeight = maxHeightOfElementSet( $(selector).find( '.fca_qc_answer_div:visible' ) )
			divCount = $(selector).find( '.fca_qc_answer_div:visible' ).length
			divCount = divCount / 3
			
			newHeight += (elHeight * divCount)	
		
		} else {
			//CALCULATIONS FOR STANDARD (1-UP) LAYOUT
			$(selector).find( '.fca_qc_answer_div:visible' ).each(function(){
				newHeight += $(this).outerHeight(true)
			})	
		}
		
		if ( newHeight < 200 ) {
			newHeight = 200
		}

		$(selector).find( '.fca_qc_quiz_div, #fca_qc_answer_container, #fca_qc_back_container' ).outerHeight( newHeight )

	}
	
	function scale_flip_box_back( selector ) {
		var newHeight = 0
		$(selector).find('#fca_qc_back_container').children().each( function() {
			if ( $( this ).is( ':visible' ) ) {	
				newHeight += $(this).outerHeight(true)
			}
		})
		
		// A MARGIN FOR THE BOTTOM
		newHeight += 35
	
		if ( newHeight < 200 ) {
			newHeight = 200
		}

		$(selector).find( '.fca_qc_quiz_div, #fca_qc_answer_container, #fca_qc_back_container' ).height( newHeight )

	}
	
	function maybe_add_quarter_class( selector ) {
		
		//RESET ANY PREVIOUS STATE
		$( selector ).find('.fca_qc_answer_div').height('auto')
		$( selector ).find('.fca_qc_answer_div').removeClass('fca-qc-twoup fca-qc-threeup')
		$( selector ).find('.fca_qc_quiz_answer_img').css( 'marginBottom', 0 )
		
		//CHECK IF 'ELIGABLE' TO ADD A TWO-UP OR THREE-UP CLASS
		
		var addClass = true
			
		//IF IT HAS IMAGES, MAKE IT QUARTER SIZE
		var answerCount = 0
		$( selector ).find('.fca_qc_answer_div:visible').each( function(){
			answerCount++
			if ( $( this ).find('.fca_qc_quiz_answer_img').attr('src') !== '' && addClass ) {
				// ( CONTINUE )
			} else {
				addClass = false
				//BREAK THIS LOOP
				return false
			}
		})
		
		if ( addClass ) {
			
			//DETERMINE WHICH CLASS TO ADD
			var classToAdd = 'fca-qc-twoup'
			//ONLY ADD THREE UP CLASS IF 'MOBILE CHECK' IS HIDDEN E.G. IS NOT MOBILE 
			if ( answerCount % 3 === 0 && $( selector ).find('.fca_qc_mobile_check:visible').length === 0 ) {
				classToAdd = 'fca-qc-threeup'				
			}
			
			$(selector).find('.fca_qc_answer_div').addClass( classToAdd )
			
			//SET IMAGE MARGIN BOTTOM
			var maxImgHeight = maxHeightOfElementSet( $(selector).find('.fca_qc_quiz_answer_img:visible') )
			if ( maxImgHeight > 200 ) {
				maxImgHeight = 200
			}
						
			$(selector).find('.fca_qc_quiz_answer_img:visible').each(function(){
				$(this).css( 'marginBottom', maxImgHeight - $(this).height() + 10 + 'px' )
			})
			
			//set box height
			var boxHeight = maxHeightOfElementSet( $(selector).find('.fca_qc_answer_div:visible') )
			$(selector).find('.fca_qc_answer_div:visible').outerHeight(boxHeight)
			
			return true
		}
		
		return false
	}
	
	function get_result( quiz ) {

		if ( !quiz.quiz_results ) {
			//NO RESULTS FOUND
			return false
		}
				
		if ( quiz.quiz_settings.quiz_type === 'pt' ) {

			var winners = []
			var topScore = -1
				
			$.each( quiz.quiz_results, function( i, result ){
				if ( result.hasOwnProperty('score') ) {
					if ( result.score > topScore ) {
						topScore = result.score
					}
				}
				
			})
			$.each( quiz.quiz_results, function( i, result ){
				if ( result.hasOwnProperty('score') ) {
					if ( result.score === topScore ) {
						winners.push( result )
					}
				}
				
			})
			
			//SET A RANDOM IF YOU GOT NOTHING IN ANY
			if ( winners.length === 0 ) {
				winners = quiz.quiz_results
			}
						
			
			return winners[Math.floor(Math.random() * winners.length)]
						
		}

		if ( quiz.quiz_settings.quiz_type === 'mc' || quiz.quiz_settings.quiz_type === '' ) {
			for ( var i = 0; i < quiz.quiz_results.length; i++ ) {
				if ( quiz.quiz_results[i].min <= quiz.score && quiz.quiz_results[i].max >= quiz.score) {
					return quiz.quiz_results[i]
				}
			}
		}
		
		return false
		
		
	}
	
	//DRAW THE 'YOUR RESPONSES' BOXES AT THE END OF THE QUIZ
	function show_responses( quiz ) {
		
		var html

		for (var i = 0; i<quiz.questions.length; i++ ) {
			
			html = ''
			
			if ( quiz.responses[i].isCorrect ) {
				html += "<div class='fca_qc_question_response_item correct-answer'>"
			} else {
				html += "<div class='fca_qc_question_response_item wrong-answer'>"
			}
					
			html += "<h3 class='fca_qc_question_response_question'>" + (i + 1) + ". " + quiz.questions[i].question + "</h3>"
			html += "<img class='fca_qc_quiz_question_img' src='" + quiz.questions[i].img + "'>"
			html += "<p class='fca_qc_question_response_response'><span class='fca_qc_bold'>" + quiz.your_answer_string + " </span>" + quiz.responses[i].answer + "</p>"
			html += "<p class='fca_qc_question_response_correct_answer'><span class='fca_qc_bold'>" + quiz.correct_answer_string + " </span>" + quiz.responses[i].correctAnswer + "</p>"
			if ( quiz.responses[i].hasOwnProperty('hint') ) {
				html += "<p class='fca_qc_question_response_hint'>" + quiz.responses[i].hint + "</p>"
			}
			html += "</div>"
			
			$( quiz.selector ).find( '.fca_qc_insert_response_above' ).before(html)

		}
		$( quiz.selector ).find( '.fca_qc_your_answer_container' ).show()
	}

	function endTest( quiz ) {
		
		$( quiz.selector ).find( '.fca_qc_quiz_footer' ).hide()
		$( quiz.selector ).find( '.fca_qc_quiz_div' ).hide()
				
		if ( quiz.quiz_settings.quiz_type === 'mc' || quiz.quiz_settings.quiz_type === '' ) {
			var scoreParagraph = scoreString.replace('{{SCORE_CORRECT}}', quiz.score)
			scoreParagraph = scoreParagraph.replace('{{SCORE_TOTAL}}', quiz.questionCount)
			  
			$( quiz.selector ).find( '.fca_qc_score_text').html( scoreParagraph )	
		}
		if ( quiz.quiz_settings.quiz_type === 'pt' ) {
			$( quiz.selector ).find( '.fca_qc_score_text' ).hide()
		}
				
		var result = get_result( quiz )
		
		if ( result ) {
		
			$( quiz.selector ).find( '.fca_qc_score_title').html( result.title )
			$( quiz.selector ).find( '.fca_qc_score_img').attr( 'src', result.img )
			$( quiz.selector ).find( '.fca_qc_score_desc').html( result.desc )
		
		}
		
		if ( quiz.optin_settings.capture_emails === 'on' ) {
			show_optins( quiz, result )
		} else {
			show_sharing_and_result_screen( quiz, result )
		}
	}

	function show_optins ( quiz, result ) {
	
		//ACTIVATE TOOLTIPSTER
		$( quiz.selector ).find( '.fca_qc_optin_input, .fca-qc-gdpr-consent' ).not('.tooltipstered').tooltipster( {trigger: 'custom', maxWidth: 240, theme: ['tooltipster-borderless', 'tooltipster-quiz-cat'] } )
		$( quiz.selector ).find( '.tooltipstered' ).tooltipster('close')
		
		$( quiz.selector ).find( '.fca_qc_optin_container' ).show()
		$( quiz.selector ).find( '.fca_qc_optin_input' ).first().focus()

		$( quiz.selector ).find( '.fca_qc_skip_email_button' ).click(function(){
			$( quiz.selector ).find( '.fca_qc_optin_container' ).hide()
			$( quiz.selector ).find( '.tooltipstered' ).tooltipster('close')
			show_sharing_and_result_screen ( quiz, result )			
		})
		
		$( quiz.selector ).find( '.fca_qc_submit_email_button' ).click(function(){
			//submit some stuff here and go to next screen if OK?
			var user_email = $( quiz.selector ).find( '#fca_qc_email_input' ).val()
			var user_name = $( quiz.selector ).find( '#fca_qc_name_input' ).val()
			
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

			var email_validated = regex.test( user_email )
			var name_validated = user_name !== '' || $( quiz.selector ).find( '#fca_qc_name_input' ).length === 0
			
			//triggers a CSS reset to allow animation to go again
			$( quiz.selector ).find( '.fca_qc_optin_input' ).removeClass('fca_qc_invalid')
			quiz.selector.offsetWidth = quiz.selector.offsetWidth
			
			if ( email_validated && name_validated ) {
				$( quiz.selector ).find( '.tooltipstered' ).tooltipster('close')
				var gdpr_consent = 'unknown'
				if( quiz.gdpr_checkbox ) {
					var $gdpr_checkbox = $( quiz.selector ).find( '.fca-qc-gdpr-consent:visible' )
					
					if ( $gdpr_checkbox.length == 0 ) {
							$( quiz.selector ).find('.fca-qc-gdpr').show()
							$( quiz.selector ).find('.fca_qc_optin_input').hide()
							return false
						} else if ( $gdpr_checkbox.prop( 'checked' ) == false ) {				
							$gdpr_checkbox.tooltipster('open')
							return false
						} else {
							gdpr_consent = true				
						}
				} 
				
				$(document).unbind('keypress')
				$( quiz.selector ).find( '.tooltipstered' ).tooltipster('close')
								
				quiz.user = {
					name : user_name,
					email : user_email
				}
				
				add_to_mailing_list( quiz, user_email, user_name, result )
				$( quiz.selector ).find( '.fca_qc_optin_container' ).hide()
				show_sharing_and_result_screen ( quiz, result )
				
			} else {
				//show some error
				if ( !email_validated ) {
					$( quiz.selector ).find( '#fca_qc_email_input' ).tooltipster('open')
					$( quiz.selector ).find( '#fca_qc_email_input' ).addClass('fca_qc_invalid')
					
				} else {
					$( quiz.selector ).find( '#fca_qc_email_input' ).tooltipster('close')
					$( quiz.selector ).find( '#fca_qc_email_input' ).removeClass('fca_qc_invalid')
				}
				if ( !name_validated ) {
					$( quiz.selector ).find( '#fca_qc_name_input' ).tooltipster('open')
					$( quiz.selector ).find( '#fca_qc_name_input' ).addClass('fca_qc_invalid')
					
				} else {
					$( quiz.selector ).find( '#fca_qc_name_input' ).tooltipster('close')
					$( quiz.selector ).find( '#fca_qc_name_input' ).removeClass('fca_qc_invalid')
				}
				
			}

		})
		
		if ( $( quiz.selector ).find( '.fca_qc_skip_email_button' ).length === 0 && $( quiz.selector ).find( '.fca_qc_submit_email_button' ).length === 0 ) {
			//SOMETHING WENT WRONG, MAYBE DOWNGRADED VERSION
			show_sharing_and_result_screen ( quiz, result )
		} else {
			//BIND ENTER TO SUBMIT BUTTON
			$(document).keypress(function(e){
				if (e.which === 13){
					$( quiz.selector ).find( '.fca_qc_submit_email_button' ).click()
					//make sure forms don't submit?
					return false
				}
			})
		}
		
	}
	var optins = []
	function add_to_mailing_list( quiz, user_email, user_name, result ) {

		if ( fcaQcData.debug ) {
			console.log ( result )
		}
		
		if ( optins.indexOf( quiz.quiz_id ) !== -1 ) {
			//already got a result for this quiz
			if ( fcaQcData.debug ) {
				console.log ( 'already opted in for this quiz! woop' )
			}
			return false
		} else {
			optins.push( quiz.quiz_id )				
		}
		
		var tz = jstz.determine()
	
		$.ajax({
			url: quiz.ajaxurl,
			type: 'POST',
			data: {
				nonce: quiz.nonce,
				post_id: quiz.quiz_id,
				action: 'fca_qc_add_to_mailing_list',
				email: user_email,
				name: user_name,
				result: get_result_text ( quiz, result ),
				tags: result.tags,
				groups: result.groups,
				timezone: tz.name()
			}
		}).done( function( returnedData ) {
			if ( fcaQcData.debug ) {
				console.log ( returnedData )
			}

				
		})
	}
	
	var shared = []
	var completed = []
	function add_activity( ajaxurl, nonce, post_id, type ) {
		if ( fcaQcData.analytics == false ) {
			return false
		}
	
		if ( type === 'shares' ) {
			if ( shared.indexOf(post_id) !== -1 ) {
				//already shared this quiz
				if ( fcaQcData.debug ) {
					console.log ( 'already shared this quiz! woop' )
				}				
				return false
			} else {
				shared.push(post_id)				
			}
		} else if ( type === 'completions' ) {
			if ( completed.indexOf(post_id) !== -1 ) {
				//already completed this quiz
				if ( fcaQcData.debug ) {
					console.log ( 'already completed this quiz! woop' )
				}	
				
				return false
			} else {
				completed.push(post_id)				
			}
		}
		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				nonce: nonce,
				quiz_id: post_id,
				action: 'fca_qc_activity',
				type: type
			}
		}).done( function( returnedData ) {
			if ( fcaQcData.debug ) {
				console.log ( returnedData )
			}	
		})
	}
	
	
	function add_response( ajaxurl, nonce, post_id, question_id, response_id ) {
		
		if ( fcaQcData.analytics == false ) {
			return false
		}
		
		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				nonce: nonce,
				quiz_id: post_id,
				question: question_id,
				response: response_id,
				action: 'fca_qc_add_response_ajax'
			}
		}).done( function( returnedData ) {
			if ( fcaQcData.debug ) {
				console.log ( returnedData )
			}
		})
	}
	
	function send_responses( quiz, result ) {
		
		var name = ''
		var email = ''
		var result_id = ''
		var gdpr_consent = 'unknown'
		
		if ( fcaQcData.analytics == false ) {
			return false
		}		
		
		if( quiz.gdpr_checkbox ) {
			var $gdpr_checkbox = $( quiz.selector ).find( '.fca-qc-gdpr-consent' )
			
			if ( $gdpr_checkbox.prop( 'checked' )  ) {
				gdpr_consent = true
			} else {
				gdpr_consent = false
			}
		} 		
		
		if ( quiz.hasOwnProperty('user')  ) {
			name = quiz.user.name
			email = quiz.user.email
		}
		if ( result.hasOwnProperty('id') ) {		
			result_id = result.id		
		} else {		
			result_id = quiz.score		
		}
		
		$.ajax({
			url: quiz.ajaxurl,
			type: 'POST',
			data: {
				nonce: quiz.nonce,
				quiz_id: quiz.quiz_id,
				name: name,
				email: email,
				gdpr_consent: gdpr_consent,
				result: result_id,
				result_text: get_result_text( quiz, result ),
				responses: quiz.responses,
				action: 'fca_qc_send_responses_ajax'
			}
		}).done( function( returnedData ) {
			if ( fcaQcData.debug ) {
				console.log ( returnedData )
			}			
		})
	}
	
	function restart_quiz ( quiz ) {
		location.reload()
	}
	
	function get_result_text( quiz, result ) {
		
		var title = ''
		
		if ( result.hasOwnProperty('title') ) {
			title = result.title
		}
		//
		if ( quiz.quiz_settings.quiz_type === 'mc' || quiz.quiz_settings.quiz_type === '' ) {
			if ( title ) {
				title = quiz.score + '/' + quiz.questionCount + ': ' + result.title
			} else {
				title = quiz.score + '/' + quiz.questionCount
			}
			
		} 
		
		return title
		
	}
	
	function show_sharing_and_result_screen ( quiz, result ) {
	
		send_responses ( quiz, result )
		
		if ( quiz.quiz_settings.result_mode === 'redirect' ) {
			window.location.href = result.url
		} else {
			if ( quiz.quiz_settings.restart_button === 'on' ) {
				$('#fca_qc_restart_button').click(function(){
					restart_quiz( quiz )
					$(this).hide()
				}).show('fast')
			}
			
			if ( quiz.hideAnswers === 'end' ) {
				show_responses( quiz )
			}		
			
			if ( quiz.quiz_settings.show_sharing === 'on' ) {
				show_sharing( quiz, result )
			}
			
			$( quiz.selector ).find( '.fca_qc_score_container' ).show()
		}
	}
	
	function get_correct_answer_html ( quiz ) {
		var img = ''
		var answer = ''
		
		$( quiz.selector ).find('.fca_qc_answer_div').each(function() {
			if ( $(this).attr('data-question') === quiz.currentAnswer ) {
				img = addQuizImg( $(this).find('.fca_qc_quiz_answer_img').attr('src'))
				answer = $(this).find('.fca_qc_answer_span').html().replace(svg_square, '')
				
			}
		})
		return img + answer
	}
	
	////////////////
	//	UTILITY FUNCTIONS 
	////////////////
	
	function fix_hover ( quiz ) {
		//FIX MOBILE TAP TARGET GETTING HOVER
		$( quiz.selector ).find('.fca_qc_answer_div').hover( function(e) {
			$(this).addClass('fakehover')
		},function(e) {
			$(this).removeClass('fakehover')
		})
	}
	
	function show_sharing ( quiz, result ) {
		$( quiz.selector ).find( '.fca_qc_social_share' ).show('fast')
		
		//FIND RESULT IMAGE ( SCORE IMAGE IF EXISTS, OTHERWISE DESCRIPTION IMAGE IF IT EXISTS, OTHERWISE DEFAULT PLACEHOLDER IMAGE
		var resultImg = $( quiz.selector ).find( '.fca_qc_score_img').attr( 'src' )
		if ( resultImg === '' ) {
			resultImg = $( quiz.selector ).find( '.fca_qc_quiz_description_img').attr( 'src' )
		}
		if ( resultImg === '' ) {
			resultImg = default_img
		}
		
		var $fb_link = $( quiz.selector ).find( '#fca_qc_share_link_facebook' )
		
		if ( $fb_link.length === 1 ) { 
			if ( result.hasOwnProperty('title') && result.title ) {
				$fb_link.prop('href', $fb_link.prop('href') + quiz.quiz_results.indexOf( result ) )
			} else if ( result == false ) {
				$fb_link.prop('href', $fb_link.prop('href') + '0' + encodeURIComponent ( '&fca_qc_title=' + get_result_text ( quiz, result ) ) )
			} else {
				$fb_link.prop('href', $fb_link.prop('href') + quiz.quiz_results.indexOf( result ) + encodeURIComponent ( '&fca_qc_title=' + get_result_text ( quiz, result ) ) )
			}
			
		}
		
		var $twitter_link = $( quiz.selector ).find( '#fca_qc_share_link_twitter' )
		
		if ( $twitter_link.length === 1 ) {
			encode_share_link ($twitter_link, get_result_text ( quiz, result ) )
		}
		var $email_link = $( quiz.selector ).find( '#fca_qc_share_link_email' )
		
		if ( $email_link.length === 1 ) {
			encode_share_link ($email_link, get_result_text ( quiz, result ) )
		}
		
		if ( iOS ) {
			$email_link.hide()
		}
		
		var $pin_link = $( quiz.selector ).find( '#fca_qc_share_link_pinterest' )

		if ( $pin_link.length === 1 ) {
			encode_share_link ( $pin_link, get_result_text ( quiz, result ) )
			$pin_link.prop('href', $pin_link.prop('href') + '&media=' + resultImg )
		}
	
		$( quiz.selector ).find('.fca_qc_share_link').click(function(event){
			event.preventDefault()
			var url = $(this).prop('href')				
			window.open(url, '_blank', 'resizable=yes,scrollbars=yes,titlebar=yes, width=560, height=443, top=100, left=50')
			add_activity( quiz.ajaxurl, quiz.nonce, quiz.quiz_id, 'shares' )
		})	
	}
	
	function encode_share_link ( $link, resultText ) {
		
		var string = encodeURIComponent ( $link.data('sharestring').replace('{{MY_QUIZ_RESULT}}', resultText ) )
		var oldLink = $link.prop('href')
		$link.prop('href', oldLink + string )
	}

	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1))
			var temp = array[i]
			array[i] = array[j]
			array[j] = temp
		}
		return array
	}
	
	function addQuizImg(src) {
		if ( src && src !== '' && typeof(src) === 'string' ) {
			return "<img class='fca_qc_quiz_answer_img' src='" +src+ "'>"
		} else {
			return ''
		}
	}
	
	function scrollQuizInToView( selector ) {
		var screenPosition = $(selector).offset().top + -100
		
		if ( screenPosition < 0 ) {
			screenPosition = 0
		}
		
		$('html, body').animate( { scrollTop: screenPosition }, 300);
	}
	
	var resizeWindow = debounce(function() {
		// All the taxing stuff you do
		jQuery.each( quizzes, function(i) {
			$( quizzes[i].selector ).find( '#fca_qc_answer_container' ).waitForImages( function() {
				maybe_add_quarter_class( quizzes[i].selector )
				if ( $('#fca_qc_back_container').is(':visible') ) {
					scale_flip_box_back( quizzes[i].selector )
				} else {
					scale_flip_box_question( quizzes[i].selector )
				}
			})
		})

	}, 50)

	window.addEventListener('resize', resizeWindow)
	
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
		var timeout
		return function() {
			var context = this, args = arguments
			var later = function() {
				timeout = null
				if (!immediate) func.apply(context, args)
			}
			var callNow = immediate && !timeout
			clearTimeout(timeout)
			timeout = setTimeout(later, wait)
			if (callNow) func.apply(context, args)
		}
	}
	
})