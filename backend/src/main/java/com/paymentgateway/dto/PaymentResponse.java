package com.paymentgateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    public String id;
    public String order_id;
    public Integer amount;
    public String currency;
    public String method;
    public String status;
    public String vpa;
    public String card_network;
    public String card_last4;
    public String created_at;
    public String updated_at;
    public String error_code;
    public String error_description;
}
