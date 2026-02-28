package com.jaya.common.service.client.feign;

import com.jaya.common.dto.PaymentMethodDTO;
import com.jaya.common.service.client.IPaymentMethodServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client implementation for Payment Method Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "PAYMENT-SERVICE",
    url = "${PAYMENT_SERVICE_URL:http://localhost:6006}",
    contextId = "commonPaymentMethodServiceClient"
)
@Profile("!monolithic")
public interface FeignPaymentMethodServiceClient extends IPaymentMethodServiceClient {

    @Override
    @GetMapping("/api/payment-method/all")
    List<PaymentMethodDTO> getAllPaymentMethods(@RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/payment-method/save")
    PaymentMethodDTO save(@RequestBody PaymentMethodDTO paymentMethod);

    @Override
    @GetMapping("/api/payment-method/by-name-and-type")
    PaymentMethodDTO getByNameAndType(@RequestParam("userId") Integer userId,
                                       @RequestParam("name") String name,
                                       @RequestParam("type") String type);

    @Override
    @GetMapping("/api/payment-method/by-name")
    PaymentMethodDTO getByName(@RequestParam("userId") Integer userId,
                                @RequestParam("name") String name);
}
