package com.paymentgateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentRequest {
    public String order_id;
    public String method;
    public String vpa;
    public CardRequest card;
    
    public static class CardRequest {
        public String number;
        public String expiry_month;
        public String expiry_year;
        public String cvv;
        public String holder_name;
    }
}
