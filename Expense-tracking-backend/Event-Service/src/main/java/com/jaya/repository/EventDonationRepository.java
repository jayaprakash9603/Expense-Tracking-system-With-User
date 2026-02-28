package com.jaya.repository;

import com.jaya.model.EventDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventDonationRepository extends JpaRepository<EventDonation, Integer> {

    List<EventDonation> findByEventIdAndUserId(Integer eventId, Integer userId);

    List<EventDonation> findByEventIdAndDonationDateBetween(Integer eventId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(ed.amount) FROM EventDonation ed WHERE ed.event.id = :eventId")
    BigDecimal getTotalDonationsByEventId(@Param("eventId") Integer eventId);

    @Query("SELECT ed.paymentMethod, SUM(ed.amount) FROM EventDonation ed WHERE ed.event.id = :eventId GROUP BY ed.paymentMethod")
    List<Object[]> getPaymentMethodWiseDonations(@Param("eventId") Integer eventId);
}