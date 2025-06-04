package com.chunaudis.image_toolkit.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chunaudis.image_toolkit.dto.JobMessageDTO;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Backoff;
 // si usás backoff en Retryable


@Service
public class JobPublisherService {

    private static final Logger log = LoggerFactory.getLogger(JobPublisherService.class);
    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange-name}")
    private String imageProcessingExchangeName;

    @Value("${app.rabbitmq.queues.bg-removal.routing-key}")
    private String bgRemovalRoutingKey;

    @Value("${app.rabbitmq.queues.upscaling.routing-key}")
    private String upscalingRoutingKey;

    @Value("${app.rabbitmq.queues.enlarge.routing-key}")
    private String enlargeRoutingKey;

    public JobPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }


  
    @Retryable(
        value = { RuntimeException.class },
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000)
    )
 public void publishJob(JobMessageDTO jobMessage) {
        String routingKey;
        


        switch (jobMessage.getJobType()) {
            case BG_REMOVAL:
                routingKey = bgRemovalRoutingKey;
                break;
            case UPSCALE:
                routingKey = upscalingRoutingKey;
                break;
            case ENLARGE:
                routingKey = enlargeRoutingKey;
                break;
            default:
                log.error("Unsupported job type for routing: {}", jobMessage.getJobType());
                throw new IllegalArgumentException("Unsupported job type: " + jobMessage.getJobType());
        }

 log.info("Intentando publicar job {} en exchange {} con routing key {}",
                jobMessage.getJobId(), imageProcessingExchangeName, routingKey);

        // Simular error (solo si estás probando el retry, después lo borrás)
       // throw new RuntimeException("Error simulado para probar el retry");

        rabbitTemplate.convertAndSend(imageProcessingExchangeName, routingKey, jobMessage);
    }

   @Recover
public void recover(RuntimeException e, JobMessageDTO failedMessage) {
    log.error("❌ Falló el envío del job {} después de 3 intentos. Error: {}", failedMessage.getJobId(), e.getMessage());
    // Podés agregar lógica extra aquí, como notificar o guardar el fallo en DB
}

}