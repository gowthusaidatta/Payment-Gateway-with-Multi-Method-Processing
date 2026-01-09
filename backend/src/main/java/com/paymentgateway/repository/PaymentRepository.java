package com.paymentgateway.repository;

import com.paymentgateway.entity.Payment;
import com.paymentgateway.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByIdAndMerchant(String id, Merchant merchant);
    List<Payment> findByMerchant(Merchant merchant);
}
