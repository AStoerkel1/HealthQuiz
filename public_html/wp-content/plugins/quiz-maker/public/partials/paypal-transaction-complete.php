<?php
    require_once explode("wp-content", __FILE__)[0] . "wp-load.php";
    if(!session_id()) {
        session_start();
    }

    $request_body = file_get_contents('php://input');
    $primaryResponse = json_decode( $request_body, true );
    global $wpdb;
    $paypal_settings = (get_option( 'ays_quiz_integrations' ) == null || get_option( 'ays_quiz_integrations' ) == '') ? array() : json_decode( get_option( 'ays_quiz_integrations' ), true );
    $payment_terms = isset($paypal_settings['payment_terms']) ? $paypal_settings['payment_terms'] : 'lifetime';

    $user_id = get_current_user_id();

    $quiz_id = $primaryResponse['quizId'];
    $order_id = $primaryResponse['data']['orderID'];
    $payment_date = $primaryResponse['details']['create_time'];
    $order_full_name = $primaryResponse['details']['payer']['name']['given_name'] . " " . $primaryResponse['details']['payer']['name']['surname'];
    $order_email = $primaryResponse['details']['payer']['email_address'];
    $amount = $primaryResponse['details']['purchase_units'][0]['amount']['value'].$primaryResponse['details']['purchase_units'][0]['amount']['currency_code'];
    $order = array(
        'order_id' => $order_id,
        'quiz_id' => $quiz_id,
        'user_id' => $user_id,
        'order_full_name' => $order_full_name,
        'order_email' => $order_email,
        'payment_date' => $payment_date,
        'amount' => $amount
    );
    $result = $wpdb->insert(
        $wpdb->prefix . "aysquiz_orders",
        $order,
        array( '%s', '%d', '%d', '%s', '%s', '%s', '%s' )
    );
    if( $result >= 0  ) {
        switch($payment_terms){
            case "onetime":
                $_SESSION['ays_quiz_paypal_purchase'] = true;
                $user_meta = true;
            break;
            case "lifetime":
                $_SESSION['ays_quiz_paypal_purchase'] = true;
                $current_usermeta = get_user_meta($user_id, "quiz_paypal_purchase");
                if($current_usermeta !== false && !empty($current_usermeta)){
                    foreach($current_usermeta as $key => $usermeta){
                        if($quiz_id == json_decode($usermeta, true)['quizId']){                   
                            $opts = json_encode(array(
                                'quizId' => $quiz_id,
                                'purchased' => true
                            ));
                            $user_meta = update_user_meta($user_id, 'quiz_paypal_purchase', $opts, $usermeta);
                            break;
                        }
                    }
                }
            break;
        }
    }else{
        $user_meta = false;
    }
    if($user_meta){
        echo json_encode(array(
            'status' => true,
        ));
    }else{
        echo json_encode(array(
            'status' => false
        ));
    }
    die();
?>
