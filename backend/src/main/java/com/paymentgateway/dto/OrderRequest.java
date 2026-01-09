package com.paymentgateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderRequest {
    public Integer amount;
    public String currency;
    public String receipt;
    public Object notes;
}
