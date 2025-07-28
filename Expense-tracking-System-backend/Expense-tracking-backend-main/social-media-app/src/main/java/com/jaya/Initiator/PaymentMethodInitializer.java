//package com.jaya.Initiator;
//
//import com.jaya.models.PaymentMethod;
//import com.jaya.repository.PaymentMethodRepository;
//import com.jaya.service.PaymentMethodService;
//import jakarta.annotation.PostConstruct;
//import jakarta.persistence.EntityNotFoundException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//@Component
//public class PaymentMethodInitializer {
//
//    @Autowired
//    private PaymentMethodRepository paymentMethodRepository;
//
//    @Autowired
//    private PaymentMethodService paymentMethodService;
//
//    @PostConstruct
//    public void initDefaultPaymentMethods() {
//        createIfNotExists("cash", "Default cash payment", "income", "#00FF00", "cash",true);
//        createIfNotExists("creditPaid", "Default card payment", "income", "#0000FF", "creditCard",true);
//        createIfNotExists("creditNeedToPaid", "Others Description", "income", "#CCCCCC", "creditCard",true);
//        createIfNotExists("cash", "Default cash payment", "expense", "#00FF00", "cash",true);
//        createIfNotExists("creditPaid", "Default card payment", "expense", "#0000FF", "creditCard",true);
//        createIfNotExists("creditNeedToPaid", "Others Description", "expense", "#CCCCCC", "creditCard",true);
//        // Add more as needed
//    }
//
//    private void createIfNotExists(String name, String description, String type, String color, String icon, boolean isGlobal) {
//        try {
//            paymentMethodService.getByNameAndTypeOrCreate(name,type);
//            // Already exists, do nothing
//        } catch (EntityNotFoundException ex) {
//            // Not found, so create it
//            PaymentMethod paymentMethod = new PaymentMethod();
//            paymentMethod.setName(name);
//            paymentMethod.setDescription(description);
//            paymentMethod.setType(type);
//            paymentMethod.setColor(color);
//            paymentMethod.setIcon(icon);
//            paymentMethod.setGlobal(isGlobal);
//            paymentMethodRepository.save(paymentMethod);
//        }
//    }
//}