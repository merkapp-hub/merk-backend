// Order Status Email Templates

const getEmailHeader = () => `
  <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(18, 52, 77, 0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #12344D 0%, #1a4d6f 100%); padding: 40px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
          <span style="color: #E58F14;">Merk</span> Actualización de Pedido
        </h1>
      </td>
    </tr>
`;

const getEmailFooter = () => `
    <tr>
      <td style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
          <strong style="color: #12344D;">Merk</strong> - Tu Destino de Compras Premium
        </p>
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Merk. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
`;


const orderReceivedTemplate = ({ name, orderId, orderTotal, orderDate, currencySymbol = '$' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            ✓ Pedido Recibido
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">¡Hola ${name}! 👋</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          ¡Gracias por tu pedido! Hemos recibido tu pedido y comenzaremos a procesarlo en breve.
        </p>

        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #12344D; font-size: 18px;">📦 Detalles del Pedido</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">ID del Pedido:</td>
              <td style="padding: 8px 0; color: #12344D; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Fecha del Pedido:</td>
              <td style="padding: 8px 0; color: #12344D; font-weight: 600; text-align: right;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Monto Total:</td>
              <td style="padding: 8px 0; color: #E58F14; font-weight: 700; font-size: 18px; text-align: right;">${currencySymbol}${orderTotal}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>¿Qué sigue?</strong><br>
            Te enviaremos otro correo una vez que comencemos a preparar tu pedido.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          ¿Preguntas? Contáctanos en <a href="mailto:merkapp25@gmail.com" style="color: #E58F14;">merkapp25@gmail.com</a>
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;


const orderPreparingTemplate = ({ name, orderId, estimatedTime = '1-2 días hábiles' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            📦 Preparando tu Pedido
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">¡Buenas Noticias, ${name}! 🎉</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Ahora estamos preparando tu pedido para el envío. Nuestro equipo está empacando cuidadosamente tus artículos para asegurar que lleguen en perfectas condiciones.
        </p>

        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px;">📋 Estado del Pedido</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">ID del Pedido:</td>
              <td style="padding: 8px 0; color: #1e40af; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">Estado:</td>
              <td style="padding: 8px 0; color: #3b82f6; font-weight: 600; text-align: right;">Preparando</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #1e3a8a;">Envío Estimado:</td>
              <td style="padding: 8px 0; color: #1e40af; font-weight: 600; text-align: right;">${estimatedTime}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">2</div>
            <div style="width: 60px; height: 3px; background-color: #e5e7eb;"></div>
            <div style="width: 30px; height: 30px; background-color: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-center; color: #9ca3af; font-weight: bold;">3</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #64748b;">
            <span>Recibido</span>
            <span style="color: #3b82f6; font-weight: 600;">Preparando</span>
            <span>Enviado</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          ¡Te notificaremos tan pronto como tu pedido sea enviado!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

const orderShippedTemplate = ({ name, orderId, trackingNumber = 'N/A', estimatedDelivery = '2-3 días hábiles' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            🚚 Pedido Enviado
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">¡Tu Pedido Está en Camino, ${name}! 📦</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          ¡Buenas noticias! Tu pedido ha sido enviado y está en camino hacia ti. Puedes esperar la entrega pronto.
        </p>

        <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-left: 4px solid #8b5cf6; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #6b21a8; font-size: 18px;">🚚 Detalles de Envío</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">ID del Pedido:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">Número de Rastreo:</td>
              <td style="padding: 8px 0; color: #8b5cf6; font-weight: 600; text-align: right;">${trackingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5b21b6;">Entrega Estimada:</td>
              <td style="padding: 8px 0; color: #6b21a8; font-weight: 600; text-align: right;">${estimatedDelivery}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #8b5cf6;"></div>
            <div style="width: 30px; height: 30px; background-color: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">3</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #64748b;">
            <span>Recibido</span>
            <span>Preparado</span>
            <span style="color: #8b5cf6; font-weight: 600;">Enviado</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          ¡Te notificaremos cuando tu pedido esté en camino para entrega!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;


const outForDeliveryTemplate = ({ name, orderId, deliveryTime = 'hoy' }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            🚴 En Camino para Entrega
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">¡Casi Llega, ${name}! 🎯</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          Tu pedido está en camino para entrega y llegará pronto. Por favor asegúrate de que alguien esté disponible para recibir el paquete.
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #92400e; font-size: 18px;">🚴 Información de Entrega</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #78350f;">ID del Pedido:</td>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Estado:</td>
              <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; text-align: right;">En Camino para Entrega</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Entrega Esperada:</td>
              <td style="padding: 8px 0; color: #92400e; font-weight: 600; text-align: right;">${deliveryTime}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #f59e0b;"></div>
            <div style="width: 30px; height: 30px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">4</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #64748b;">
            <span>Recibido</span>
            <span>Preparado</span>
            <span>Enviado</span>
            <span style="color: #f59e0b; font-weight: 600;">En Camino</span>
          </div>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>📍 Consejo de Entrega:</strong><br>
            Por favor mantén tu teléfono a mano. Nuestro socio de entrega puede llamarte para indicaciones.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          ¡Gracias por comprar con Merk!
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;


const orderDeliveredTemplate = ({ name, orderId, deliveryDate, proofImage = null }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  ${getEmailHeader()}
    <tr>
      <td style="padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600;">
            ✓ Entregado Exitosamente
          </div>
        </div>
        
        <h2 style="color: #12344D; font-size: 24px; margin: 0 0 15px;">¡Entregado, ${name}! 🎉</h2>
        
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          ¡Buenas noticias! Tu pedido ha sido entregado exitosamente. ¡Esperamos que ames tu compra!
        </p>

        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">✓ Confirmación de Entrega</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #047857;">ID del Pedido:</td>
              <td style="padding: 8px 0; color: #065f46; font-weight: 600; text-align: right;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857;">Entregado el:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600; text-align: right;">${deliveryDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #047857;">Estado:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 700; text-align: right;">ENTREGADO ✓</td>
            </tr>
          </table>
        </div>

        ${proofImage ? `
        <div style="margin: 25px 0; text-align: center;">
          <h3 style="color: #12344D; font-size: 16px; margin: 0 0 15px;">📸 Prueba de Entrega</h3>
          <img src="${proofImage}" alt="Prueba de Entrega" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
            <div style="width: 60px; height: 3px; background-color: #10b981;"></div>
            <div style="width: 30px; height: 30px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">✓</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 10px; color: #10b981; font-weight: 600;">
            <span>Recibido</span>
            <span>Preparado</span>
            <span>Enviado</span>
            <span>En Camino</span>
            <span>Entregado</span>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💬 ¡Nos Encantaría Tu Opinión!</strong><br>
            ¿Cómo fue tu experiencia? Por favor tómate un momento para calificar tu compra.
          </p>
        </div>

        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; text-align: center;">
          ¡Gracias por elegir Merk! Esperamos servirte nuevamente pronto. 💙
        </p>
      </td>
    </tr>
  ${getEmailFooter()}
</body>
</html>
`;

module.exports = {
  orderReceivedTemplate,
  orderPreparingTemplate,
  orderShippedTemplate,
  outForDeliveryTemplate,
  orderDeliveredTemplate
};
