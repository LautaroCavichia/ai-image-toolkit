package com.chunaudis.image_toolkit.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chunaudis.image_toolkit.dto.JobMessageDTO;

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

    public JobPublisherService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishJob(JobMessageDTO jobMessage) {
        String routingKey;
        // Determine routing key based on jobMessage.getJobType()
        switch (jobMessage.getJobType()) {
            case BG_REMOVAL:
                routingKey = bgRemovalRoutingKey;
                break;
            case UPSCALE:
                routingKey = upscalingRoutingKey;
                break;
            // case ENLARGE:
            // routingKey = enlargeRoutingKey;
            // break;
            default:
                log.error("Unsupported job type for routing: {}", jobMessage.getJobType());
                // TODO: Potentially throw an exception or handle as an error
                return;
        }

        log.info("Publishing job {} to exchange {} with routing key {}",
                jobMessage.getJobId(), imageProcessingExchangeName, routingKey);
        rabbitTemplate.convertAndSend(imageProcessingExchangeName, routingKey, jobMessage);
    }
}