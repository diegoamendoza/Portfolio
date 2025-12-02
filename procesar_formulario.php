<?php
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$mensaje = $_POST['mensaje'] ?? '';

if (!empty($nombre) && !empty($email) && !empty($mensaje)) {
    
    $para = 'diegomendozadev@gmail.com';


    $asunto = 'Nuevo mensaje del formulario de contacto';

    
    $mensaje_correo = "Nombre: $nombre\n";
    $mensaje_correo .= "Email: $email\n\n";
    $mensaje_correo .= "Mensaje:\n$mensaje\n";

    
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    
    if (@mail($para, $asunto, $mensaje_correo, $headers)) {
        @echo '<script>alert("¡El mensaje se ha enviado con éxito!");</script>';
    } else {
        echo 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.';
    }
} else {
    echo 'Por favor, completa todos los campos del formulario.';
}
?>
