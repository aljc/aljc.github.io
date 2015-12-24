<?php

     // Note: GH pages doesn't allow PHP :(

     if (isset($_GET["submit"])) {
        $name = $_GET['name'];
        $email = $_GET['email'];
        $message = $_GET['message'];

        $from = 'Demo Contact Form';
        $to = 'ajchang@uchicago.edu';
        $subject = 'Message from Contact Demo ';

        $body = "From: $name\n E-Mail: $email\n Message:\n $message";

        // Check if name has been entered
        if (!$name) {
            $errName = 'Please enter your name';
        }

        // Check if email has been entered and is valid
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errEmail = 'Please enter a valid email address';
        }

        //Check if message has been entered
        if (!$message) {
            $errMessage = 'Please enter your message';
        }

    // If there are no errors, send the email
    if (!$errName && !$errEmail && !$errMessage) {
      if (mail ($to, $subject, $body, $from)) {
          $result='<div class="alert alert-success">Thank You! I will be in touch.</div>';
          echo $body;
          echo "Success!\n";
      } else {
          $result='<div class="alert alert-danger">Sorry, there was an error sending your message.
          Please try again later.</div>';
      }
    }
  }

?>