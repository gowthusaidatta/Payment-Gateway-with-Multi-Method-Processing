package com.paymentgateway.repository;

import com.paymentgateway.entity.Order;
import com.paymentgateway.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findByIdAndMerchant(String id, Merchant merchant);
    List<Order> findByMerchant(Merchant merchant);
}
