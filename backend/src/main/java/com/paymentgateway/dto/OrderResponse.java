package com.paymentgateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    public String id;
    public Integer amount;
    public String currency;
    public String receipt;
    public String status;
    public Object notes;
    public String created_at;
}
